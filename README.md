# Enterprise Warehouse Management System (WMS)

A full-stack enterprise-grade **Warehouse Management System (WMS)** built with **React.js, Node.js, Express, TypeScript, and PostgreSQL (Prisma ORM)**. Designed with a strong focus on type-safety, role-based access control (RBAC), real-time analytics, and transactional accuracy for modern warehouse supply-chain operations.

---

## Key Features

- **Role-Based Access Control (RBAC)**: Strictly plotted workflows & navigation for `ADMIN_GUDANG`, `SUPERVISOR`, and `ADMIN_SISTEM`.
- **Real-Time Executive Dashboard**: Interactive KPI cards & Recharts visual analytics (30-day mutation trend, Category distribution pie chart, Low stock bar chart, Fast-moving items).
- **Master Data Management**: Full CRUD for Products, Categories, and Suppliers with server-side search, filtering, pagination, SKU uniqueness validation, and active product deletion safeguards.
- **Stock In & Stock Out Transactions**: Automated stock increment/decrement powered by Prisma `$transaction` with live over-stock-out protection.
- **Stock Opname Audit Workflow**: Physical inventory audit state-machine (`DRAFT` -> `COUNTING` -> `WAITING_APPROVAL` -> `APPROVED`/`REJECTED` -> `COMPLETED`).
- **Stock Adjustment**: Instant manual stock correction for damaged, expired, lost, or found items with reason tracking.
- **Transaction History Ledger**: Full inventory mutation history with date-range filters, type tabs, and item stock calculation breakdowns (`stockBefore` -> `stockAfter`).
- **Low Stock System Alerts & Notifications**: Real-time background detection when product stock drops below minimum safety thresholds.
- **Reports & Export Engine**: Inventory Position & Movement Reports with Excel/CSV export and print stylesheet.
- **System Governance & Audit Logs**: Full tracking of sensitive operations (User, Action, Module, IP Address, Timestamp, JSON Payload).

---

## Architecture & Tech Stack

```text
React 18 + Vite (TypeScript) ─── REST API / JSON ───► Express.js (Node.js + TS)
 │ │
 (TanStack Query, (JWT Auth, Zod,
 React Hook Form, RBAC Middleware,
 Tailwind CSS, Rate Limiter)
 Recharts) │
 ▼
 Prisma ORM v5
 │
 ▼
 PostgreSQL Database
```

---

## Demo Credentials Pre-configured

| Role | Nama User | Email Demo | Password | Module Access |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Gudang** | Budi Gudang | `admin.gudang@wms.com` | `Password123!` | Products, Categories, Suppliers, Stock In/Out, Stock Adjustment, Stock Opname Count |
| **Supervisor** | Siti Supervisor | `supervisor@wms.com` | `Password123!` | Dashboard Analytics, Opname Verification (Approve/Reject), Transaction History, Reports, Audit Logs |
| **Admin Sistem** | Andi System | `admin.system@wms.com` | `Password123!` | User & Role Management, System Configuration, Audit Logs |

---

## Quick Start & Installation

### Prerequisites
- **Node.js**: v20+
- **PostgreSQL**: v15+ (Running locally or remote instance)

### 1. Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/yourusername/wms-enterprise.git
cd wms-enterprise

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup
Create a `.env` file in `/backend`:

```env
PORT=5003
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wms_db?schema=public"
JWT_SECRET="wms-super-secret-jwt-key-2026"
JWT_EXPIRES_IN="24h"
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
# Terminal 1: Backend Server (Port 5003)
cd backend
npm run dev

# Terminal 2: Frontend Application (Port 5176)
cd frontend
npm run dev
```

Open your browser at `http://localhost:5176` and use the **Quick Demo Account Switcher** on the login page!

---

## API Endpoints Catalog

