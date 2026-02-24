# FinSync Database Structure Overview

## Database Information
- **Database Name:** `finsync`
- **Database Type:** MySQL 8.0
- **ORM:** Drizzle ORM with TypeScript
- **Connection:** Local MySQL (localhost:3306)
- **User:** root
- **Password:** Vtu24497

---

## Database Schema Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FINSYNC DATABASE SCHEMA                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│         USERS            │  ← Primary User Management
├──────────────────────────┤
│ 🔑 id (VARCHAR 36) PK    │
│ 📧 email (VARCHAR 255)   │ UNIQUE
│ 👤 name (VARCHAR 255)    │
│ 🏢 company (VARCHAR 255) │
│ 📱 phone (VARCHAR 20)    │
│ 🖼️ avatar (TEXT)         │
│ 🔒 password (VARCHAR 255)│
│ ✅ is_active (BOOLEAN)   │
│ 📅 created_at (TIMESTAMP)│
│ 📅 updated_at (TIMESTAMP)│
└──────────────────────────┘
              │
              │ (1:N relationships)
              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER-SPECIFIC DATA TABLES                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐
│      GST_RETURNS         │    │        INVOICES          │    │     UPLOADED_FILES       │
├──────────────────────────┤    ├──────────────────────────┤    ├──────────────────────────┤
│ 🔑 id (VARCHAR 36) PK    │    │ 🔑 id (VARCHAR 36) PK    │    │ 🔑 id (VARCHAR 36) PK    │
│ 👤 user_id (VARCHAR 36)  │FK  │ 👤 user_id (VARCHAR 36)  │FK  │ 👤 user_id (VARCHAR 36)  │FK
│ 📋 return_type (VARCHAR) │    │ 📄 invoice_number (VAR.) │    │ 📁 file_name (VARCHAR)   │
│ 📅 period (VARCHAR 20)   │    │ 🏢 gstin (VARCHAR 50)    │    │ 📏 file_size (VARCHAR)   │
│ 📊 status (VARCHAR 50)   │    │ 🛒 buyer_name (VARCHAR)  │    │ 📝 file_type (VARCHAR)   │
│ 💰 total_tax (VARCHAR)   │    │ 💰 amount (VARCHAR 50)   │    │ ⚡ status (VARCHAR 50)   │
│ 📅 filed_at (TIMESTAMP)  │    │ 💸 tax_amount (VARCHAR)  │    │ 📊 extracted_data (TEXT) │
│ 📅 created_at (TIMESTAMP)│    │ 🏷️ hsn_code (VARCHAR)   │    │ 📅 created_at (TIMESTAMP)│
│ 📅 updated_at (TIMESTAMP)│    │ ⚡ status (VARCHAR 50)   │    └──────────────────────────┘
└──────────────────────────┘    │ 📁 file_name (VARCHAR)   │
                               │ 📅 created_at (TIMESTAMP)│
                               └──────────────────────────┘

