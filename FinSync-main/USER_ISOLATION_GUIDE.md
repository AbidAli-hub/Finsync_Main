# User Data Isolation Implementation Guide

## Overview
The FinSync application implements comprehensive user data isolation at both the frontend and database levels, ensuring that each user can only access their own data.

## Database-Level User Isolation

### 1. Database Schema Design
All data tables include a `userId` foreign key that links to the users table:

```sql
-- Users table (primary)
users (id, email, name, company, password, ...)

-- All other tables reference userId
invoices (id, userId, invoiceNumber, amount, ...)
gstReturns (id, userId, returnType, period, status, ...)
uploadedFiles (id, userId, fileName, fileSize, ...)
downloadHistory (id, userId, filename, downloadedAt, ...)
```

### 2. Server-Side Data Filtering
All API endpoints require and validate userId:

#### Authentication Endpoints:
- `POST /api/auth/login` - Returns user ID after validation
- `POST /api/auth/register` - Creates new user with unique ID
- `POST /api/auth/validate` - Validates user session

#### Data Access Endpoints (All require userId):
- `GET /api/invoices/:userId` - Only returns invoices for specific user
- `GET /api/gst-returns/:userId` - Only returns GST returns for specific user
- `GET /api/files/:userId` - Only returns uploaded files for specific user
- `GET /api/download-history/:userId` - Only returns download history for specific user
- `GET /api/dashboard/stats/:userId` - Only returns stats for specific user

#### File Upload Endpoints:
- `POST /api/extract-gst` - Requires userId in request body
- `POST /api/files/upload` - Requires userId in request body
- `GET /api/download-excel?userId=...` - Requires userId parameter

### 3. Database Query Implementation
All database queries filter by userId:

```typescript
// Example: Get invoices for specific user only
async getInvoices(userId: string): Promise<Invoice[]> {
  const result = await db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, userId))  // Filter by userId
    .orderBy(desc(invoices.createdAt));
  return result;
}

// Example: Create invoice with userId association
async createInvoice(invoice: InsertInvoice & { userId: string }): Promise<Invoice> {
  const newInvoice = {
    id: randomUUID(),
    userId: invoice.userId,  // Always include userId
    ...invoice,
  };
  await db.insert(invoices).values(newInvoice);
}
```

## Frontend-Level User Isolation

### 1. Authentication State Management
- User authentication state managed in `useAuth` hook
- Session validation with server on app initialization
- Automatic logout on invalid sessions

### 2. User-Specific Data Storage
- `useUserStorage` hook for user-specific localStorage
- Data keys: `finsync_user_{userId}_{dataKey}`
- Automatic cleanup of other users' data

### 3. Protected Routes
- `ProtectedRoute` component validates user authentication
- Automatic data cleanup from previous users
- Session-based security validation

## User Data Flow Example

### Scenario: User A logs in and uploads invoices

1. **Login Process:**
   ```
   User A logs in → Server validates → Returns userId: "user-123"
   ```

2. **Data Creation:**
   ```
   Upload invoice → POST /api/extract-gst
   Body: { userId: "user-123", files: [...] }
   → Creates invoice with userId: "user-123"
   ```

3. **Data Retrieval:**
   ```
   Dashboard loads → GET /api/invoices/user-123
   → Returns only invoices where userId = "user-123"
   ```

### Scenario: User B logs in (different user)

1. **Login Process:**
   ```
   User B logs in → Server validates → Returns userId: "user-456"
   ```

2. **Data Isolation:**
   ```
   Dashboard loads → GET /api/invoices/user-456
   → Returns only invoices where userId = "user-456"
   → Cannot see User A's data (userId: "user-123")
   ```

## Security Features

### 1. Server-Side Validation
- All endpoints validate userId parameter
- Database queries always filter by userId
- No cross-user data access possible

### 2. Frontend Security
- User session validation on app load
- Automatic cleanup of unauthorized data
- Protected routes prevent unauthorized access

### 3. Data Persistence
- Same user's data persists across sessions
- Different users cannot access others' data
- Session management for security

## Testing User Isolation

### Test Cases:
1. **Same User Multiple Sessions:**
   - User A logs in, uploads data, logs out
   - User A logs in again → Should see previous data ✅

2. **Different Users:**
   - User A uploads data, logs out
   - User B logs in → Should see empty dashboard ✅
   - User A logs in again → Should still see own data ✅

3. **Data Segregation:**
   - Multiple users with same invoice numbers → Each user only sees their own
   - Download history separate for each user
   - Dashboard stats calculated per user

## Database Tables and User Relationships

```
users
├── id (Primary Key)
├── email (Unique)
├── name
├── company
└── password (Hashed)

invoices
├── id (Primary Key)
├── userId (Foreign Key → users.id) ← USER ISOLATION
├── invoiceNumber
├── amount
└── ...

gstReturns
├── id (Primary Key)
├── userId (Foreign Key → users.id) ← USER ISOLATION
├── returnType
├── period
└── ...

uploadedFiles
├── id (Primary Key)
├── userId (Foreign Key → users.id) ← USER ISOLATION
├── fileName
├── fileSize
└── ...

downloadHistory
├── id (Primary Key)
├── userId (Foreign Key → users.id) ← USER ISOLATION
├── filename
├── downloadedAt
└── ...
```

## Summary

The application ensures **complete user data isolation** through:

1. **Database-level filtering:** All queries include `WHERE userId = ?`
2. **API-level validation:** All endpoints require and validate userId
3. **Frontend isolation:** User-specific data storage and cleanup
4. **Session security:** Proper authentication and session management

This guarantees that each user sees only their own data, with no possibility of data leakage between different user accounts.