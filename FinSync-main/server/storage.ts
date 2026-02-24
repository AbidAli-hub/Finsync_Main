import { 
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

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // GST Returns operations
  getGstReturns(userId: string): Promise<GstReturn[]>;
  createGstReturn(gstReturn: InsertGstReturn & { userId: string }): Promise<GstReturn>;
  updateGstReturn(id: string, updates: Partial<GstReturn>): Promise<GstReturn | undefined>;

  // Invoice operations
  getInvoices(userId: string): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice & { userId: string }): Promise<Invoice>;
  getInvoiceById(id: string): Promise<Invoice | undefined>;

  // File operations
  getUploadedFiles(userId: string): Promise<UploadedFile[]>;
  createUploadedFile(file: InsertUploadedFile & { userId: string }): Promise<UploadedFile>;
  updateUploadedFile(id: string, updates: Partial<UploadedFile>): Promise<UploadedFile | undefined>;

  // Download history operations
  getDownloadHistory(userId: string): Promise<DownloadHistory[]>;
  createDownloadHistory(download: InsertDownloadHistory & { userId: string }): Promise<DownloadHistory>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private gstReturns: Map<string, GstReturn> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private uploadedFiles: Map<string, UploadedFile> = new Map();
  private downloadHistory: Map<string, DownloadHistory> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const sampleUser: User = {
      id: "user-1",
      email: "demo@example.com",
      name: "John Doe",
      company: "Tech Corp",
      avatar: "/api/placeholder/40/40",
      password: "password",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(sampleUser.id, sampleUser);

    // Create sample GST returns
    const sampleReturns: GstReturn[] = [
      {
        id: "return-1",
        userId: sampleUser.id,
        returnType: "GSTR-1",
        period: "03-2024",
        status: "Filed",
        totalTax: "245680",
        filedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "return-2",
        userId: sampleUser.id,
        returnType: "GSTR-3B",
        period: "04-2024",
        status: "Pending",
        totalTax: "0",
        filedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    sampleReturns.forEach(ret => this.gstReturns.set(ret.id, ret));

    // Create sample invoices
    const sampleInvoices: Invoice[] = [
      {
        id: "invoice-1",
        userId: sampleUser.id,
        invoiceNumber: "INV-2024-001",
        gstin: "29AABCT1332L000",
        buyerName: "ABC Company Ltd",
        amount: "50000",
        taxAmount: "9000",
        hsnCode: "8517",
        status: "processed",
        fileName: "invoice_001.pdf",
        createdAt: new Date(),
      },
      {
        id: "invoice-2",
        userId: sampleUser.id,
        invoiceNumber: "INV-2024-002",
        gstin: "29AABCT1332L000",
        buyerName: "XYZ Enterprises",
        amount: "75000",
        taxAmount: "13500",
        hsnCode: "8471",
        status: "processed",
        fileName: "invoice_002.pdf",
        createdAt: new Date(),
      }
    ];
    sampleInvoices.forEach(inv => this.invoices.set(inv.id, inv));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // GST Returns operations
  async getGstReturns(userId: string): Promise<GstReturn[]> {
    return Array.from(this.gstReturns.values()).filter(ret => ret.userId === userId);
  }

  async createGstReturn(gstReturn: InsertGstReturn & { userId: string }): Promise<GstReturn> {
    const id = randomUUID();
    const newReturn: GstReturn = {
      ...gstReturn,
      id,
      filedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.gstReturns.set(id, newReturn);
    return newReturn;
  }

  async updateGstReturn(id: string, updates: Partial<GstReturn>): Promise<GstReturn | undefined> {
    const gstReturn = this.gstReturns.get(id);
    if (!gstReturn) return undefined;

    const updatedReturn = { ...gstReturn, ...updates, updatedAt: new Date() };
    this.gstReturns.set(id, updatedReturn);
    return updatedReturn;
  }

  // Invoice operations
  async getInvoices(userId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(inv => inv.userId === userId);
  }

  async createInvoice(invoice: InsertInvoice & { userId: string }): Promise<Invoice> {
    const id = randomUUID();
    const newInvoice: Invoice = {
      ...invoice,
      id,
      status: "processed",
      createdAt: new Date(),
    };
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  // File operations
  async getUploadedFiles(userId: string): Promise<UploadedFile[]> {
    return Array.from(this.uploadedFiles.values()).filter(file => file.userId === userId);
  }

  async createUploadedFile(file: InsertUploadedFile & { userId: string }): Promise<UploadedFile> {
    const id = randomUUID();
    const newFile: UploadedFile = {
      ...file,
      id,
      status: "processing",
      createdAt: new Date(),
    };
    this.uploadedFiles.set(id, newFile);
    return newFile;
  }

  async updateUploadedFile(id: string, updates: Partial<UploadedFile>): Promise<UploadedFile | undefined> {
    const file = this.uploadedFiles.get(id);
    if (!file) return undefined;

    const updatedFile = { ...file, ...updates };
    this.uploadedFiles.set(id, updatedFile);
    return updatedFile;
  }

  async getDownloadHistory(userId: string): Promise<DownloadHistory[]> {
    return Array.from(this.downloadHistory.values())
      .filter(download => download.userId === userId)
      .sort((a, b) => {
        const dateA = a.downloadedAt ? new Date(a.downloadedAt).getTime() : 0;
        const dateB = b.downloadedAt ? new Date(b.downloadedAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async deleteDownloadHistory(id: string): Promise<boolean> {
    return this.downloadHistory.delete(id);
  }

  async createDownloadHistory(download: InsertDownloadHistory & { userId: string }): Promise<DownloadHistory> {
    const id = randomUUID();
    const newDownload: DownloadHistory = {
      id,
      userId: download.userId,
      filename: download.filename,
      fileType: download.fileType || 'excel',
      invoicesCount: download.invoicesCount || '0',
      fileSize: download.fileSize || null,
      downloadedAt: new Date(),
    };
    
    this.downloadHistory.set(id, newDownload);
    return newDownload;
  }
}

export const storage = new MemStorage();
