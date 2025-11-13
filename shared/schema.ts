import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  fullName: text("full_name").notNull(),
  instituteName: text("institute_name"),
  email: text("email"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const batches = pgTable("batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teacherId: varchar("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  subject: text("subject"),
  fee: integer("fee").notNull(),
  feePeriod: text("fee_period").notNull(),
  registrationToken: text("registration_token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  standard: text("standard").notNull(),
  customFee: integer("custom_fee"),
  joinDate: timestamp("join_date").notNull().default(sql`now()`),
  lastActivityDate: timestamp("last_activity_date").notNull().default(sql`now()`),
}, (table) => ({
  batchPhoneUnique: uniqueIndex("students_batch_phone_unique").on(table.batchId, table.phone),
}));

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  paidAt: timestamp("paid_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBatchSchema = createInsertSchema(batches).omit({
  id: true,
  createdAt: true,
  registrationToken: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  lastActivityDate: true,
  joinDate: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  paidAt: true,
});

export const updateStudentSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  standard: z.string().min(1, "Standard is required"),
  customFee: z.number().int().positive().nullable().optional(),
  joinDate: z.string().datetime(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type UpdateStudent = z.infer<typeof updateStudentSchema>;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
