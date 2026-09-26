# Product Requirements Document (PRD)
## Enterprise Warehouse Management System (WMS)

---

| Informasi Dokumen | Detail |
| :--- | :--- |
| **Nama Proyek** | Enterprise Warehouse Management System (WMS) |
| **Tipe Proyek** | Full-Stack Web Application (Portfolio Ready) |
| **Versi Dokumen** | 1.0.0 |
| **Status** | Approved / Baseline Specification |
| **Target Architecture** | Decoupled Client-Server (RESTful Architecture) |

---

## 1. Executive Summary & Tujuan Proyek

Aplikasi **Warehouse Management System (WMS)** adalah sistem manajemen pergudangan tingkat enterprise yang dirancang untuk membantu perusahaan manufaktur, distribusi, maupun ritel dalam mengelola rantai pasok pergudangan secara terstruktur, akurat, dan dapat diaudit secara real-time.

### 1.1 Tujuan Bisnis & Fungsional
1. **Akurasi Stok & Minimalisasi Discrepancy**: Mengeliminasi kesalahan manual pencatatan persediaan melalui automatisasi mutasi stok pada transaksi Barang Masuk (Stock In), Barang Keluar (Stock Out), Stock Adjustment, dan Stock Opname.
2. **Visibilitas Operasional Real-Time**: Menyediakan dashboard KPI dan grafik visualisasi untuk memonitor stok kritis (Low Stock), produk fast-moving, dan pola aliran barang secara instan.
3. **Workflow & Verifikasi Berlapis**: Menjamin akuntabilitas operasional melalui persetujuan (approval workflow) dari Supervisor pada modul Stock Opname dan pelacakan audit log komprehensif pada setiap tindakan sistem.
4. **Efisiensi Rantai Pasok**: Mempercepat proses replenishment barang dengan fitur alert minimum stok dan pelacakan lokasi rak persediaan.

### 1.2 Tujuan Portofolio Engineering
Proyek ini dibangun dengan standar industri software engineering modern untuk memamerkan keahlian **Full-Stack Web Developer**, mencakup:
* Arsitektur monorepo/decoupled terpisah (`/frontend` dan `/backend`).
* Implementasi Type-Safe dari database (Prisma ORM) hingga frontend (TypeScript + React Query + Zod).
* Keamanan enterprise (JWT, Hashing, Middleware RBAC, Sanitasi Input).
* Desain sistem database relasional yang ternormalisasi (12+ tabel relasional).

---

## 2. Target User & Matrix Role-Based Access Control (RBAC)

Aplikasi mengimplementasikan 3 level akses (Role) yang ketat untuk memastikan segregasi tugas (Segregation of Duties).

### 2.1 Ringkasan Persona User
1. **Admin Gudang**: Eksekutot harian gudang yang bertanggung jawab atas pengelolaan barang, supplier, pendaftaran penerimaan/pengeluaran barang, serta pencatatan perhitungan fisik stok.
2. **Supervisor Gudang**: Manajer operasional yang memverifikasi transaksi kritis, memonitor pergerakan stok, menyetujui/menolak hasil stock opname, serta menganalisis laporan inventori.
3. **Admin Sistem**: Administrator IT yang mengelola akun pengguna, hak akses role, konfigurasi sistem, dan memonitor keamanan melalui audit log.

### 2.2 Matrix Hak Akses RBAC

| Fitur / Modul | Admin Gudang | Supervisor | Admin Sistem |
| :--- | :---: | :---: | :---: |
| **Dashboard KPI & Charts** | Read-Only | Full Access | Full Access |
| **Data Produk & Kategori** | CRUD | Read-Only | Read-Only |
| **Data Supplier** | CRUD | Read-Only | Read-Only |
| **Transaksi Barang Masuk (Stock In)** | Create & Read | Read-Only | Read-Only |
| **Transaksi Barang Keluar (Stock Out)** | Create & Read | Read-Only | Read-Only |
| **Stock Adjustment** | Create & Read | Read & Verify | Read-Only |
| **Stock Opname (Create & Count)** | Create & Input | Read-Only | Read-Only |
| **Stock Opname (Approval/Reject)** | No Access | Approve / Reject | No Access |
| **Transaction History & Reports** | Read & Export | Read & Export | Read-Only |
| **User & Role Management** | No Access | No Access | Full Access (CRUD) |
| **Audit Log System** | No Access | Read-Only | Full Access |
| **System Configuration** | No Access | No Access | Full Access |

---

## 3. Tech Stack & Arsitektur Sistem

Sistem menggunakan stack TypeScript penuh di kedua sisi (Frontend & Backend) untuk menjamin Type-Safety end-to-end.

```mermaid
graph TD
 Client[React + Vite Frontend\nTypeScript, Tailwind, TanStack Query]
 API[Express.js Backend REST API\nTypeScript, JWT, Zod Validation]
 ORM[Prisma ORM]
 DB[(PostgreSQL Database)]

 Client <-->|HTTP REST / JSON + Bearer JWT| API
 API <-->|Type-safe queries| ORM
 ORM <-->|SQL Client| DB
```

### 3.1 Detail Tech Stack

#### Frontend Layer (`/frontend`)
* **Framework**: React.js 18+ (dengan Vite build tool).
* **Bahasa**: TypeScript.
* **Styling**: Vanilla CSS / CSS Modules + Tailwind CSS v3 (Custom Dark/Light Slate Palette).
* **State & Data Fetching**: TanStack Query v5 (React Query) untuk server-state caching & auto refetch.
* **Routing**: React Router DOM v6 (Protected Routes & Layout Wrapper).
* **Form & Validasi**: React Hook Form + Zod Schema Validator.
* **Visualisasi Data**: Recharts (Interactive Line Charts, Bar Charts, Pie Charts).
* **HTTP Client**: Axios (dengan Interceptor JWT Injection & Global Error Handler).

