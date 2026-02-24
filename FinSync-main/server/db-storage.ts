import { eq, desc } from "drizzle-orm";
import { getDatabase } from "./db";
import { 
  users, 
  gstReturns, 
  invoices, 
  uploadedFiles, 
  downloadHistory,
  type User, 
  type InsertUser, 
  type GstReturn, 
  type InsertGstReturn,
  type Invoice,
  type InsertInvoice,
  type UploadedFile,
  type InsertUploadedFile,
  type DownloadHistory,
  type InsertDownloadHistory
} from "@shared/schema";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";
import bcrypt from "bcrypt";

export class DatabaseStorage implements IStorage {
  private async getDb() {
    const database = await getDatabase();
    return database.db;
  }
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const db = await this.getDb();
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const db = await this.getDb();
      // Try to select all fields first (including phone)
      try {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0];
      } catch (error) {
        // If phone column doesn't exist, fall back to select without phone
        if (error.message && error.message.includes('Unknown column') && error.message.includes('phone')) {
          console.log('⚠️  Phone column not found, using fallback query');
          // Fallback query without phone column
          const result = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            company: users.company,
            avatar: users.avatar,
            password: users.password,
            isActive: users.isActive,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
          }).from(users).where(eq(users.email, email)).limit(1);
          return result[0];
        }
        throw error;
      }
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(insertUser.password, 10);
      
      const newUser = {
        id: randomUUID(),
        ...insertUser,
        password: hashedPassword,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const db = await this.getDb();
      
      // Try to insert with all fields first (including phone)
      try {
        await db.insert(users).values(newUser);
      } catch (error) {
        // If phone column doesn't exist, fall back to insert without phone
        if (error.message && error.message.includes('Unknown column') && error.message.includes('phone')) {
          console.log('⚠️  Phone column not found, using fallback insert');
          // Fallback insert without phone column
          const fallbackUser = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            company: newUser.company,
            avatar: newUser.avatar,
            password: newUser.password,
            isActive: newUser.isActive,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
          };
          await db.insert(users).values(fallbackUser);
        } else {
          throw error;
        }
      }
      
      // For MySQL, we need to fetch the user after insert
      const result = await db.select().from(users).where(eq(users.email, newUser.email)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Generate a default phone number based on timestamp and random number
  private generateDefaultPhone(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `+91 ${timestamp.slice(0, 4)} ${timestamp.slice(4)}${random.slice(0, 2)}`;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      const db = await this.getDb();
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id));
      
      // For MySQL, fetch the updated user
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      console.log('🔐 Starting password verification for email:', email);
      
      const user = await this.getUserByEmail(email);
      
      if (!user) {
        console.log('❌ User not found for email:', email);
        return null;
      }
      
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        name: user.name,
        hasPassword: !!user.password,
        passwordLength: user.password?.length || 0,
        passwordPrefix: user.password?.substring(0, 10) || 'none'
      });
      
      if (!user.password) {
        console.log('❌ User has no password hash stored');
        return null;
      }
      
      console.log('🔑 Comparing password with hash...');
      console.log('Input password length:', password.length);
      console.log('Stored hash type:', user.password.substring(0, 4));
      
      const isValid = await bcrypt.compare(password, user.password);
      
      console.log('🔍 Password comparison result:', isValid ? '✅ VALID' : '❌ INVALID');
      
      if (!isValid) {
        console.log('📋 Debug info:');
        console.log('- Input password:', password.replace(/./g, '*'));
        console.log('- Hash starts with:', user.password.substring(0, 7));
        console.log('- Hash length:', user.password.length);
      }
      
      return isValid ? user : null;
    } catch (error) {
      console.error('💥 Error in verifyPassword:', {
        message: error.message,
        stack: error.stack,
        email: email
      });
      return null;
    }
  }

  // GST Returns operations
  async getGstReturns(userId: string): Promise<GstReturn[]> {
    try {
      const db = await this.getDb();
      const result = await db
        .select()
        .from(gstReturns)
        .where(eq(gstReturns.userId, userId))
        .orderBy(desc(gstReturns.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error getting GST returns:', error);
      return [];
    }
  }

  async createGstReturn(gstReturn: InsertGstReturn & { userId: string }): Promise<GstReturn> {
    try {
      const newReturn = {
        id: randomUUID(),
        ...gstReturn,
        filedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const db = await this.getDb();
      await db.insert(gstReturns).values(newReturn);
      // For MySQL, fetch the created return
      const result = await db.select().from(gstReturns).where(eq(gstReturns.id, newReturn.id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error creating GST return:', error);
      throw new Error('Failed to create GST return');
    }
  }

  async updateGstReturn(id: string, updates: Partial<GstReturn>): Promise<GstReturn | undefined> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      const db = await this.getDb();
      await db
        .update(gstReturns)
        .set(updateData)
        .where(eq(gstReturns.id, id));
      
      // For MySQL, fetch the updated return
      const result = await db.select().from(gstReturns).where(eq(gstReturns.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error updating GST return:', error);
      return undefined;
    }
  }

  // Invoice operations
  async getInvoices(userId: string): Promise<Invoice[]> {
    try {
      const db = await this.getDb();
      const result = await db
        .select()
        .from(invoices)
        .where(eq(invoices.userId, userId))
        .orderBy(desc(invoices.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error getting invoices:', error);
      return [];
    }
  }

  async createInvoice(invoice: InsertInvoice & { userId: string }): Promise<Invoice> {
    try {
      const newInvoice = {
        id: randomUUID(),
        ...invoice,
        status: "processed",
        createdAt: new Date(),
      };

      const db = await this.getDb();
      await db.insert(invoices).values(newInvoice);
      // For MySQL, fetch the created invoice
      const result = await db.select().from(invoices).where(eq(invoices.id, newInvoice.id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    try {
      const db = await this.getDb();
      const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting invoice by ID:', error);
      return undefined;
    }
  }

  // File operations
  async getUploadedFiles(userId: string): Promise<UploadedFile[]> {
    try {
      const db = await this.getDb();
      const result = await db
        .select()
        .from(uploadedFiles)
        .where(eq(uploadedFiles.userId, userId))
        .orderBy(desc(uploadedFiles.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error getting uploaded files:', error);
      return [];
    }
  }

  async createUploadedFile(file: InsertUploadedFile & { userId: string }): Promise<UploadedFile> {
    try {
      const newFile = {
        id: randomUUID(),
        ...file,
        status: "processing",
        createdAt: new Date(),
      };

      const db = await this.getDb();
      await db.insert(uploadedFiles).values(newFile);
      // For MySQL, fetch the created file
      const result = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, newFile.id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error creating uploaded file:', error);
      throw new Error('Failed to create uploaded file');
    }
  }

  async updateUploadedFile(id: string, updates: Partial<UploadedFile>): Promise<UploadedFile | undefined> {
    try {
      const db = await this.getDb();
      await db
        .update(uploadedFiles)
        .set(updates)
        .where(eq(uploadedFiles.id, id));
      
      // For MySQL, fetch the updated file
      const result = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error updating uploaded file:', error);
      return undefined;
    }
  }

  // Download history operations
  async getDownloadHistory(userId: string): Promise<DownloadHistory[]> {
    try {
      const db = await this.getDb();
      const result = await db
        .select()
        .from(downloadHistory)
        .where(eq(downloadHistory.userId, userId))
        .orderBy(desc(downloadHistory.downloadedAt));
      
      return result;
    } catch (error) {
      console.error('Error getting download history:', error);
      return [];
    }
  }

  async createDownloadHistory(download: InsertDownloadHistory & { userId: string }): Promise<DownloadHistory> {
    try {
      const newDownload = {
        id: randomUUID(),
        userId: download.userId,
        filename: download.filename,
        fileType: download.fileType || 'excel',
        invoicesCount: download.invoicesCount || '0',
        fileSize: download.fileSize || null,
        downloadedAt: new Date(),
      };

      const db = await this.getDb();
      await db.insert(downloadHistory).values(newDownload);
      // For MySQL, fetch the created download history
      const result = await db.select().from(downloadHistory).where(eq(downloadHistory.id, newDownload.id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error creating download history:', error);
      throw new Error('Failed to create download history');
    }
  }

  async deleteDownloadHistory(id: string): Promise<boolean> {
    try {
      const db = await this.getDb();
      const result = await db.delete(downloadHistory).where(eq(downloadHistory.id, id));
      // For MySQL, check if any rows were affected
      return result && result.length !== undefined ? result.length > 0 : true;
    } catch (error) {
      console.error('Error deleting download history:', error);
      return false;
    }
  }
}