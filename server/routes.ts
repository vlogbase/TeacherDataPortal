import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { teachers } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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

  // Get all teachers
  app.get("/api/teachers", requireAuth, async (req, res) => {
    try {
      const allTeachers = await db.select().from(teachers);
      res.json(allTeachers);
    } catch (error) {
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
      res.status(500).json({ error: "Failed to fetch teacher" });
    }
  });

  // Create new teacher
  app.post("/api/teachers", requireAuth, async (req, res) => {
    try {
      const [newTeacher] = await db
        .insert(teachers)
        .values({
          ...req.body,
          userId: req.user.id,
        })
        .returning();
      
      res.status(201).json(newTeacher);
    } catch (error) {
      res.status(500).json({ error: "Failed to create teacher" });
    }
  });

  // Update teacher
  app.put("/api/teachers/:id", requireAuth, async (req, res) => {
    try {
      const [updatedTeacher] = await db
        .update(teachers)
        .set({
          ...req.body,
          updatedAt: new Date(),
        })
        .where(eq(teachers.id, parseInt(req.params.id)))
        .returning();
      
      if (!updatedTeacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      
      res.json(updatedTeacher);
    } catch (error) {
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
      res.status(500).json({ error: "Failed to delete teacher" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
