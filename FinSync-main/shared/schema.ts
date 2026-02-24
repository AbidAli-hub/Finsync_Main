import { sql } from "drizzle-orm";
import { mysqlTable, varchar, boolean, timestamp, text } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  phone: varchar("phone", { length: 20 }), // Add phone number field
  avatar: text("avatar"),
  password: varchar("password", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const gstReturns = mysqlTable("gst_returns", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  returnType: varchar("return_type", { length: 50 }).notNull(), // GSTR-1, GSTR-3B, etc.
  period: varchar("period", { length: 20 }).notNull(), // MM-YYYY
  status: varchar("status", { length: 50 }).notNull(), // Filed, Pending, Draft
  totalTax: varchar("total_tax", { length: 50 }),
  filedAt: timestamp("filed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const invoices = mysqlTable("invoices", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull(),
  gstin: varchar("gstin", { length: 50 }),
  buyerName: varchar("buyer_name", { length: 255 }),
  amount: varchar("amount", { length: 50 }),
  taxAmount: varchar("tax_amount", { length: 50 }),
  hsnCode: varchar("hsn_code", { length: 50 }),
  status: varchar("status", { length: 50 }).default("processed"), // processed, error, pending
  fileName: varchar("file_name", { length: 255 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const uploadedFiles = mysqlTable("uploaded_files", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: varchar("file_size", { length: 50 }),
  fileType: varchar("file_type", { length: 100 }),
  status: varchar("status", { length: 50 }).default("processing"), // processing, completed, error
  extractedData: text("extracted_data"), // JSON string of extracted data
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const downloadHistory = mysqlTable("download_history", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id).notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull().default("excel"),
  invoicesCount: varchar("invoices_count", { length: 20 }).default("0"),
  downloadedAt: timestamp("downloaded_at").default(sql`CURRENT_TIMESTAMP`),
  fileSize: varchar("file_size", { length: 50 }),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  company: true,
  phone: true, // Add phone to insert schema
  password: true,
}).partial({
  company: true,
  phone: true, // Make phone optional
});

export const insertGstReturnSchema = createInsertSchema(gstReturns).pick({
  returnType: true,
  period: true,
  status: true,
  totalTax: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  invoiceNumber: true,
  gstin: true,
  buyerName: true,
  amount: true,
  taxAmount: true,
  hsnCode: true,
  fileName: true,
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).pick({
  fileName: true,
  fileSize: true,
  fileType: true,
  extractedData: true,
});

export const insertDownloadHistorySchema = createInsertSchema(downloadHistory).pick({
  filename: true,
  fileType: true,
  invoicesCount: true,
  fileSize: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type GstReturn = typeof gstReturns.$inferSelect;
export type InsertGstReturn = z.infer<typeof insertGstReturnSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;

export type DownloadHistory = typeof downloadHistory.$inferSelect;
export type InsertDownloadHistory = z.infer<typeof insertDownloadHistorySchema>;