#### Backend Layer (`/backend`)
* **Runtime & Framework**: Node.js v20+ dengan Express.js.
* **Bahasa**: TypeScript.
* **Autentikasi & Keamanan**: JWT (JSON Web Token), bcrypt.js (Cost Factor 10), Helmet, CORS.
* **Validation Middleware**: Zod validator middleware pada request body, params, & query.
* **ORM**: Prisma ORM v5 (Migration engine, Schema generator).

#### Database Layer
* **RDBMS**: PostgreSQL 15+.
* **Integrity**: Foreign Key Constraints, Cascading Rules, Unique Indexes, Enums, Transactions (`prisma.$transaction`).

#### Development & Quality Assurance
* **Version Control**: Git & GitHub repository.
* **Code Standard**: ESLint (TypeScript rules), Prettier formatting.
* **Environment**: `dotenv` untuk pengelolaan kredensial sensitif.

### 3.2 Struktur Folder Proyek

```text
wms-root/
├── frontend/
│ ├── src/
│ │ ├── assets/
│ │ ├── components/
│ │ │ ├── common/ # Button, Modal, Table, Badge, Input, Toast
│ │ │ ├── layout/ # Sidebar, Topbar, MainLayout
│ │ │ └── charts/ # Recharts wrappers
│ │ ├── config/ # Axios instance, constants
│ │ ├── context/ # AuthContext, NotificationContext
│ │ ├── hooks/ # Custom hooks (useAuth, useProducts, etc.)
│ │ ├── pages/ # Page Views (Dashboard, Products, StockIn, StockOpname, etc.)
│ │ ├── routes/ # AppRoutes, ProtectedRoute, RoleRoute
│ │ ├── services/ # API service endpoints
│ │ ├── types/ # TypeScript interfaces & DTOs
│ │ └── utils/ # Formatters, currency, date helpers
│ ├── package.json
│ └── vite.config.ts
├── backend/
│ ├── prisma/
│ │ ├── schema.prisma
│ │ ├── migrations/
│ │ └── seed.ts
│ ├── src/
│ │ ├── config/ # Env variables, database client
│ │ ├── controllers/ # HTTP Request Handlers
│ │ ├── middlewares/ # Auth JWT, Role Checker, Error Handler, Validator
│ │ ├── routes/ # Express Router definitions
│ │ ├── services/ # Core Business Logic & Database queries
│ │ ├── types/ # Express Custom Request types
│ │ ├── utils/ # Logger, JWT Signer, Audit Log Helper
│ │ └── app.ts
│ ├── package.json
│ └── tsconfig.json
└── README.md
```

---

## 4. Workflows Bisnis & Diagram Alir Sistem

### 4.1 Workflow Stock In (Barang Masuk)
1. Admin Gudang membuka form Stock In.
2. Memilih Supplier dan Produk yang diterima.
3. Memasukkan quantity, harga beli, dan catatan (opsional nomor PO/Surat Jalan).
4. Backend menjalankan database transaction:
 * Membuat record di `stock_transactions` (type: `IN`).
 * Menambah stok di tabel `products` (`stock = stock + quantity`).
 * Mengatur status transaksi `COMPLETED`.
 * Mencatat `audit_logs`.

### 4.2 Workflow Stock Out (Barang Keluar)
1. Admin Gudang membuka form Stock Out.
2. Memilih Produk dan memasukkan quantity pengeluaran.
3. Backend memeriksa ketersediaan stok:
 * **Jika `quantity > current_stock`**: Transaksi **DITOLAK** dengan HTTP 400 Bad Request ("Stok tidak mencukupi. Stok saat ini: X").
 * **Jika `quantity <= current_stock`**:
 * Transaksi diproses.
 * Mengurangi stok produk (`stock = stock - quantity`).
 * Membuat record `stock_transactions` (type: `OUT`).
 * Jika `new_stock <= min_stock`, sistem membuat record `notifications` untuk Low Stock.

### 4.3 Workflow Stock Opname (State Machine)

```mermaid
stateDiagram-v2
 [*] --> DRAFT : Admin Buat Sesi Opname
 DRAFT --> COUNTING : Sistem Lock / Ambil Snaphot Stok
 COUNTING --> WAITING_APPROVAL : Admin Submit Hasil Perhitungan Fisik
 WAITING_APPROVAL --> APPROVED : Supervisor Setujui Hasil
 WAITING_APPROVAL --> REJECTED : Supervisor Tolak Hasil
 REJECTED --> COUNTING : Admin Re-count / Edit Fisik
 APPROVED --> COMPLETED : Sistem Auto-Update Stok Produk & Catat Adjustment
 COMPLETED --> [*]
```

---

## 5. Spesifikasi Detail Modul Aplikasi

### 5.1 Modul Authentication & User Management
* **Fitur**:
 * Login dengan Email & Password.
 * Hashing password wajib menggunakan `bcrypt` (salt rounds: 10).
 * Payload JWT berisi: `{ id, email, role, name }` (exp: 24 jam).
 * Protected Routes pada frontend berdasarkan token & role validation.
 * Pengelolaan akun oleh Admin Sistem: Tambah user, Edit Role, Aktif/Nonaktifkan akun.

### 5.2 Modul Dashboard & Real-Time Monitoring
* **KPI Cards**:
 1. Total Jenis Produk Active.
 2. Total Kuantitas Unit Stok Pergudangan.
 3. Total Volume Barang Masuk Bulan Ini.
 4. Total Volume Barang Keluar Bulan Ini.
 5. Alert Count: Jumlah Produk dengan Stok <= Minimum Stock.
 6. Total Supplier Aktif.
* **Grafik Visual (Recharts)**:
 * Bar Chart: Trend Barang Masuk vs Barang Keluar 30 hari terakhir.
 * Pie Chart: Distribusi Kuantitas Stok per Kategori.
 * Horizontal Bar: Top 5 Produk Stok Terendah.
 * Horizontal Bar: Top 5 Produk Most Frequently Issued (Fast-Moving).
* **System Alerts Banner**: Toast & Card peringatan ketika terdapat produk menipis.

