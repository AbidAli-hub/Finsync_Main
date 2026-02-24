import type { Express } from "express";
import { createServer, type Server } from "http";
import { insertUserSchema, insertInvoiceSchema, insertUploadedFileSchema, insertDownloadHistorySchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";
import { createProxyMiddleware } from "http-proxy-middleware";
import fs from "fs";
import path from "path";
import { createGovernmentPortalService } from "./services/government-portal";
import sharp from "sharp";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, JPG, Excel, and CSV files are allowed.'));
    }
  }
});

// Configure multer specifically for avatar uploads
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for avatars
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files for avatars
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars.'));
    }
  }
});

// Lazy load the database storage to avoid early initialization
let storage: any = null;
async function getStorage() {
  if (!storage) {
    const { DatabaseStorage } = await import('./db-storage');
    storage = new DatabaseStorage();
  }
  return storage;
}

// Initialize government portal service
const governmentPortal = createGovernmentPortalService();

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure temp_uploads directory exists
  const fs = await import('fs');
  const tempDir = 'temp_uploads';
  try {
    await fs.promises.access(tempDir);
  } catch {
    await fs.promises.mkdir(tempDir, { recursive: true });
  }

  // GST extraction endpoint - direct Python integration with database storage
  app.post('/api/extract-gst', upload.array('files'), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { userId } = req.body; // Get userId from request body
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      // Check if Google API key is configured
      if (!process.env.GOOGLE_API_KEY && !process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: 'Google API key not configured. Please set GOOGLE_API_KEY environment variable.',
          setup_instructions: 'Get your API key from https://makersuite.google.com/app/apikey'
        });
      }
      
      const storage = await getStorage();
      
      // Process each file and collect all data
      const allInvoices: any[] = [];
      const processedFiles: any[] = [];
      
      for (const file of files) {
        // Store uploaded file record in database
        const uploadedFile = await storage.createUploadedFile({
          userId,
          fileName: file.originalname,
          fileSize: file.size.toString(),
          fileType: file.mimetype,
          extractedData: '{}' // Will be updated after processing
        });
        
        processedFiles.push(uploadedFile);
        
        // Ensure temp_uploads directory exists in python_backend
        const tempDir = path.join(process.cwd(), 'python_backend', 'temp_uploads');
        try {
          await fs.promises.access(tempDir);
        } catch {
          await fs.promises.mkdir(tempDir, { recursive: true });
        }
        
        // Save uploaded file temporarily with better naming
        const timestamp = Date.now();
        const tempPath = path.join(tempDir, `${timestamp}_${file.originalname}`);
        await fs.promises.writeFile(tempPath, file.buffer);
        
        console.log(`[FILE] Saved file to: ${tempPath} (${file.buffer.length} bytes)`);
        
        // Process file with Python backend
        const { spawn } = await import('child_process');
        // Use 'python' for Windows compatibility
        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
        const pythonProcess = spawn(pythonCommand, [
          'simple_server.py',
          tempPath
        ], {
          cwd: path.join(process.cwd(), 'python_backend'),
          env: { 
            ...process.env, 
            PYTHONPATH: `${path.join(process.cwd(), 'python_backend')}:${process.env.PYTHONPATH || ''}` 
          },
          shell: process.platform === 'win32' // Enable shell on Windows
        });
        
        let output = '';
        let errorOutput = '';
        
        await new Promise<void>((resolve, reject) => {
          pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
          });
          
          pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
          
          pythonProcess.on('close', async (code) => {
            console.log(`[PYTHON] Python process finished with code: ${code}`);
            console.log('[OUTPUT] Full Python output:', output);
            console.log('[ERROR] Python process errors:', errorOutput);
            
            // Delay cleanup to ensure Python process completed file reading
            setTimeout(async () => {
              try {
                await fs.promises.unlink(tempPath);
                console.log(`[CLEANUP] Cleaned up temp file: ${tempPath}`);
              } catch (e) {
                console.log(`[CLEANUP] Failed to cleanup temp file: ${tempPath}`);
              }
            }, 2000); // 2 second delay
            
            if (code === 0) {
              try {
                console.log(`[DEBUG] Full Python output: ${output}`);
                console.log(`[DEBUG] Python errors: ${errorOutput}`);
                
                // Look for the JSON result in the output with improved parsing
                const resultMatch = output.match(/\[RESULT\]\s*({[^}]*(?:{[^}]*}[^}]*)*})/);
                if (resultMatch) {
                  try {
                    const result = JSON.parse(resultMatch[1]);
                    console.log(`[DEBUG] Parsed result: ${JSON.stringify(result)}`);
                    
                    if (result.success) {
                      // Update uploaded file with extracted data
                      await storage.updateUploadedFile(uploadedFile.id, {
                        status: 'completed',
                        extractedData: JSON.stringify(result)
                      });
                      
                      // Store individual invoices in database if they exist
                      if (result.invoices && Array.isArray(result.invoices)) {
                        for (const invoice of result.invoices) {
                          try {
                            await storage.createInvoice({
                              userId,
                              invoiceNumber: invoice.invoice_number || `INV-${Date.now()}`,
                              gstin: invoice.gstin || invoice.seller_gstin || '',
                              buyerName: invoice.buyer_name || invoice.customer_name || 'Unknown',
                              amount: invoice.amount || invoice.total_amount || '0',
                              taxAmount: invoice.tax_amount || invoice.gst_amount || '0',
                              hsnCode: invoice.hsn_code || invoice.hsn || '',
                              fileName: file.originalname
                            });
                            allInvoices.push(invoice);
                          } catch (invError) {
                            console.error('Error storing invoice:', invError);
                          }
                        }
                      }
                      
                      console.log(`[SUCCESS] Successfully processed ${file.originalname}: ${result.invoices_count || 0} invoices`);
                    } else {
                      await storage.updateUploadedFile(uploadedFile.id, {
                        status: 'error',
                        extractedData: JSON.stringify({ error: 'No data extracted' })
                      });
                      console.warn(`[WARNING] No data extracted from ${file.originalname}`);
                    }
                    resolve();
                  } catch (jsonError) {
                    console.error(`[ERROR] JSON parsing failed: ${jsonError}`);
                    console.error(`[ERROR] Attempted to parse: ${resultMatch[1]}`);
                    
                    // Update file status as error
                    await storage.updateUploadedFile(uploadedFile.id, {
                      status: 'error',
                      extractedData: JSON.stringify({ error: 'JSON parsing failed' })
                    });
                    
                    // Try alternative parsing - look for success indicators
                    if (output.includes('[SUCCESS]') || output.includes('extracted invoices:')) {
                      console.log(`[SUCCESS] Processing completed for ${file.originalname} (pattern match)`);
                      resolve();
                    } else {
                      resolve(); // Still resolve to continue processing
                    }
                  }
                } else {
                  // Look for SUCCESS indicators in the output when no JSON found
                  if (output.includes('[SUCCESS]') && output.includes('extracted invoices:')) {
                    console.log(`[SUCCESS] Processing completed for ${file.originalname} (pattern match)`);
                    await storage.updateUploadedFile(uploadedFile.id, {
                      status: 'completed',
                      extractedData: JSON.stringify({ message: 'Processed successfully' })
                    });
                    resolve();
                  } else {
                    console.warn(`[WARNING] No clear success indicator found for ${file.originalname}`);
                    console.log(`[DEBUG] Output preview: ${output.substring(0, 500)}...`);
                    await storage.updateUploadedFile(uploadedFile.id, {
                      status: 'error',
                      extractedData: JSON.stringify({ error: 'No clear success indicator' })
                    });
                    resolve(); // Still resolve to continue processing
                  }
                }
              } catch (e) {
                console.error('Failed to parse Python output:', e);
                console.error('Raw Python output:', output);
                console.error('Raw Python errors:', errorOutput);
                
                // Update file status as error
                await storage.updateUploadedFile(uploadedFile.id, {
                  status: 'error',
                  extractedData: JSON.stringify({ error: 'Processing failed' })
                });
                
                const errorMessage = e instanceof Error ? e.message : 'Unknown parsing error';
                reject(new Error(`Failed to parse Python output: ${errorMessage}`));
              }
            } else {
              console.error('Python process error with code:', code);
              console.error('Python stderr:', errorOutput);
              console.error('Python stdout:', output);
              
              // Update file status as error
              await storage.updateUploadedFile(uploadedFile.id, {
                status: 'error',
                extractedData: JSON.stringify({ error: `Python process failed with code ${code}` })
              });
              
              reject(new Error(`Python process failed with exit code ${code}`));
            }
          });
        });
      }
      
      // Send final response after processing all files
      res.json({
        success: true,
        message: `Successfully processed ${files.length} file(s). Check Reports section for Excel download.`,
        download_url: '/api/download-excel',
        invoices_count: allInvoices.length,
        processed_files: processedFiles.length
      });
      
    } catch (error) {
      console.error('GST extraction error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Internal server error';
      const errorStr = error instanceof Error ? error.message : String(error);
      
      if (errorStr.includes('Python process failed')) {
        errorMessage = 'Failed to process files with AI engine. Please check if Python environment is properly configured.';
      } else if (errorStr.includes('API key')) {
        errorMessage = 'AI processing unavailable. Please configure Google API key.';
      } else if (errorStr.includes('ENOENT')) {
        errorMessage = 'Python interpreter not found. Please ensure Python is installed and accessible.';
      }
      
      res.status(500).json({ 
        error: errorMessage,
        details: errorStr
      });
    }
  });
  
  // Government Portal Upload endpoint
  app.post('/api/upload-to-government', async (req, res) => {
    try {
      const { filename, userId } = req.body;
      
      if (!filename) {
        return res.status(400).json({ error: 'Filename is required' });
      }
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      // Get the Excel file path
      const excelPath = path.join(process.cwd(), 'python_backend/output/Consolidated_Invoices_Output.xlsx');
      
      // Check if file exists
      if (!fs.existsSync(excelPath)) {
        return res.status(404).json({ 
          error: 'Excel file not found',
          details: 'Please generate the Excel file first by processing invoices'
        });
      }
      
      // Upload to government portal using enhanced service
      const uploadResult = await governmentPortal.uploadToGovernment(excelPath, {
        originalFilename: filename,
        userId: userId
      });
      
      if (uploadResult.success) {
        // Log the upload for audit trail
        await storage.createDownloadHistory({
          userId: userId,
          filename: `GOVT_UPLOAD_${filename}`,
          fileType: 'government_upload',
          invoicesCount: 'Multiple',
          fileSize: '0', // Size not relevant for upload logs
        });
        
        res.json({
          success: true,
          message: uploadResult.message || 'Successfully uploaded to Government Portal',
          referenceNumber: uploadResult.referenceNumber,
          uploadTimestamp: uploadResult.timestamp,
          status: uploadResult.status
        });
      } else {
        res.status(400).json({ 
          error: uploadResult.error || 'Upload failed',
          validationErrors: uploadResult.validationErrors,
          details: 'Please check file format and content'
        });
      }
      
    } catch (error) {
      console.error('Government upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload to government portal failed';
      res.status(500).json({ 
        error: errorMessage,
        details: 'Internal server error occurred during upload'
      });
    }
  });

  // Add government portal status check endpoint
  app.get('/api/government-status/:referenceNumber', async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      const status = await governmentPortal.checkStatus(referenceNumber);
      res.json(status);
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ error: 'Failed to check status' });
    }
  });

  app.get('/api/download-excel', async (req, res) => {
    const { userId } = req.query; // Get userId from query parameters
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const excelPath = path.join(process.cwd(), 'python_backend/output/Consolidated_Invoices_Output.xlsx');
    
    // Check if file exists
    if (fs.existsSync(excelPath)) {
      try {
        // Get file stats for size
        const stats = fs.statSync(excelPath);
        
        // Get user's invoice count for more accurate reporting
        const userInvoices = await storage.getInvoices(userId as string);
        
        // Create download history entry
        await storage.createDownloadHistory({
          userId: userId as string,
          filename: 'GST_Invoices_Extract.xlsx',
          fileType: 'excel',
          invoicesCount: userInvoices.length.toString(),
          fileSize: stats.size.toString(),
        });

        res.download(excelPath, 'GST_Invoices_Extract.xlsx', (err) => {
          if (err) {
            console.error('Download error:', err);
            res.status(500).json({ error: 'Failed to download file' });
          }
        });
      } catch (error) {
        console.error('Error creating download history:', error);
        // Still allow download even if history creation fails
        res.download(excelPath, 'GST_Invoices_Extract.xlsx');
      }
    } else {
      console.error('Excel file not found at:', excelPath);
      res.status(404).json({ error: 'Excel file not found' });
    }
  });

  // Download history routes
  app.get("/api/download-history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const downloads = await storage.getDownloadHistory(userId);
      res.json(downloads);
    } catch (error) {
      console.error('Error fetching download history:', error);
      res.status(500).json({ error: 'Failed to fetch download history' });
    }
  });

  app.delete("/api/download-history/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDownloadHistory(id);
      
      if (deleted) {
        res.json({ success: true, message: "Report deleted successfully" });
      } else {
        res.status(404).json({ error: "Report not found" });
      }
    } catch (error) {
      console.error('Error deleting download history:', error);
      res.status(500).json({ error: 'Failed to delete report' });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 Login attempt received:');
      console.log('- Email:', email);
      console.log('- Password length:', password?.length || 0);
      console.log('- Request body keys:', Object.keys(req.body));
      
      if (!email || !password) {
        console.log('❌ Missing email or password');
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const storage = await getStorage();
      console.log('✅ Storage instance created');
      
      // Use the verifyPassword method from DatabaseStorage for proper bcrypt comparison
      const user = await storage.verifyPassword(email, password);
      
      if (!user) {
        console.log('❌ Authentication failed for email:', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log('✅ Authentication successful for email:', email);
      console.log('- User ID:', user.id);
      console.log('- User name:', user.name);
      
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      
      console.log('📤 Sending response with user data (password excluded)');
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('💥 Login error:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log('Received registration request with body:', req.body);
      console.log('Request body type:', typeof req.body);
      console.log('Request body keys:', Object.keys(req.body));
      
      // Additional validation
      if (!req.body || typeof req.body !== 'object') {
        console.log('Invalid request body:', req.body);
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      // Check if email is present and valid
      if (!req.body.email) {
        console.log('Missing email in request body');
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Trim whitespace from email
      const trimmedEmail = typeof req.body.email === 'string' ? req.body.email.trim() : req.body.email;
      
      if (typeof trimmedEmail !== 'string') {
        console.log('Email is not a string:', trimmedEmail, typeof trimmedEmail);
        return res.status(400).json({ message: "Email must be a valid string" });
      }
      
      // Check for empty email after trimming
      if (!trimmedEmail) {
        console.log('Email is empty after trimming');
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Basic email format validation - more permissive to handle edge cases
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        console.log('Invalid email format:', trimmedEmail);
        // Include the actual email in the error message for debugging
        return res.status(400).json({ 
          message: `Please enter a valid email address. You entered: "${trimmedEmail}"` 
        });
      }
      
      // Parse the user data with Zod schema
      let userData;
      try {
        // Create a clean user data object with trimmed values
        const cleanUserData = {
          ...req.body,
          email: trimmedEmail,
          name: typeof req.body.name === 'string' ? req.body.name.trim() : req.body.name,
          company: typeof req.body.company === 'string' ? req.body.company.trim() : req.body.company,
          phone: typeof req.body.phone === 'string' ? req.body.phone.trim() : req.body.phone,
          password: req.body.password // Don't trim password
        };
        
        userData = insertUserSchema.parse(cleanUserData);
      } catch (zodError) {
        console.log('Zod validation error:', zodError);
        return res.status(400).json({ 
          message: "Invalid input data provided",
          error: zodError instanceof Error ? zodError.message : "Validation failed"
        });
      }
      
      console.log('Registration attempt for email:', userData.email);
      console.log('Parsed user data:', userData);
      
      const storage = await getStorage();
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        console.log('User already exists:', userData.email);
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      console.log('User created successfully:', userData.email);
      
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.log('Validation error:', error.errors);
        return res.status(400).json({ 
          message: "Invalid input data provided",
          errors: error.errors 
        });
      }
      console.error('Registration error:', error);
      // More specific error messages
      if (error.message && error.message.toLowerCase().includes('email')) {
        return res.status(400).json({ 
          message: error.message || "Please enter a valid email address." 
        });
      }
      res.status(500).json({ 
        message: (error as Error).message || "Registration failed" 
      });
    }
  });

  // Session validation route
  app.post("/api/auth/validate", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "No user ID provided" });
      }
      
      const storage = await getStorage();
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid session" });
      }
      
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Session validation error:', error);
      res.status(401).json({ message: "Session validation failed" });
    }
  });

  // User profile update route
  app.put("/api/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { name, email, company, phone, avatar } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const storage = await getStorage();
      const existingUser = await storage.getUser(userId);
      
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if email is being changed and if it's already taken by another user
      if (email && email !== existingUser.email) {
        const emailExists = await storage.getUserByEmail(email);
        if (emailExists && emailExists.id !== userId) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (company !== undefined) updateData.company = company;
      if (phone !== undefined) updateData.phone = phone;
      if (avatar !== undefined) updateData.avatar = avatar;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('User update error:', error);
      res.status(500).json({ message: "User update failed" });
    }
  });

  // Avatar upload route
  app.post("/api/user/avatar", avatarUpload.single('avatar'), async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const storage = await getStorage();
      const existingUser = await storage.getUser(userId);
      
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Resize image to a maximum of 200x200 pixels and compress to reduce file size
      const resizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 200, height: 200, fit: 'inside' })
        .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
        .toBuffer();
      
      // Convert resized image to base64 string for storage
      const base64Image = resizedImageBuffer.toString('base64');
      const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;
      
      // Update user with avatar data
      const updatedUser = await storage.updateUser(userId, { avatar: imageDataUrl });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user avatar" });
      }
      
      res.json({ 
        message: "Avatar uploaded successfully",
        avatarUrl: imageDataUrl
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({ message: "Avatar upload failed" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (userId) {
        console.log('Logout successful for user:', userId);
      }
      
      // Clear server-side session data if any
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Dashboard stats routes
  app.get("/api/dashboard/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const gstReturns = await storage.getGstReturns(userId);
      const invoices = await storage.getInvoices(userId);
      const uploadedFiles = await storage.getUploadedFiles(userId);
      
      const stats = {
        totalGstCollection: invoices.reduce((sum: any, inv: any) => sum + parseFloat(inv.taxAmount || "0"), 0),
        processedReturns: gstReturns.filter((ret: any) => ret.status === "Filed").length,
        pendingActions: gstReturns.filter((ret: any) => ret.status === "Pending").length,
        complianceScore: Math.round((gstReturns.filter((ret: any) => ret.status === "Filed").length / Math.max(gstReturns.length, 1)) * 100),
        recentInvoices: invoices.slice(0, 5),
        uploadedFilesCount: uploadedFiles.length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // GST Returns routes
  app.get("/api/gst-returns/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const gstReturns = await storage.getGstReturns(userId);
      res.json(gstReturns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch GST returns" });
    }
  });

  // Invoice routes
  app.get("/api/invoices/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const invoices = await storage.getInvoices(userId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.extend({
        userId: z.string()
      }).parse(req.body);
      
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // File upload routes
  app.post("/api/files/upload", upload.array('files'), async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedFiles = [];
      
      for (const file of files) {
        const fileData = {
          userId,
          fileName: file.originalname,
          fileSize: file.size.toString(),
          fileType: file.mimetype,
          extractedData: JSON.stringify({
            // Mock extracted data - in real implementation, this would use OCR/AI
            invoiceNumber: `INV-${Date.now()}`,
            amount: "50000",
            taxAmount: "9000",
            gstin: "29AABCT1332L000",
            hsnCode: "8517"
          })
        };
        
        const uploadedFile = await storage.createUploadedFile(fileData);
        
        // Simulate processing time
        setTimeout(async () => {
          await storage.updateUploadedFile(uploadedFile.id, { status: "completed" });
        }, 2000);
        
        uploadedFiles.push(uploadedFile);
      }

      res.status(201).json({ files: uploadedFiles });
    } catch (error) {
      res.status(500).json({ message: "File upload failed" });
    }
  });

  app.get("/api/files/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const files = await storage.getUploadedFiles(userId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch uploaded files" });
    }
  });

  // Chart data routes
  app.get("/api/charts/gst-trends/:userId", async (req, res) => {
    try {
      // Mock GST trend data - in real implementation, this would aggregate from database
      const trendData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [180000, 210000, 245000, 220000, 270000, 295000]
      };
      res.json(trendData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch GST trend data" });
    }
  });

  app.get("/api/charts/compliance/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const gstReturns = await storage.getGstReturns(userId);
      
      const completed = gstReturns.filter((ret: any) => ret.status === "Filed").length;
      const pending = gstReturns.filter((ret: any) => ret.status === "Pending").length;
      const overdue = gstReturns.filter((ret: any) => ret.status === "Overdue").length;
      
      const complianceData = {
        labels: ['Completed', 'Pending', 'Overdue'],
        data: [completed, pending, overdue]
      };
      
      res.json(complianceData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch compliance data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