┌──────────────────────────┐
│    DOWNLOAD_HISTORY      │
├──────────────────────────┤
│ 🔑 id (VARCHAR 36) PK    │
│ 👤 user_id (VARCHAR 36)  │FK
│ 📁 filename (VARCHAR 255)│
│ 📝 file_type (VARCHAR 50)│
│ 📊 invoices_count (VAR.) │
│ 📅 downloaded_at (TIMES.) │
│ 📏 file_size (VARCHAR 50)│
└──────────────────────────┘
```

---

## Table Details

### 1. **USERS** (Primary Table)
**Purpose:** Core user account management and authentication
```sql
PRIMARY KEY: id (UUID)
UNIQUE: email
FOREIGN KEYS: None (root table)
CASCADE DELETE: All related data deleted when user is deleted
```

**Fields:**
- `id` - Unique user identifier (UUID)
- `email` - User's email address (login credential)
- `name` - Full name of the user
- `company` - User's company/organization (optional)
- `phone` - User's phone number (optional)
- `avatar` - Profile picture (stored as text/URL)
- `password` - Encrypted password (bcrypt hashed)
- `is_active` - Account status flag
- `created_at` - Account creation timestamp
- `updated_at` - Last modification timestamp

---

### 2. **GST_RETURNS** (Tax Filing Management)
**Purpose:** Track GST return filings and compliance
```sql
PRIMARY KEY: id (UUID)
FOREIGN KEY: user_id → users.id (CASCADE DELETE)
USER ISOLATION: ✅ All queries filter by user_id
```

**Fields:**
- `return_type` - Type of GST return (GSTR-1, GSTR-3B, etc.)
- `period` - Filing period (MM-YYYY format)
- `status` - Filing status (Filed, Pending, Draft, Overdue)
- `total_tax` - Total tax amount for the period
- `filed_at` - Actual filing timestamp
- `created_at` - Record creation timestamp
- `updated_at` - Last modification timestamp

---

### 3. **INVOICES** (Invoice Data Storage)
**Purpose:** Store processed invoice information from uploaded documents
```sql
PRIMARY KEY: id (UUID)
FOREIGN KEY: user_id → users.id (CASCADE DELETE)
USER ISOLATION: ✅ All queries filter by user_id
```

**Fields:**
- `invoice_number` - Invoice number from document
- `gstin` - GST identification number
- `buyer_name` - Customer/buyer name
- `amount` - Invoice total amount
- `tax_amount` - GST tax amount
- `hsn_code` - HSN/SAC classification code
- `status` - Processing status (processed, error, pending)
- `file_name` - Original source file name
- `created_at` - Extraction timestamp

---

### 4. **UPLOADED_FILES** (File Processing Tracking)
**Purpose:** Track uploaded documents and their processing status
```sql
PRIMARY KEY: id (UUID)
FOREIGN KEY: user_id → users.id (CASCADE DELETE)
USER ISOLATION: ✅ All queries filter by user_id
```

**Fields:**
- `file_name` - Original filename
- `file_size` - File size in bytes
- `file_type` - MIME type (PDF, Excel, CSV, etc.)
- `status` - Processing status (processing, completed, error)
- `extracted_data` - JSON string of extracted information
- `created_at` - Upload timestamp

---

### 5. **DOWNLOAD_HISTORY** (Report Generation Tracking)
**Purpose:** Track generated reports and downloads
```sql
PRIMARY KEY: id (UUID)
FOREIGN KEY: user_id → users.id (CASCADE DELETE)
USER ISOLATION: ✅ All queries filter by user_id
```

**Fields:**
- `filename` - Generated report filename
- `file_type` - Type of report (excel, pdf, csv)
- `invoices_count` - Number of invoices included
- `downloaded_at` - Download timestamp
- `file_size` - Generated file size

---

## Data Flow and Relationships

### User Data Isolation Architecture
```
┌─────────────┐    ┌─────────────────────────────────────────────────────┐
│   USER A    │    │              USER A's DATA UNIVERSE                │
│ ID: user-123│────▶│ • Invoices (user_id = user-123)                    │
└─────────────┘    │ • GST Returns (user_id = user-123)                 │
                   │ • Uploaded Files (user_id = user-123)              │
                   │ • Download History (user_id = user-123)            │
                   └─────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────────────────────────────────────────────┐
│   USER B    │    │              USER B's DATA UNIVERSE                │
│ ID: user-456│────▶│ • Invoices (user_id = user-456)                    │
└─────────────┘    │ • GST Returns (user_id = user-456)                 │
                   │ • Uploaded Files (user_id = user-456)              │
                   │ • Download History (user_id = user-456)            │
                   └─────────────────────────────────────────────────────┘
```

### Data Processing Pipeline
```
1. USER UPLOADS DOCUMENT
   ↓
2. RECORD CREATED IN uploaded_files
   ↓
3. AI/OCR PROCESSING EXTRACTS DATA
   ↓
4. INVOICE RECORDS CREATED IN invoices
   ↓
5. EXCEL REPORT GENERATED
   ↓
6. DOWNLOAD TRACKED IN download_history
   ↓
7. GST RETURN DATA AGGREGATED IN gst_returns
```

---

## Security Features

### 🔒 **User Isolation Guarantees**
- **Database Level:** All queries include `WHERE user_id = ?`
- **API Level:** All endpoints validate user authentication
- **Cascade Deletion:** User deletion removes all related data
- **No Cross-User Access:** Impossible for User A to see User B's data

### 🛡️ **Data Security**
- **Password Encryption:** bcrypt hashing with salt
- **UUID Primary Keys:** Non-sequential, secure identifiers
- **Foreign Key Constraints:** Data integrity enforcement
- **Timestamp Tracking:** Complete audit trail

---

## Database Statistics (Current Schema)

| Table | Primary Purpose | User Isolation | Cascade Delete |
|-------|----------------|----------------|----------------|
| **users** | Authentication & Profile | N/A (root table) | ✅ Deletes all user data |
| **gst_returns** | Tax Filing Management | ✅ user_id filter | ✅ ON DELETE CASCADE |
| **invoices** | Invoice Data Storage | ✅ user_id filter | ✅ ON DELETE CASCADE |
| **uploaded_files** | File Processing Tracking | ✅ user_id filter | ✅ ON DELETE CASCADE |
| **download_history** | Report Generation Log | ✅ user_id filter | ✅ ON DELETE CASCADE |

**Total Tables:** 5  
**Total Relationships:** 4 foreign keys  
**User Isolation:** 100% (all data tables)  
**Data Integrity:** Full referential integrity with cascade deletion