### 5.3 Modul Product Management
* **Attributes**:
 * `sku` (String, Unique, Indexed). Contoh: `PRD-ELEC-001`.
 * `name` (String), `description` (Text, Optional).
 * `categoryId` (FK to Category).
 * `unit` (Enum/String: `PCS`, `BOX`, `PALLET`, `KG`, `METER`).
 * `supplierId` (FK to Supplier).
 * `price` (Decimal 12,2).
 * `stock` (Integer, Default 0).
 * `minStock` (Integer, Default 5).
 * `rackLocation` (String). Contoh: `RAK-A-12`.
 * `status` (Enum: `ACTIVE`, `INACTIVE`).
* **Fitur**: CRUD, Soft Delete (Status Inactive), Server-side Search (SKU/Nama), Filter Kategori & Status, Sorting & Pagination.

### 5.4 Modul Category Management
* **Attributes**: `code` (Unique), `name`, `description`, `status`.
* **Aturan Bisnis**: Kategori yang masih terikat pada minimal 1 produk aktif **TIDAK BOLEH** dihapus dari database. Sistem akan memberikan feedback pesan error yang presisi.

### 5.5 Modul Supplier Management
* **Attributes**: `code` (Unique), `name`, `contactPerson`, `phone`, `email`, `address`, `status`.
* **Fitur**: CRUD, Filter Supplier Aktif, Quick Search.

### 5.6 Modul Stock In (Barang Masuk)
* **Attributes Transaksi**: `transactionNo` (Auto-generated `TRX-IN-YYYYMMDD-XXXX`), `date`, `supplierId`, `notes`, `createdByUserId`, `status`.
* **Detail Items**: `productId`, `quantity`, `unitPrice`, `totalPrice`.
* **Effect**: Auto-increment `products.stock`.

### 5.7 Modul Stock Out (Barang Keluar)
* **Attributes Transaksi**: `transactionNo` (Auto-generated `TRX-OUT-YYYYMMDD-XXXX`), `date`, `destination` (Tujuan Pengiriman/Departemen), `notes`, `createdByUserId`, `status`.
* **Detail Items**: `productId`, `quantity`.
* **Effect**: Auto-decrement `products.stock` (dengan Validasi Ketersediaan Stok).

### 5.8 Modul Stock Adjustment
* **Attributes**: `adjustmentNo` (`ADJ-YYYYMMDD-XXXX`), `productId`, `systemStock`, `actualStock`, `difference`, `reason` (Enum: `DAMAGED`, `EXPIRED`, `LOST`, `FOUND`, `OTHER`), `notes`, `createdByUserId`.
* **Effect**: Langsung memperbarui `products.stock = actualStock` dan mencatat selisih di Audit Log.

### 5.9 Modul Stock Opname
* **Attributes Session**: `opnameNo`, `title`, `period`, `status` (`DRAFT`, `COUNTING`, `WAITING_APPROVAL`, `APPROVED`, `REJECTED`, `COMPLETED`), `createdById`, `verifiedById`, `rejectionReason`.
* **Items**: `productId`, `systemStock`, `physicalStock`, `difference`, `notes`.
* **Approval Flow**: Supervisor dapat mengklik "Approve" (menyesuaikan seluruh stok ke fisik dan mengubah status ke COMPLETED) atau "Reject" (memberikan alasan penolakan).

### 5.10 Modul Inventory Transaction History
* Master ledger pencatatan seluruh pergerakan persediaan.
* Multi-filter: Rentang Tanggal (`startDate` - `endDate`), Tipe Transaksi (`IN`, `OUT`, `ADJUSTMENT`, `OPNAME`), Product ID, User ID.

### 5.11 Modul Low Stock Alert & Notification Center
* Sistem background checker saat transaksi yang mendeteksi `stock <= minStock`.
* Pengiriman notifikasi ke `notifications` table & realtime display di Top Navbar Badge.

### 5.12 Modul Reports & Data Export Engine
* **Tipe Laporan**:
 1. Laporan Position Stok Saat Ini (Current Inventory Report).
 2. Laporan Penerimaan Barang Masuk (Stock In Summary).
 3. Laporan Pengeluaran Barang Keluar (Stock Out Summary).
 4. Laporan Kartu Stok / Mutasi Barang (Inventory Movement Report).
* **Fitur Export**: Print-ready HTML Stylesheet, Export ke Excel (`.xlsx`), Export ke PDF (`.pdf`).

### 5.13 Modul Audit Log & System Logs
* Mencatat aktivitas sensitif: IP Address, User ID, Role, Action (CREATE/UPDATE/DELETE/APPROVE), Module Name, Record ID, New Value / Previous Value Payload, Timestamp.

---

## 6. Desain Database & Schema Prisma (PostgreSQL)

```mermaid
erDiagram
 USERS ||--o{ STOCK_TRANSACTIONS : creates
 USERS ||--o{ STOCK_ADJUSTMENTS : creates
 USERS ||--o{ STOCK_OPNAMES : creates
 USERS ||--o{ AUDIT_LOGS : performs
 ROLES ||--o{ USERS : assigned
 CATEGORIES ||--o{ PRODUCTS : contains
 SUPPLIERS ||--o{ PRODUCTS : supplies
 SUPPLIERS ||--o{ STOCK_TRANSACTIONS : source
 PRODUCTS ||--o{ STOCK_TRANSACTION_ITEMS : referenced
 PRODUCTS ||--o{ STOCK_ADJUSTMENT_ITEMS : adjusted
 PRODUCTS ||--o{ STOCK_OPNAME_ITEMS : counted
 STOCK_TRANSACTIONS ||--|{ STOCK_TRANSACTION_ITEMS : details
 STOCK_OPNAMES ||--|{ STOCK_OPNAME_ITEMS : details
```

### 6.1 Standard Schema Code (`prisma/schema.prisma`)

