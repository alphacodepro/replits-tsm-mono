import { db } from "./db";
import { eq, and } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  Batch,
  InsertBatch,
  Student,
  InsertStudent,
  Payment,
  InsertPayment,
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export interface IStorage {
  // User/Auth methods
  createUser(user: InsertUser): Promise<User>;
  getUserById(userId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  verifyPassword(username: string, password: string): Promise<User | null>;
  getAllTeachers(): Promise<User[]>;
  updateUserStatus(userId: string, isActive: boolean): Promise<void>;
  updateUserPassword(userId: string, newPassword: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;

  // Batch methods
  createBatch(batch: InsertBatch): Promise<Batch>;
  getBatchesByTeacher(teacherId: string): Promise<Batch[]>;
  getBatchById(batchId: string): Promise<Batch | undefined>;
  getBatchByToken(token: string): Promise<Batch | undefined>;
  deleteBatch(batchId: string): Promise<void>;

  // Student methods
  createStudent(student: InsertStudent): Promise<Student>;
  getStudentsByBatch(batchId: string): Promise<Student[]>;
  getStudentById(studentId: string): Promise<Student | undefined>;
  getAllStudentsByTeacher(teacherId: string): Promise<Student[]>;
  deleteStudent(studentId: string): Promise<void>;

  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByStudent(studentId: string): Promise<Payment[]>;

  // Statistics
  getTeacherStats(teacherId: string): Promise<{ batchCount: number; studentCount: number }>;
  getSystemStats(): Promise<{ teacherCount: number; batchCount: number; studentCount: number }>;
}

export class DbStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, SALT_ROUNDS);
    const [user] = await db
      .insert(schema.users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async getUserById(userId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));
    return user;
  }

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getAllTeachers(): Promise<User[]> {
    return await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.role, "teacher"));
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    await db
      .update(schema.users)
      .set({ isActive })
      .where(eq(schema.users.id, userId));
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db
      .update(schema.users)
      .set({ password: hashedPassword })
      .where(eq(schema.users.id, userId));
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(schema.users).where(eq(schema.users.id, userId));
  }

  async createBatch(insertBatch: InsertBatch): Promise<Batch> {
    const registrationToken = randomUUID();
    const [batch] = await db
      .insert(schema.batches)
      .values({
        ...insertBatch,
        registrationToken,
      })
      .returning();
    return batch;
  }

  async getBatchesByTeacher(teacherId: string): Promise<Batch[]> {
    return await db
      .select()
      .from(schema.batches)
      .where(eq(schema.batches.teacherId, teacherId));
  }

  async getBatchById(batchId: string): Promise<Batch | undefined> {
    const [batch] = await db
      .select()
      .from(schema.batches)
      .where(eq(schema.batches.id, batchId));
    return batch;
  }

  async getBatchByToken(token: string): Promise<Batch | undefined> {
    const [batch] = await db
      .select()
      .from(schema.batches)
      .where(eq(schema.batches.registrationToken, token));
    return batch;
  }

  async deleteBatch(batchId: string): Promise<void> {
    await db.delete(schema.batches).where(eq(schema.batches.id, batchId));
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(schema.students)
      .values(insertStudent)
      .returning();
    return student;
  }

  async getStudentsByBatch(batchId: string): Promise<Student[]> {
    return await db
      .select()
      .from(schema.students)
      .where(eq(schema.students.batchId, batchId));
  }

  async getStudentById(studentId: string): Promise<Student | undefined> {
    const [student] = await db
      .select()
      .from(schema.students)
      .where(eq(schema.students.id, studentId));
    return student;
  }

  async getAllStudentsByTeacher(teacherId: string): Promise<Student[]> {
    const result = await db
      .select({ student: schema.students })
      .from(schema.students)
      .innerJoin(schema.batches, eq(schema.students.batchId, schema.batches.id))
      .where(eq(schema.batches.teacherId, teacherId));

    return result.map((row) => row.student);
  }

  async deleteStudent(studentId: string): Promise<void> {
    await db.delete(schema.students).where(eq(schema.students.id, studentId));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(schema.payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getPaymentsByStudent(studentId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.studentId, studentId));
  }

  async getTeacherStats(teacherId: string): Promise<{ batchCount: number; studentCount: number }> {
    const batches = await this.getBatchesByTeacher(teacherId);
    const students = await this.getAllStudentsByTeacher(teacherId);

    return {
      batchCount: batches.length,
      studentCount: students.length,
    };
  }

  async getSystemStats(): Promise<{ teacherCount: number; batchCount: number; studentCount: number }> {
    const teachers = await this.getAllTeachers();
    const allBatches = await db.select().from(schema.batches);
    const allStudents = await db.select().from(schema.students);

    return {
      teacherCount: teachers.length,
      batchCount: allBatches.length,
      studentCount: allStudents.length,
    };
  }
}

export const storage = new DbStorage();
