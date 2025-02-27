import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { teachers, teacherDocuments } from "@db/schema";
import { eq } from "drizzle-orm";
import fileUpload from "express-fileupload";
import path from "path";
import fs from "fs";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Configure file upload middleware
  app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  }));

  // Middleware to check if user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).send("Not authenticated");
  };

  // Middleware to check if user is admin
  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.isAdmin) return next();
    res.status(403).send("Not authorized");
  };

  // Create new teacher
  app.post("/api/teachers", requireAuth, async (req, res) => {
    try {
      // Extract only the fields we want to save
      const { name, email, qualifications, subjectsTaught, school, lga, employmentDate } = req.body;

      // Create the teacher with proper date handling
      const [newTeacher] = await db
        .insert(teachers)
        .values({
          name,
          email,
          qualifications,
          subjectsTaught,
          school,
          lga,
          employmentDate: new Date(employmentDate),
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: req.user.id,
        })
        .returning();

      res.status(201).json(newTeacher);
    } catch (error) {
      console.error("Teacher creation error:", error);
      res.status(500).json({ error: "Failed to create teacher", details: error.message });
    }
  });

  // Get all teachers
  app.get("/api/teachers", requireAuth, async (req, res) => {
    try {
      const allTeachers = await db.select().from(teachers);
      res.json(allTeachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ error: "Failed to fetch teachers" });
    }
  });

  // Get teacher by ID
  app.get("/api/teachers/:id", requireAuth, async (req, res) => {
    try {
      const [teacher] = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, parseInt(req.params.id)))
        .limit(1);

      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      res.json(teacher);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      res.status(500).json({ error: "Failed to fetch teacher" });
    }
  });

  // Update teacher
  app.put("/api/teachers/:id", requireAuth, async (req, res) => {
    try {
      const { name, email, qualifications, subjectsTaught, school, lga, employmentDate } = req.body;

      const [updatedTeacher] = await db
        .update(teachers)
        .set({
          name,
          email,
          qualifications,
          subjectsTaught,
          school,
          lga,
          employmentDate: new Date(employmentDate),
          updatedAt: new Date(),
        })
        .where(eq(teachers.id, parseInt(req.params.id)))
        .returning();

      if (!updatedTeacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      res.json(updatedTeacher);
    } catch (error) {
      console.error("Error updating teacher:", error);
      res.status(500).json({ error: "Failed to update teacher" });
    }
  });

  // Delete teacher
  app.delete("/api/teachers/:id", requireAdmin, async (req, res) => {
    try {
      await db
        .delete(teachers)
        .where(eq(teachers.id, parseInt(req.params.id)));

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      res.status(500).json({ error: "Failed to delete teacher" });
    }
  });

  // Upload document for teacher
  app.post("/api/teachers/:id/documents", requireAuth, async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: "No files were uploaded" });
      }

      const file = req.files.document as fileUpload.UploadedFile;
      const documentType = req.body.documentType;

      if (!documentType) {
        return res.status(400).json({ error: "Document type is required" });
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const ext = path.extname(file.name);
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
      const filepath = path.join(uploadDir, filename);

      // Move file to uploads directory
      await file.mv(filepath);

      // Save document info to database
      const [document] = await db
        .insert(teacherDocuments)
        .values({
          teacherId,
          fileName: file.name,
          fileType: file.mimetype,
          filePath: filename,
          documentType,
        })
        .returning();

      res.status(201).json(document);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  // Get teacher documents
  app.get("/api/teachers/:id/documents", requireAuth, async (req, res) => {
    try {
      const documents = await db
        .select()
        .from(teacherDocuments)
        .where(eq(teacherDocuments.teacherId, parseInt(req.params.id)));

      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}