```prisma
datasource db {
 provider = "postgresql"
 url = env("DATABASE_URL")
}

generator client {
 provider = "prisma-client-js"
}

enum RoleName {
 ADMIN_GUDANG
 SUPERVISOR
 ADMIN_SISTEM
}

enum UserStatus {
 ACTIVE
 INACTIVE
}

enum ProductStatus {
 ACTIVE
 INACTIVE
}

enum TransactionType {
 IN
 OUT
}

enum OpnameStatus {
 DRAFT
 COUNTING
 WAITING_APPROVAL
 APPROVED
 REJECTED
 COMPLETED
}

enum AdjustmentReason {
 DAMAGED
 EXPIRED
 LOST
 FOUND
 OTHER
}

model Role {
 id String @id @default(uuid())
 name RoleName @unique
 description String?
 users User[]

 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@map("roles")
}

model User {
 id String @id @default(uuid())
 email String @unique
 password String
 fullName String
 roleId String
 role Role @relation(fields: [roleId], references: [id])
 status UserStatus @default(ACTIVE)
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 transactions StockTransaction[]
 adjustments StockAdjustment[]
 opnamesCreated StockOpname[] @relation("OpnameCreator")
 opnamesVerified StockOpname[] @relation("OpnameVerifier")
 auditLogs AuditLog[]
 notifications Notification[]

 @@map("users")
}

model Category {
 id String @id @default(uuid())
 code String @unique
 name String
 description String?
 status ProductStatus @default(ACTIVE)
 products Product[]
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@map("categories")
}

model Supplier {
 id String @id @default(uuid())
 code String @unique
 name String
 contactPerson String
 phone String
 email String
 address String
 status ProductStatus @default(ACTIVE)
 products Product[]
 transactions StockTransaction[]
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@map("suppliers")
}

model Product {
 id String @id @default(uuid())
 sku String @unique
 name String
 description String?
 categoryId String
 category Category @relation(fields: [categoryId], references: [id])
 unit String
 supplierId String
 supplier Supplier @relation(fields: [supplierId], references: [id])
 price Decimal @db.Decimal(12, 2)
 stock Int @default(0)
 minStock Int @default(5)
 rackLocation String
 status ProductStatus @default(ACTIVE)

 transactionItems StockTransactionItem[]
 adjustments StockAdjustment[]
 opnameItems StockOpnameItem[]

 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@map("products")
}

model StockTransaction {
 id String @id @default(uuid())
 transactionNo String @unique
 type TransactionType
 date DateTime @default(now())
 supplierId String?
 supplier Supplier? @relation(fields: [supplierId], references: [id])
 destination String?
 notes String?
 createdById String
 createdBy User @relation(fields: [createdById], references: [id])
 
 items StockTransactionItem[]

 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@map("stock_transactions")
}

model StockTransactionItem {
 id String @id @default(uuid())
 transactionId String
 transaction StockTransaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
 productId String
 product Product @relation(fields: [productId], references: [id])
 quantity Int
 unitPrice Decimal @default(0) @db.Decimal(12, 2)
 totalPrice Decimal @default(0) @db.Decimal(12, 2)
 stockBefore Int
 stockAfter Int

 @@map("stock_transaction_items")
}

model StockAdjustment {
 id String @id @default(uuid())
 adjustmentNo String @unique
 productId String
 product Product @relation(fields: [productId], references: [id])
 systemStock Int
 actualStock Int
 difference Int
 reason AdjustmentReason
 notes String?
 createdById String
 createdBy User @relation(fields: [createdById], references: [id])
 createdAt DateTime @default(now())

 @@map("stock_adjustments")
}

model StockOpname {
 id String @id @default(uuid())
 opnameNo String @unique
 title String
 period String
 status OpnameStatus @default(DRAFT)
 notes String?
 rejectionReason String?
 createdById String
 createdBy User @relation("OpnameCreator", fields: [createdById], references: [id])
 verifiedById String?
 verifiedBy User? @relation("OpnameVerifier", fields: [verifiedById], references: [id])
 verifiedAt DateTime?

 items StockOpnameItem[]

 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt

 @@map("stock_opnames")
}

model StockOpnameItem {
 id String @id @default(uuid())
 opnameId String
 opname StockOpname @relation(fields: [opnameId], references: [id], onDelete: Cascade)
 productId String
 product Product @relation(fields: [productId], references: [id])
 systemStock Int
 physicalStock Int @default(0)
 difference Int @default(0)
 notes String?

 @@map("stock_opname_items")
}

model Notification {
 id String @id @default(uuid())
 userId String?
 user User? @relation(fields: [userId], references: [id])
 title String
 message String
 type String // LOW_STOCK, OPNAME_APPROVAL, TRANSACTION_SUCCESS
 isRead Boolean @default(false)
 createdAt DateTime @default(now())

 @@map("notifications")
}

model AuditLog {
 id String @id @default(uuid())
 userId String?
 user User? @relation(fields: [userId], references: [id])
 action String // CREATE_PRODUCT, STOCK_OUT, APPROVE_OPNAME
 module String // PRODUCTS, TRANSACTIONS, OPNAME
 recordId String?
 details Json?
 ipAddress String?
 createdAt DateTime @default(now())

 @@map("audit_logs")
}
```

---

## 7. Desain & Dokumentasi REST API

Semua Endpoint menggunakan format standar JSON Response & Autentikasi `Bearer <JWT_TOKEN>`.

### 7.1 Response Envelope Specification

#### Success Response (200 OK / 201 Created)
```json
{
 "success": true,
 "message": "Data barang berhasil diperbarui",
 "data": { ... },
 "meta": {
 "page": 1,
 "limit": 10,
 "totalRecords": 45,
 "totalPages": 5
 }
}
```

#### Error Response (400 Bad Request / 401 Unauthorized / 403 Forbidden / 500 Error)
```json
{
 "success": false,
 "message": "Stok barang tidak mencukupi",
 "error": {
 "code": "INSUFFICIENT_STOCK",
 "details": [
 {
 "field": "quantity",
 "message": "Kuantitas diminta (20) melebihi stok tersedia (12)"
 }
 ]
 }
}
```

