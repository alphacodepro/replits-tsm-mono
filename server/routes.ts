import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { rateLimit } from "express-rate-limit";
import { insertUserSchema, insertBatchSchema, insertStudentSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId: string;
    role: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "tuition-management-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  const requireRole = (role: string) => {
    return (req: Request, res: Response, next: Function) => {
      if (req.session.role !== role) {
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    };
  };

  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.verifyPassword(username, password);

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "Account is inactive" });
      }

      req.session.userId = user.id;
      req.session.role = user.role;

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserById(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Teacher routes
  app.post("/api/teachers", requireAuth, requireRole("superadmin"), async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse({ ...req.body, role: "teacher" });
      const teacher = await storage.createUser(userData);
      const { password: _, ...teacherWithoutPassword } = teacher;
      res.json({ teacher: teacherWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create teacher error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/teachers", requireAuth, requireRole("superadmin"), async (req: Request, res: Response) => {
    try {
      const teachers = await storage.getAllTeachers();
      const teachersWithStats = await Promise.all(
        teachers.map(async (teacher) => {
          const stats = await storage.getTeacherStats(teacher.id);
          const { password: _, ...teacherWithoutPassword } = teacher;
          return {
            ...teacherWithoutPassword,
            ...stats,
          };
        })
      );
      res.json({ teachers: teachersWithStats });
    } catch (error) {
      console.error("Get teachers error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/teachers/:id/status", requireAuth, requireRole("superadmin"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      await storage.updateUserStatus(id, isActive);
      res.json({ success: true });
    } catch (error) {
      console.error("Update teacher status error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/teachers/:id", requireAuth, requireRole("superadmin"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete teacher error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Batch routes
  app.post("/api/batches", requireAuth, requireRole("teacher"), async (req: Request, res: Response) => {
    try {
      const batchData = insertBatchSchema.parse({
        ...req.body,
        teacherId: req.session.userId,
      });
      const batch = await storage.createBatch(batchData);
      res.json({ batch });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create batch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/batches", requireAuth, requireRole("teacher"), async (req: Request, res: Response) => {
    try {
      const batches = await storage.getBatchesByTeacher(req.session.userId!);
      const batchesWithStudentCount = await Promise.all(
        batches.map(async (batch) => {
          const students = await storage.getStudentsByBatch(batch.id);
          return {
            ...batch,
            studentCount: students.length,
          };
        })
      );
      res.json({ batches: batchesWithStudentCount });
    } catch (error) {
      console.error("Get batches error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/batches/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const batch = await storage.getBatchById(id);

      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }

      if (req.session.role === "teacher" && batch.teacherId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const students = await storage.getStudentsByBatch(id);
      
      const studentsWithPayments = await Promise.all(
        students.map(async (student) => {
          const payments = await storage.getPaymentsByStudent(student.id);
          const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
          
          const joinMonths = Math.ceil(
            (new Date().getTime() - new Date(student.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
          );
          const expectedTotal = batch.feePeriod === "month" ? batch.fee * joinMonths : batch.fee;
          const totalDue = Math.max(0, expectedTotal - totalPaid);
          
          return {
            ...student,
            totalPaid,
            totalDue,
          };
        })
      );
      
      res.json({ batch, students: studentsWithPayments });
    } catch (error) {
      console.error("Get batch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/batches/:id", requireAuth, requireRole("teacher"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const batch = await storage.getBatchById(id);

      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }

      if (batch.teacherId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deleteBatch(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete batch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Student routes
  app.post("/api/students", requireAuth, requireRole("teacher"), async (req: Request, res: Response) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const batch = await storage.getBatchById(studentData.batchId);

      if (!batch || batch.teacherId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const student = await storage.createStudent(studentData);
      res.json({ student });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create student error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Rate limiter for registration endpoint - allows bursts while preventing abuse
  const registrationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 300, // Allow 300 requests per minute per IP (handles concurrent registration bursts)
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many registration attempts. Please try again in a moment." },
    skip: (req) => {
      // Skip rate limiting for authenticated users (teachers adding students manually)
      return !!req.session?.userId;
    }
  });

  // Public student registration route
  app.post("/api/register/:token", registrationLimiter, async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const batch = await storage.getBatchByToken(token);

      if (!batch) {
        return res.status(404).json({ error: "Invalid registration link" });
      }

      const studentData = insertStudentSchema.parse({
        ...req.body,
        batchId: batch.id,
      });

      const student = await storage.createStudent(studentData);
      res.json({ student, batchName: batch.name });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Register student error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/register/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const batch = await storage.getBatchByToken(token);

      if (!batch) {
        return res.status(404).json({ error: "Invalid registration link" });
      }

      // Get teacher's institute name
      const teacher = await storage.getUserById(batch.teacherId);
      const instituteName = teacher?.instituteName || "Tuition Center";

      res.json({ batch, instituteName });
    } catch (error) {
      console.error("Get registration info error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/students/:id", requireAuth, requireRole("teacher"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const student = await storage.getStudentById(id);

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      const batch = await storage.getBatchById(student.batchId);
      if (!batch || batch.teacherId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const payments = await storage.getPaymentsByStudent(id);
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

      res.json({ student, payments, totalPaid });
    } catch (error) {
      console.error("Get student error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/students/:id", requireAuth, requireRole("teacher"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const student = await storage.getStudentById(id);

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      const batch = await storage.getBatchById(student.batchId);
      if (!batch || batch.teacherId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deleteStudent(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete student error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Payment routes
  app.post("/api/payments", requireAuth, requireRole("teacher"), async (req: Request, res: Response) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const student = await storage.getStudentById(paymentData.studentId);

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      const batch = await storage.getBatchById(student.batchId);
      if (!batch || batch.teacherId !== req.session.userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Validate payment amount doesn't exceed remaining balance
      const payments = await storage.getPaymentsByStudent(student.id);
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      
      // Calculate expected total fee based on period and join date
      let expectedTotalFee = batch.fee;
      if (batch.feePeriod === "month") {
        const joinMonths = Math.ceil(
          (new Date().getTime() - new Date(student.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        expectedTotalFee = batch.fee * joinMonths;
      }
      
      const remaining = expectedTotalFee - totalPaid;

      if (paymentData.amount <= 0) {
        return res.status(400).json({ error: "Payment amount must be greater than 0" });
      }

      if (paymentData.amount > remaining) {
        return res.status(400).json({ 
          error: `Payment amount (₹${paymentData.amount}) exceeds remaining balance (₹${remaining})` 
        });
      }

      const payment = await storage.createPayment(paymentData);
      res.json({ payment });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create payment error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Statistics routes
  app.get("/api/stats/teacher", requireAuth, requireRole("teacher"), async (req: Request, res: Response) => {
    try {
      const batches = await storage.getBatchesByTeacher(req.session.userId!);
      const students = await storage.getAllStudentsByTeacher(req.session.userId!);

      let totalCollected = 0;
      let totalPending = 0;

      for (const student of students) {
        const payments = await storage.getPaymentsByStudent(student.id);
        const paid = payments.reduce((sum, p) => sum + p.amount, 0);
        totalCollected += paid;

        const batch = await storage.getBatchById(student.batchId);
        if (batch) {
          const joinMonths = Math.ceil(
            (new Date().getTime() - new Date(student.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
          );
          const expectedTotal = batch.feePeriod === "month" ? batch.fee * joinMonths : batch.fee;
          const pending = Math.max(0, expectedTotal - paid);
          totalPending += pending;
        }
      }

      res.json({
        batchCount: batches.length,
        studentCount: students.length,
        feesCollected: totalCollected,
        pendingPayments: totalPending,
      });
    } catch (error) {
      console.error("Get teacher stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/stats/system", requireAuth, requireRole("superadmin"), async (req: Request, res: Response) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error("Get system stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
