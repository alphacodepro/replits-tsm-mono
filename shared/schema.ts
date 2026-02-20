import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  fullName: text("full_name").notNull(),
  instituteName: text("institute_name"),
  email: text("email").unique(),
  phone: text("phone").unique(),
  isActive: boolean("is_active").notNull().default(true),
  hasAcceptedTerms: boolean("has_accepted_terms").notNull().default(false),
  acceptedAt: timestamp("accepted_at"),
  acceptedVersion: text("accepted_version"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
});

export const batches = pgTable("batches", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  subject: text("subject"),
  standard: text("standard").notNull(),
  fee: integer("fee").notNull(),
  feePeriod: text("fee_period").notNull(),
  registrationToken: text("registration_token").notNull().unique(),
  registrationEnabled: boolean("registration_enabled").notNull().default(true),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
});

export const students = pgTable(
  "students",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    batchId: varchar("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    standard: text("standard").notNull(),
    customFee: integer("custom_fee"),
    joinDate: timestamp("join_date")
      .notNull()
      .default(sql`now()`),
    lastActivityDate: timestamp("last_activity_date")
      .notNull()
      .default(sql`now()`),
    // Additional student details
    guardianName: text("guardian_name"),
    guardianPhone: text("guardian_phone"),
    schoolName: text("school_name"),
    city: text("city"),
    dateOfBirth: timestamp("date_of_birth"),
    notes: text("notes"),
  },
  (table) => ({
    batchPhoneUnique: uniqueIndex("students_batch_phone_unique").on(
      table.batchId,
      table.phone,
    ),
    batchIdIdx: index("students_batch_id_idx").on(table.batchId),
  }),
);

export const payments = pgTable("payments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  studentId: varchar("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  paymentMethod: text("payment_method"),
  paidAt: timestamp("paid_at")
    .notNull()
    .default(sql`now()`),
  modifiedAt: timestamp("modified_at"),
}, (table) => ({
  studentIdIdx: index("payments_student_id_idx").on(table.studentId),
  paidAtIdx: index("payments_paid_at_idx").on(table.paidAt),
}));

/* -------------------------------------------
   VALIDATION RULES
------------------------------------------- */

// Reusable validation
const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

const emailOptionalSchema = z
  .string()
  .email("Invalid email")
  .optional()
  .or(z.literal("")); // allow empty (for teachers/admins)

const emailRequiredSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format");

const positiveAmount = z
  .number({
    invalid_type_error: "Amount must be a number",
  })
  .positive("Amount must be positive");

// ------------------- USERS -------------------

export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    password: z.string().min(4, "Password must be at least 4 characters"),
    email: emailOptionalSchema,
    phone: phoneSchema.optional(),
  });

// ------------------- BATCHES -------------------

export const insertBatchSchema = createInsertSchema(batches)
  .omit({
    id: true,
    createdAt: true,
    registrationToken: true,
  })
  .extend({
    fee: positiveAmount,
  });

// ------------------- STUDENTS -------------------

export const insertStudentSchema = createInsertSchema(students)
  .omit({
    id: true,
    lastActivityDate: true,
    joinDate: true,
  })
  .extend({
    fullName: z.string().min(1, "Full name is required"),
    phone: phoneSchema,
    email: emailRequiredSchema,
    customFee: positiveAmount.optional().nullable(),
    // Additional optional fields with string validation
    guardianName: z.string().max(100).optional().nullable(),
    guardianPhone: z.string().regex(/^(\d{10})?$/, "Guardian phone must be 10 digits or empty").optional().nullable(),
    schoolName: z.string().max(150).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    dateOfBirth: z.string().datetime().optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  });

// ------------------- PAYMENTS -------------------

// Predefined payment methods for dropdown suggestions
export const PREDEFINED_PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Cheque",
  "Online",
] as const;

// Payment method can be any string up to 40 chars (predefined or custom)
export const paymentMethodSchema = z.string()
  .max(40, "Payment method must be 40 characters or less")
  .transform(val => val.trim())
  .optional()
  .nullable();

export const insertPaymentSchema = createInsertSchema(payments)
  .omit({
    id: true,
    paidAt: true,
    modifiedAt: true,
  })
  .extend({
    amount: positiveAmount,
    paymentMethod: paymentMethodSchema,
    paidAt: z.string().datetime().optional(),
  });

// Schema for updating payment (amount and method only)
export const updatePaymentSchema = z.object({
  amount: positiveAmount,
  paymentMethod: paymentMethodSchema,
});

// ------------------- UPDATE STUDENTS -------------------

// Guardian phone allows empty or valid 10-digit
const guardianPhoneSchema = z
  .string()
  .regex(/^(\d{10})?$/, "Guardian phone must be 10 digits or empty")
  .optional()
  .nullable()
  .or(z.literal(""));

export const updateStudentSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  phone: phoneSchema,
  email: emailRequiredSchema,
  standard: z.string().min(1, "Standard is required"),
  customFee: positiveAmount.optional().nullable(),
  joinDate: z.string().datetime(),
  // Additional details
  guardianName: z.string().max(100).optional().nullable().or(z.literal("")),
  guardianPhone: guardianPhoneSchema,
  schoolName: z.string().max(150).optional().nullable().or(z.literal("")),
  city: z.string().max(100).optional().nullable().or(z.literal("")),
  dateOfBirth: z.string().datetime().optional().nullable(),
  notes: z.string().max(1000).optional().nullable().or(z.literal("")),
});

/* -------------------------------------------
   TYPES
------------------------------------------- */

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type UpdateStudent = z.infer<typeof updateStudentSchema>;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type UpdatePayment = z.infer<typeof updatePaymentSchema>;
export type Payment = typeof payments.$inferSelect;

/* -------------------------------------------
   PAGINATION TYPES
------------------------------------------- */

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardSummary {
  batchCount: number;
  studentCount: number;
  totalCollected: number;
  totalPending: number;
}