### 7.2 Catalog API Endpoints

| Group | Method | Endpoint Path | Role Access | Keterangan / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticasi email & password, return JWT token |
| **Auth** | `GET` | `/api/auth/me` | All Roles | Mendapatkan detail profil user yang sedang login |
| **Users** | `GET` | `/api/users` | Admin Sistem | List data pengguna sistem (paginated) |
| **Users** | `POST` | `/api/users` | Admin Sistem | Membuat akun user baru |
| **Users** | `PATCH` | `/api/users/:id/status` | Admin Sistem | Mengaktifkan/nonaktifkan akun user |
| **Dashboard**| `GET` | `/api/dashboard/summary` | All Roles | KPI ringkasan stok & alert |
| **Dashboard**| `GET` | `/api/dashboard/charts` | All Roles | Data chart barang masuk/keluar & top low stock |
| **Products** | `GET` | `/api/products` | All Roles | List produk (Search, Filter, Pagination) |
| **Products** | `POST` | `/api/products` | Admin Gudang | Tambah master barang baru |
| **Products** | `GET` | `/api/products/:id` | All Roles | Detail produk lengkap & history mutasi |
| **Products** | `PUT` | `/api/products/:id` | Admin Gudang | Edit data barang & lokasi rak |
| **Products** | `PATCH` | `/api/products/:id/status` | Admin Gudang | Aktif/nonaktifkan barang |
| **Categories**| `GET` | `/api/categories` | All Roles | List kategori barang |
| **Categories**| `POST` | `/api/categories` | Admin Gudang | Membuat kategori barang baru |
| **Suppliers** | `GET` | `/api/suppliers` | All Roles | List supplier barang |
| **Suppliers** | `POST` | `/api/suppliers` | Admin Gudang | Tambah supplier baru |
| **Stock In** | `POST` | `/api/stock-transactions/in` | Admin Gudang | Pencatatan transaksi barang masuk |
| **Stock Out**| `POST` | `/api/stock-transactions/out` | Admin Gudang | Pencatatan transaksi barang keluar |
| **History** | `GET` | `/api/stock-transactions` | All Roles | Global Transaction History & Ledger |
| **Adjustment**| `POST` | `/api/stock-adjustments` | Admin Gudang | Penyesuaian stok langsung |
| **Opname** | `POST` | `/api/stock-opnames` | Admin Gudang | Membuat sesi Stock Opname baru |
| **Opname** | `PUT` | `/api/stock-opnames/:id/counts` | Admin Gudang | Input data stok fisik |
| **Opname** | `POST` | `/api/stock-opnames/:id/submit` | Admin Gudang | Submit opname ke Supervisor |
| **Opname** | `POST` | `/api/stock-opnames/:id/verify` | Supervisor | Approve / Reject Stock Opname |
| **Reports** | `GET` | `/api/reports/stock` | All Roles | Download / View Current Stock Report |
| **Reports** | `GET` | `/api/reports/movements` | All Roles | Download / View Inventory Movement Report |
| **Audit Log**| `GET` | `/api/audit-logs` | Supervisor, Admin Sys | List log aktivitas sistem |

---

## 8. Data Validation & Error Handling Specification

### 8.1 Aturan Validasi Input (Zod Schemas)

```typescript
// Contoh Validator Product Schema
export const createProductSchema = z.object({
 sku: z.string().min(3, "SKU Minimal 3 karakter").max(20),
 name: z.string().min(3, "Nama produk wajib diisi"),
 categoryId: z.string().uuid("ID Kategori tidak valid"),
 unit: z.enum(["PCS", "BOX", "PALLET", "KG", "METER"]),
 supplierId: z.string().uuid("ID Supplier tidak valid"),
 price: z.number().positive("Harga tidak boleh negatif atau 0"),
 stock: z.number().int().nonnegative("Stok awal tidak boleh negatif"),
 minStock: z.number().int().nonnegative("Minimum stok wajib diisi"),
 rackLocation: z.string().min(1, "Lokasi rak wajib diisi")
});

// Contoh Validator Stock Out Schema
export const stockOutSchema = z.object({
 productId: z.string().uuid(),
 quantity: z.number().int().positive("Quantity harus lebih dari 0"),
 destination: z.string().min(3, "Tujuan pengeluaran wajib diisi"),
 notes: z.string().optional()
});
```

### 8.2 Matriks Handling HTTP Errors

| HTTP Status | Error Scenario | User-Facing Message (Bahasa Indonesia) |
| :---: | :--- | :--- |
| **400** | Quantity Stock Out > Stok Tersedia | "Stok tidak mencukupi. Stok tersedia: {available} unit." |
| **400** | Duplicate SKU | "SKU '{sku}' sudah terdaftar dalam sistem." |
| **400** | Hapus Kategori yang terikat produk | "Kategori tidak dapat dihapus karena masih digunakan oleh {count} produk." |
| **401** | Token Expired / Invalid | "Sesi Anda telah berakhir. Silakan login kembali." |
| **403** | Admin Gudang mencoba approve opname | "Anda tidak memiliki hak akses untuk menyetujui Stock Opname." |
| **404** | Product ID tidak ditemukan | "Data barang tidak ditemukan dalam database." |
| **500** | Database Connection Timeout | "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi." |

---

## 9. Keamanan & Sanitasi Data (Security Standards)

1. **Password Protection**:
 * Password di-hash menggunakan `bcryptjs` dengan salt rounds = 10.
 * Tidak ada logging yang mencatat password plain-text.
2. **Autentikasi & Otorisasi**:
 * Stateful JWT Bearer Token divalidasi pada setiap HTTP Request privat via `authMiddleware`.
 * RBAC Middleware (`checkRole(['ADMIN_GUDANG', 'SUPERVISOR'])`) memeriksa hak akses endpoint.
3. **Proteksi Database**:
 * Penggunaan Prisma ORM secara penuh mengeliminasi risiko **SQL Injection** melalui parameterized queries bawaan.
