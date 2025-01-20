import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  qualifications: text("qualifications").notNull(),
  subjectsTaught: text("subjects_taught").notNull(),
  school: text("school").notNull(),
  lga: text("lga").notNull(),
  employmentDate: timestamp("employment_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: serial("user_id").references(() => users.id),
});

export const teacherDocuments = pgTable("teacher_documents", {
  id: serial("id").primaryKey(),
  teacherId: serial("teacher_id").references(() => teachers.id),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  filePath: text("file_path").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  documentType: text("document_type").notNull(), // e.g., "qualification", "certificate"
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertTeacherSchema = createInsertSchema(teachers);
export const selectTeacherSchema = createSelectSchema(teachers);
export const insertDocumentSchema = createInsertSchema(teacherDocuments);
export const selectDocumentSchema = createSelectSchema(teacherDocuments);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = typeof teachers.$inferInsert;
export type TeacherDocument = typeof teacherDocuments.$inferSelect;
export type InsertTeacherDocument = typeof teacherDocuments.$inferInsert;