| Group | Method | Endpoint Path | Access Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Public | Authenticate user & issue Bearer JWT Token |
| **Auth** | `GET` | `/api/auth/me` | All Roles | Fetch current authenticated user metadata |
| **Dashboard** | `GET` | `/api/dashboard/summary` | All Roles | Fetch real-time KPI metric summaries |
| **Dashboard** | `GET` | `/api/dashboard/charts` | All Roles | Fetch Recharts analytics data |
| **Products** | `GET` | `/api/products` | All Roles | Paginated product catalog with search & filters |
| **Products** | `POST` | `/api/products` | Admin Gudang | Create new product item |
| **Products** | `PUT` | `/api/products/:id` | Admin Gudang | Update product details |
| **Products** | `PATCH` | `/api/products/:id/status` | Admin Gudang | Toggle active/inactive product status |
| **Categories**| `GET` | `/api/categories` | All Roles | Fetch product categories |
| **Categories**| `POST` | `/api/categories` | Admin Gudang | Create category |
| **Categories**| `DELETE` | `/api/categories/:id` | Admin Gudang | Delete category (safeguarded against linked products) |
| **Suppliers** | `GET` | `/api/suppliers` | All Roles | Fetch suppliers catalog |
| **Suppliers** | `POST` | `/api/suppliers` | Admin Gudang | Add new supplier |
| **Stock In** | `POST` | `/api/stock-transactions/in` | Admin Gudang | Receive stock from supplier |
| **Stock Out** | `POST` | `/api/stock-transactions/out` | Admin Gudang | Issue stock to destination (over-stock protected) |
| **History** | `GET` | `/api/stock-transactions` | All Roles | Global Transaction Ledger |
| **Adjustment**| `POST` | `/api/stock-adjustments` | Admin Gudang | Instant manual stock correction |
| **Opname** | `POST` | `/api/stock-opnames` | Admin Gudang | Create Stock Opname audit session |
| **Opname** | `PUT` | `/api/stock-opnames/:id/counts` | Admin Gudang | Update physical stock counts |
| **Opname** | `POST` | `/api/stock-opnames/:id/submit` | Admin Gudang | Submit opname for Supervisor verification |
| **Opname** | `POST` | `/api/stock-opnames/:id/verify` | Supervisor | Approve or Reject Stock Opname session |
| **Reports** | `GET` | `/api/reports/stock` | All Roles | Stock Position Report |
| **Reports** | `GET` | `/api/reports/movements` | All Roles | Inventory Movement Report |
| **Users** | `GET/POST` | `/api/users` | Admin Sistem | System User Management & RBAC Role allocation |
| **Audit Logs**| `GET` | `/api/audit-logs` | Supervisor, Admin Sys | View system audit trail & JSON details |
| **Notifs** | `GET/PATCH`| `/api/notifications` | All Roles | Fetch & mark unread notifications |

---

## Database Entity Relationship Diagram (ERD)

```text
ROLES (1) ───< (N) USERS (1) ───< (N) STOCK_TRANSACTIONS (1) ───< (N) STOCK_TRANSACTION_ITEMS
 │
 ├───< (N) STOCK_ADJUSTMENTS
 │
 ├───< (N) STOCK_OPNAMES (1) ───< (N) STOCK_OPNAME_ITEMS
 │
 ├───< (N) AUDIT_LOGS
 │
 └───< (N) NOTIFICATIONS

CATEGORIES (1) ───< (N) PRODUCTS (1) ───< (N) STOCK_TRANSACTION_ITEMS
SUPPLIERS (1) ───< (N) PRODUCTS (1) ───< (N) STOCK_OPNAME_ITEMS
```

---

## [x] Acceptance Criteria Checklist

- [x] **Full-Stack Decoupled Monorepo Architecture**: Independent `/frontend` React Vite app & `/backend` Express REST API.
- [x] **JWT Authentication & bcrypt Password Hashing**: Secure token-based session handling with bcrypt salt factor 10.
- [x] **Strict RBAC Navigation Plotting**: Dedicated navigation menus and route guards for Admin Gudang, Supervisor, and Admin Sistem.
- [x] **Master Data CRUD & Validations**: SKU uniqueness check, product-category dependency deletion protection, supplier contact directory.
- [x] **Transactional Stock In & Stock Out**: Atomic stock updates via `prisma.$transaction` with live over-stock-out prevention.
- [x] **Stock Opname State Machine Workflow**: Audit flow (`DRAFT` -> `COUNTING` -> `WAITING_APPROVAL` -> `APPROVED`/`REJECTED` -> `COMPLETED`) with Supervisor approval auto-adjustment.
- [x] **Instant Stock Adjustment**: Manual correction with reason categorization (`DAMAGED`, `EXPIRED`, `LOST`, `FOUND`, `OTHER`).
- [x] **Real-Time Analytics & Recharts**: Executive dashboard KPI cards and interactive charts.
- [x] **Reports Engine & Excel Export**: Inventory position and movement reports with Excel/CSV export and print view.
- [x] **System Governance & Audit Logs**: Detailed audit trail (User, Action, Module, IP Address, Timestamp, JSON Details).
- [x] **Database Seeding**: Skrip seeder pre-configured with 3 roles, 3 demo accounts, 10 categories, 10 suppliers, and 30 products.

---

## License
This project is open-source and available under the [MIT License](LICENSE).