4. **CORS & HTTP Headers**:
 * Package `cors` dikonfigurasi hanya menerima request dari domain frontend yang diizinkan.
 * Package `helmet` diaktifkan untuk proteksi XSS, MIME sniffing, dan Clickjacking.

---

## 10. Seed Data & Kredensial Akun Demo

Untuk memfasilitasi pengujian langsung dan demonstrasi portofolio, database disertakan skrip seeder (`prisma/seed.ts`).

### 10.1 Akun Demo Pre-configured

| Role | Nama User | Email Demo | Password Demo |
| :--- | :--- | :--- | :--- |
| **Admin Gudang** | Budi Gudang | `admin.gudang@wms.com` | `Password123!` |
| **Supervisor** | Siti Supervisor | `supervisor@wms.com` | `Password123!` |
| **Admin Sistem** | Andi System | `admin.system@wms.com` | `Password123!` |

### 10.2 Ringkasan Data Initial Seed
* **Role**: `ADMIN_GUDANG`, `SUPERVISOR`, `ADMIN_SISTEM`.
* **Kategori**: 10 Kategori (Elektronik, Perkakas, Materials, Packaging, Chemical, Safety Equipment, Office Supplies, Spareparts, Consumer Goods, Automotive).
* **Supplier**: 10 Supplier Utama PT / CV lengkap dengan kontak person & nomor telepon.
* **Produk**: 30 Item Produk dengan variasi harga, stok, minimum stok, dan lokasi rak.
* **Transaksi**: Minimal 10 Transaksi Barang Masuk, 10 Transaksi Barang Keluar, 3 Penyesuaian Stok, dan 2 Sesi Stock Opname (Status `WAITING_APPROVAL` dan `COMPLETED`).

---

## 11. UI/UX Design System Specification

Aplikasi mengusung tampilan **Enterprise Dashboard Modern** dengan estetika clean, kontras tinggi untuk efisiensi operasional gudang.

* **Layout Structure**:
 * **Sidebar (Left)**: Fixed navigation dengan menu yang disesuaikan otomatis berdasarkan Role JWT.
 * **Topbar (Header)**: Breadcrumbs, Global Search, Notification Bell Badge, Profile Dropdown & Role Tag.
 * **Main Content**: Metric Cards, Dynamic DataTables, Quick Action Floating Toolbar.
* **Component Systems**:
 * **Data Table**: Server-side Pagination, Sorting Indicators, Skeleton Loading state, Empty State Illustration, Filter Drawer.
 * **Status Badges**:
 * `IN`: Green Badge
 * `OUT`: Red Badge
 * `DRAFT`: Gray Badge
 * `WAITING_APPROVAL`: Yellow Badge
 * `APPROVED`: Emerald Badge
 * `REJECTED`: Rose Badge
 * **Interactive Feedback**: Modal Confirmation untuk tindakan destructive, Toast Notifications (Success, Error, Warning).

---

## 12. Roadmap Pengembangan (8-Phase Execution Plan)

Setiap fase memiliki objektif, tugas terstruktur, API endpoints, serta acceptance criteria yang harus terpenuhi sebelum berpindah ke fase berikutnya.

---

### Phase 1: Project Setup, Database Schema & Authentication Infrastructure
* **Tujuan**: Membangun fondasi arsitektur frontend & backend, skema database PostgreSQL via Prisma, serta sistem autentikasi JWT + RBAC.
* **Tugas**:
 1. Initialize monorepo structure (`/frontend` Vite React TS, `/backend` Node Express TS).
 2. Setup Prisma ORM, buat `schema.prisma`, dan jalankan database migration.
 3. Buat authentication controller, JWT sign/verify utils, dan `bcrypt` password hashing.
 4. Buat middleware `authMiddleware` dan `roleMiddleware`.
 5. Buat halaman UI Login, AuthContext, dan Protected Route wrapper pada Frontend.
* **File Dibuat/Diubah**:
 * Backend: `prisma/schema.prisma`, `src/app.ts`, `src/controllers/auth.controller.ts`, `src/middlewares/auth.middleware.ts`, `src/routes/auth.routes.ts`.
 * Frontend: `src/context/AuthContext.tsx`, `src/pages/Login.tsx`, `src/routes/ProtectedRoute.tsx`, `src/services/auth.service.ts`.
* **API Diperlukan**: `POST /api/auth/login`, `GET /api/auth/me`.
* **Database Changes**: Tabel `roles`, `users`.
* **Acceptance Criteria**:
 * Admin Gudang, Supervisor, dan Admin Sistem dapat login dan mendapatkan JWT Token.
 * User tanpa token dilarang mengakses route privat (redirect ke `/login`).
 * Token kadaluwarsa atau invalid ditangani secara otomatis.

---

### Phase 2: Master Data Management (Products, Categories, Suppliers)
* **Tujuan**: Menyediakan manajemen data master barang, kategori, dan supplier sebagai fondasi transaksi gudang.
* **Tugas**:
 1. Buat CRUD API & Service untuk Categories (termasuk cek keterikatan produk sebelum delete).
 2. Buat CRUD API & Service untuk Suppliers.
 3. Buat CRUD API & Service untuk Products (pengecekan keunikan SKU, minStock, rack location).
 4. Buat UI Data Tables, Filter, Search, Modal Form (React Hook Form + Zod) pada Frontend.
* **File Dibuat/Diubah**:
 * Backend: `src/controllers/product.controller.ts`, `src/controllers/category.controller.ts`, `src/controllers/supplier.controller.ts`, `src/services/product.service.ts`.
 * Frontend: `src/pages/Products.tsx`, `src/pages/Categories.tsx`, `src/pages/Suppliers.tsx`, `src/components/common/DataTable.tsx`.
* **API Diperlukan**: `GET/POST/PUT/DELETE /api/products`, `GET/POST/PUT/DELETE /api/categories`, `GET/POST/PUT/DELETE /api/suppliers`.
* **Database Changes**: Tabel `categories`, `suppliers`, `products`.
* **Acceptance Criteria**:
 * Admin Gudang dapat menambah, mengedit, dan mencari produk berdasarkan SKU/Nama.
 * Percobaan pendaftaran SKU duplikat ditolak backend dengan pesan error presisi.
 * Kategori yang masih terikat produk tidak bisa dihapus.

---

### Phase 3: Core Transactions (Stock In & Stock Out)
* **Tujuan**: Mengimplementasikan workflow transaksi penerimaan dan pengeluaran barang dengan automatisasi kalkulasi stok.
* **Tugas**:
 1. Buat API `POST /api/stock-transactions/in` menggunakan Prisma `$transaction` (tambah stok + buat ledger item).
 2. Buat API `POST /api/stock-transactions/out` (cek ketersediaan stok, kurangi stok + buat ledger item).
 3. Buat UI Form Transaksi Barang Masuk & Barang Keluar dengan validasi dynamic unit item.
 4. Buat halaman Transaction History dengan multi-filtering.
* **File Dibuat/Diubah**:
 * Backend: `src/controllers/transaction.controller.ts`, `src/services/transaction.service.ts`, `src/routes/transaction.routes.ts`.
 * Frontend: `src/pages/StockIn.tsx`, `src/pages/StockOut.tsx`, `src/pages/TransactionHistory.tsx`.
* **API Diperlukan**: `POST /api/stock-transactions/in`, `POST /api/stock-transactions/out`, `GET /api/stock-transactions`.
* **Database Changes**: Tabel `stock_transactions`, `stock_transaction_items`.
* **Acceptance Criteria**:
 * Stock In berhasil menambah kuantitas stok produk secara otomatis.
 * Stock Out yang melebihi jumlah stok yang tersedia **PASTI DITOLAK** dengan pesan error ketersediaan stok.
 * Seluruh mutasi stok tercatat rapi di Transaction History.

---

### Phase 4: Inventory Control (Stock Adjustment & Stock Opname Workflow)
* **Tujuan**: Menyediakan mekanisme koreksi stok langsung dan workflow fisik perbandingan stok dengan approval Supervisor.
* **Tugas**:
 1. Buat API & UI Stock Adjustment untuk perbaikan stok cepat beserta catatan alasan.
 2. Buat API Stock Opname State Machine (`DRAFT` -> `COUNTING` -> `WAITING_APPROVAL` -> `APPROVED`/`REJECTED` -> `COMPLETED`).
 3. Buat UI Input Fisik Opname untuk Admin Gudang dan UI Verification/Approval untuk Supervisor.
* **File Dibuat/Diubah**:
 * Backend: `src/controllers/adjustment.controller.ts`, `src/controllers/opname.controller.ts`, `src/services/opname.service.ts`.
 * Frontend: `src/pages/StockAdjustment.tsx`, `src/pages/StockOpname.tsx`, `src/pages/OpnameDetail.tsx`.
* **API Diperlukan**: `POST /api/stock-adjustments`, `POST/PUT /api/stock-opnames`, `POST /api/stock-opnames/:id/verify`.
* **Database Changes**: Tabel `stock_adjustments`, `stock_opnames`, `stock_opname_items`.
* **Acceptance Criteria**:
 * Admin Gudang dapat membuat sesi opname dan memasukkan stok fisik.
 * Hasil opname berstatus `WAITING_APPROVAL` sampai disetujui Supervisor.
 * Begitu disetujui Supervisor, stok sistem otomatis diperbarui sesuai stok fisik.

---

### Phase 5: Executive Dashboard & Analytics Engine
* **Tujuan**: Menampilkan KPI operasional dan grafik visualisasi data real-time.
* **Tugas**:
 1. Buat agregasi API dashboard (`GET /api/dashboard/summary` & `charts`).
 2. Implementasikan Recharts pada frontend: Bar chart mutasi bulanan, Pie chart kategori, Bar chart Low Stock.
 3. Buat KPI Metric Cards dengan indikator perubahan trend.
* **File Dibuat/Diubah**:
 * Backend: `src/controllers/dashboard.controller.ts`, `src/services/dashboard.service.ts`.
 * Frontend: `src/pages/Dashboard.tsx`, `src/components/charts/StockTrendChart.tsx`, `src/components/charts/CategoryPieChart.tsx`.
* **API Diperlukan**: `GET /api/dashboard/summary`, `GET /api/dashboard/charts`.
* **Database Changes**: Tidak ada (menggunakan query agregasi).
* **Acceptance Criteria**:
 * Dashboard menampilkan data aktual langsung dari database (tanpa hardcoded data).
 * Card Low Stock otomatis memperhitungkan jumlah produk yang stoknya <= minStock.

---

### Phase 6: System Governance (Audit Log, Notifications & User Control)
* **Tujuan**: Menjamin keamanan operasional melalui audit trail dan notifikasi otomatis.
* **Tugas**:
 1. Buat helper `createAuditLog` di backend yang dipanggil pada setiap aksi penting.
 2. Buat sistem trigger notifikasi saat stok menipis atau saat opname membutuhkan verifikasi.
 3. Buat UI User Management (Admin Sistem) dan UI Audit Log View.
 4. Buat Notification Bell Badge dropdown pada Topbar Navbar.
* **File Dibuat/Diubah**:
 * Backend: `src/utils/auditLogger.ts`, `src/controllers/audit.controller.ts`, `src/controllers/notification.controller.ts`.
 * Frontend: `src/pages/UserManagement.tsx`, `src/pages/AuditLogs.tsx`, `src/components/layout/NotificationDropdown.tsx`.
* **API Diperlukan**: `GET /api/audit-logs`, `GET/PATCH /api/notifications`, `GET/POST/PATCH /api/users`.
* **Database Changes**: Tabel `audit_logs`, `notifications`.
* **Acceptance Criteria**:
 * Setiap tindakan penting (tambah produk, adjustment, approval) tercatat lengkap di audit log.
 * Supervisor menerima notifikasi real-time saat ada Stock Opname yang menunggu persetujuan.

---

### Phase 7: UI/UX Refinement, Validation Hardening & Security Audit
* **Tujuan**: Penyempurnaan estetika UI, penguatan validasi ganda, dan audit keamanan.
* **Tugas**:
 1. Polishing UI dengan Tailwind CSS (Dark/Light Slate theme, Responsive layout, Glassmorphism card subtle accent).
 2. Tambahkan Toast Feedback (Hot-Toast / Toastify), Empty States, & Skeleton Loaders pada semua tabel.
 3. Terapkan Rate Limiting & Helmet Middleware pada Backend.
 4. Jalankan validation audit Zod di seluruh request body & params.
* **File Dibuat/Diubah**:
 * Backend: `src/middlewares/rateLimiter.ts`, `src/middlewares/errorHandler.ts`.
 * Frontend: Semua file `src/pages/*.tsx` dan `src/components/*.tsx`.
* **API Diperlukan**: Refactoring middleware seluruh endpoint.
* **Acceptance Criteria**:
 * Aplikasi memiliki tampilan profesional kelas enterprise.
 * Seluruh error backend ditampilkan dalam bentuk pesan ramah pengguna di frontend.

---

### Phase 8: Database Seeding, Verification & Portfolio Packaging
* **Tujuan**: Menyiapkan data seeder lengkap, pengujian akhir, dan penyusunan dokumentasi GitHub Portofolio.
* **Tugas**:
 1. Tulis skrip `prisma/seed.ts` (3 Role, 5 Users, 10 Categories, 30 Products, 10 Suppliers, Sample Transactions).
 2. Uji seluruh acceptance criteria dari Phase 1 hingga Phase 7.
 3. Buat `README.md` komprehensif dengan diagram arsitektur, panduan instalasi lokal, API docs, dan akun demo.
* **File Dibuat/Diubah**: `prisma/seed.ts`, `README.md`.
* **Acceptance Criteria**:
 * Perintah `npx prisma db seed` sukses mengisi database dengan data pengujian realistis.
 * Proyek dapat dijalankan secara instan oleh pihak ketiga (recruiter/interviewer) melalui panduan di README.

---

## 13. Portfolio README Standard Template (`README.md`)

Dokumen `README.md` utama dalam repository harus mengikuti struktur berikut:

```markdown
# Enterprise Warehouse Management System (WMS)

A full-stack enterprise-grade Warehouse Management System built with React, Node.js, Express, TypeScript, and PostgreSQL. Designed with a focus on type safety, role-based access control (RBAC), and transactional accuracy for modern warehouse operations.

---

## Key Features
- **Role-Based Access Control (RBAC)**: Segregated workflows for Admin Gudang, Supervisor, and Admin Sistem.
- **Real-Time KPI Dashboard**: Dynamic charts powered by Recharts (Stock movements, Category distribution, Low stock warnings).
- **Stock In & Stock Out**: Automated inventory increment/decrement with transactional safety and stock overflow protection.
- **Stock Opname Workflow**: State-machine approval flow (Draft -> Counting -> Waiting Approval -> Approved/Rejected -> Completed).
- **Low Stock Alerts**: Real-time notifications when product quantity drops below safety limits.
- **Audit Log System**: Track all sensitive mutations (User, Action, Module, IP Address, Timestamp).
- **Reports & Export Engine**: Filterable reports with Print, PDF, and Excel export options.

---

## Architecture & Tech Stack

```text
React (Vite + TS) ---> REST API (Express + TS) ---> Prisma ORM ---> PostgreSQL
 │ │ │
 (TanStack Query, (JWT, Zod, (Migrations,
 React Hook Form, RBAC Middleware) Transactions)
 Tailwind CSS)
```

---

## Demo Credentials

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **Admin Gudang** | `admin.gudang@wms.com` | `Password123!` | Products, Stock In/Out, Stock Opname Count |
| **Supervisor** | `supervisor@wms.com` | `Password123!` | Dashboard, Opname Approval, Audit Logs, Reports |
| **Admin Sistem** | `admin.system@wms.com` | `Password123!` | User Management, System Config, Audit Logs |

---

## Quick Start & Installation

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/yourusername/wms-enterprise.git
cd wms-enterprise

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Setup
Create a `.env` file in `/backend`:
```env
PORT=5003
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wms_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
CORS_ORIGIN="http://localhost:5176"
```

### 3. Database Migration & Seeding
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development Servers
```bash
# Backend (Port 5003)
cd backend && npm run dev

# Frontend (Port 5176)
cd frontend && npm run dev
```
```

---

## 14. Master Acceptance Criteria Checklist

- [x] Autentikasi JWT & Hashing Passwords menggunakan bcrypt.
- [x] Proteksi Route berbasis Role (Admin Gudang, Supervisor, Admin Sistem).
- [x] CRUD Data Produk, Kategori, dan Supplier.
- [x] Pengecekan Keunikan SKU dan Proteksi Hapus Kategori Aktif.
- [x] Transaksi Stock In otomatis menambah stok persediaan.
- [x] Transaksi Stock Out otomatis menolak request jika `quantity > stock`.
- [x] Workflow Stock Opname berlapis (Draft, Counting, Approval Supervisor, Auto-Adjust).
- [x] Dashboard Monitoring mengambil data real-time via REST API.
- [x] Deteksi otomatis Low Stock di Dashboard, Halaman Alert, & Navbar.
- [x] Penyesuaian stok manual (Stock Adjustment) mencatat alasan & audit log.
- [x] Riwayat mutasi stok (Transaction History) dengan filter tanggal & tipe.
- [x] Ekspor laporan ke PDF & Excel.
- [x] Logging aktivitas penting (Audit Log) dengan IP Address & Timestamp.
- [x] Skrip Seeder database lengkap dengan 3 Role & Akun Demo.
- [x] Struktur folder terpisah (`/frontend` dan `/backend`) berbasis TypeScript.
