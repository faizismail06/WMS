import { PrismaClient, RoleName, UserStatus, ProductStatus, TransactionType, OpnameStatus, AdjustmentReason } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
 console.log(" Starting Database Seeding...");

 // 1. Seed Roles
 console.log("-> Seeding Roles...");
 const adminGudangRole = await prisma.role.upsert({
 where: { name: RoleName.ADMIN_GUDANG },
 update: {},
 create: {
 name: RoleName.ADMIN_GUDANG,
 description: "Admin Gudang - Mengelola data barang, supplier, transaksi barang masuk & keluar, serta opname."
 }
 });

 const supervisorRole = await prisma.role.upsert({
 where: { name: RoleName.SUPERVISOR },
 update: {},
 create: {
 name: RoleName.SUPERVISOR,
 description: "Supervisor Gudang - Memantau dashboard, memverifikasi stock opname, dan mengunduh laporan."
 }
 });

 const adminSistemRole = await prisma.role.upsert({
 where: { name: RoleName.ADMIN_SISTEM },
 update: {},
 create: {
 name: RoleName.ADMIN_SISTEM,
 description: "Admin Sistem - Mengelola pengguna, hak akses role, konfigurasi sistem, dan audit log."
 }
 });

 // 2. Seed Users
 console.log("-> Seeding Users...");
 const hashedPassword = await bcrypt.hash("Password123!", 10);

 const userGudang = await prisma.user.upsert({
 where: { email: "admin.gudang@wms.com" },
 update: {},
 create: {
 email: "admin.gudang@wms.com",
 password: hashedPassword,
 fullName: "Budi Gudang",
 roleId: adminGudangRole.id,
 status: UserStatus.ACTIVE
 }
 });

 const userSupervisor = await prisma.user.upsert({
 where: { email: "supervisor@wms.com" },
 update: {},
 create: {
 email: "supervisor@wms.com",
 password: hashedPassword,
 fullName: "Siti Supervisor",
 roleId: supervisorRole.id,
 status: UserStatus.ACTIVE
 }
 });

 const userAdminSystem = await prisma.user.upsert({
 where: { email: "admin.system@wms.com" },
 update: {},
 create: {
 email: "admin.system@wms.com",
 password: hashedPassword,
 fullName: "Andi System",
 roleId: adminSistemRole.id,
 status: UserStatus.ACTIVE
 }
 });

 // 3. Seed Categories
 console.log("-> Seeding Categories...");
 const categoryData = [
 { code: "CAT-ELEC", name: "Elektronik & Kelistrikan", description: "Perangkat elektronik, sensor, kabel, dan panel listrik" },
 { code: "CAT-TOOL", name: "Perkakas & Industri", description: "Mesin hand-tools, kunci pas, bor, dan perlengkapan teknisi" },
 { code: "CAT-MATR", name: "Material Bangunan", description: "Besi, semen, cat, dan kayu konstruksi" },
 { code: "CAT-PACK", name: "Kemasan & Packaging", description: "Kardus, bubble wrap, lakban, dan plastik wrapping" },
 { code: "CAT-CHEM", name: "Bahan Kimia Industri", description: "Pelumas, pembersih mesin, dan bahan pelarut" },
 { code: "CAT-SAFE", name: "Safety & APD", description: "Helm keselamatan, sepatu safety, sarung tangan, dan masker" },
 { code: "CAT-OFFC", name: "Perlengkapan Kantor", description: "Kertas A4, tinta printer, dan stationary" },
 { code: "CAT-SPAR", name: "Spareparts Mesin", description: "Bearing, rantai, belt conveyor, dan seal piston" },
 { code: "CAT-CONS", name: "Consumer Goods", description: "Produk konsumsi siap pakai dan minimarket" },
 { code: "CAT-AUTO", name: "Otomotif & Transport", description: "Oli armada, ban forklift, dan aki kendaraan" }
 ];

 const categories = [];
 for (const cat of categoryData) {
 const c = await prisma.category.upsert({
 where: { code: cat.code },
 update: {},
 create: { ...cat, status: ProductStatus.ACTIVE }
 });
 categories.push(c);
 }

 // 4. Seed Suppliers
 console.log("-> Seeding Suppliers...");
 const supplierData = [
 { code: "SUP-001", name: "PT Panasonic Industrial Indonesia", contactPerson: "Hendra Wijaya", phone: "021-5550192", email: "sales@panasonic-ind.co.id", address: "Kawasan Industri MM2100, Cikarang" },
 { code: "SUP-002", name: "CV Teknik Utama Sejahtera", contactPerson: "Rina Marlina", phone: "021-8849102", email: "info@teknikutama.com", address: "Jl. Industri Raya No. 45, Jakarta Barat" },
 { code: "SUP-003", name: "PT Indocement Tunggal Perkasa", contactPerson: "Bambang Santoso", phone: "021-8754321", email: "orders@indocement.co.id", address: "Citeureup, Bogor, Jawa Barat" },
 { code: "SUP-004", name: "PT Packindo Jaya Mandiri", contactPerson: "Dewi Lestari", phone: "021-4432109", email: "sales@packindojaya.com", address: "Kawasan BSF, Tangerang" },
 { code: "SUP-005", name: "PT Pertamina Lubricants", contactPerson: "Agus Pratama", phone: "021-3815111", email: "lubricants@pertamina.com", address: "Gedung Utama Pertamina, Jakarta Pusat" },
 { code: "SUP-006", name: "CV Safety First Indonesia", contactPerson: "Eko Raharjo", phone: "021-6677889", email: "contact@safetyfirst.co.id", address: "Glodok Plaza Lt. 3, Jakarta Barat" },
 { code: "SUP-007", name: "PT Paperina Duta Nusantara", contactPerson: "Siska Putri", phone: "021-7788990", email: "sales@paperina.com", address: "Kawasan Industri Pulogadung, Jakarta Timur" },
 { code: "SUP-008", name: "PT SKF Bearing Indonesia", contactPerson: "Rudi Hartono", phone: "021-2998877", email: "info.skf@skf.com", address: "Kawasan KIIC, Karawang" },
 { code: "SUP-009", name: "PT Mayora Indah Tbk", contactPerson: "Lia Susanti", phone: "021-5655320", email: "corporate@mayora.co.id", address: "Daan Mogot Km 18, Jakarta Barat" },
 { code: "SUP-010", name: "PT Gajah Tunggal Tbk", contactPerson: "Dedi Kurniawan", phone: "021-5901308", email: "tiresales@gt-tires.com", address: "Jl. Jatake No. 88, Tangerang" }
 ];

 const suppliers = [];
 for (const sup of supplierData) {
 const s = await prisma.supplier.upsert({
 where: { code: sup.code },
 update: {},
 create: { ...sup, status: ProductStatus.ACTIVE }
 });
 suppliers.push(s);
 }

 // 5. Seed Products (30 Products)
 console.log("-> Seeding Products...");
 const productSeeds = [
 { sku: "PRD-ELC-001", name: "MCB Schneider 3 Phase 16A", categoryId: categories[0].id, unit: "PCS", supplierId: suppliers[0].id, price: 285000, stock: 45, minStock: 10, rackLocation: "RAK-A1-01" },
 { sku: "PRD-ELC-002", name: "Kabel NYY 3x2.5mm Supreme 100m", categoryId: categories[0].id, unit: "ROLL", supplierId: suppliers[0].id, price: 1450000, stock: 12, minStock: 5, rackLocation: "RAK-A1-02" },
 { sku: "PRD-ELC-003", name: "Inverter Omron 2.2kW 380V", categoryId: categories[0].id, unit: "UNIT", supplierId: suppliers[0].id, price: 4800000, stock: 3, minStock: 5, rackLocation: "RAK-A1-03" }, // Low stock!
 
 { sku: "PRD-TOL-001", name: "Mesin Bor Tangan Bosch GSB 550", categoryId: categories[1].id, unit: "UNIT", supplierId: suppliers[1].id, price: 780000, stock: 18, minStock: 5, rackLocation: "RAK-B1-01" },
 { sku: "PRD-TOL-002", name: "Kunci Socket Set 24pcs Tekiro", categoryId: categories[1].id, unit: "BOX", supplierId: suppliers[1].id, price: 650000, stock: 25, minStock: 8, rackLocation: "RAK-B1-02" },
 { sku: "PRD-TOL-003", name: "Gerinda Tangan Maktec MT90", categoryId: categories[1].id, unit: "UNIT", supplierId: suppliers[1].id, price: 520000, stock: 4, minStock: 5, rackLocation: "RAK-B1-03" }, // Low stock!

 { sku: "PRD-MAT-001", name: "Semen Tiga Roda 50kg", categoryId: categories[2].id, unit: "ZAK", supplierId: suppliers[2].id, price: 68000, stock: 150, minStock: 30, rackLocation: "PALLET-C-01" },
 { sku: "PRD-MAT-002", name: "Cat Tembok Dulux Weathershield 20L", categoryId: categories[2].id, unit: "PAIL", supplierId: suppliers[2].id, price: 1850000, stock: 15, minStock: 5, rackLocation: "RAK-C1-02" },
 { sku: "PRD-MAT-003", name: "Besi Beton 12mm Polos 12m", categoryId: categories[2].id, unit: "BATANG", supplierId: suppliers[2].id, price: 112000, stock: 200, minStock: 50, rackLocation: "RACK-OUTDOOR-1" },

 { sku: "PRD-PCK-001", name: "Kardus Polos Double Wall 40x30x30", categoryId: categories[3].id, unit: "PCS", supplierId: suppliers[3].id, price: 12500, stock: 500, minStock: 100, rackLocation: "RAK-D1-01" },
 { sku: "PRD-PCK-002", name: "Bubble Wrap Roll 1.25m x 50m", categoryId: categories[3].id, unit: "ROLL", supplierId: suppliers[3].id, price: 165000, stock: 35, minStock: 10, rackLocation: "RAK-D1-02" },
 { sku: "PRD-PCK-003", name: "Lakban Coklat Daimaru 48mm 90m", categoryId: categories[3].id, unit: "DUS", supplierId: suppliers[3].id, price: 340000, stock: 2, minStock: 10, rackLocation: "RAK-D1-03" }, // Low stock!

 { sku: "PRD-CHM-001", name: "Oli Industri Meditran SX 15W-40 200L", categoryId: categories[4].id, unit: "DRUM", supplierId: suppliers[4].id, price: 8500000, stock: 8, minStock: 3, rackLocation: "PALLET-E-01" },
 { sku: "PRD-CHM-002", name: "Grease Chassis Pertamina 15kg", categoryId: categories[4].id, unit: "PAIL", supplierId: suppliers[4].id, price: 720000, stock: 14, minStock: 5, rackLocation: "RAK-E1-02" },
 { sku: "PRD-CHM-003", name: "Cairan Degreaser Cleaner 20L", categoryId: categories[4].id, unit: "JERICO", supplierId: suppliers[4].id, price: 450000, stock: 10, minStock: 5, rackLocation: "RAK-E1-03" },

 { sku: "PRD-SAF-001", name: "Helm Safety MSA V-Gard Original", categoryId: categories[5].id, unit: "PCS", supplierId: suppliers[5].id, price: 185000, stock: 60, minStock: 15, rackLocation: "RAK-F1-01" },
 { sku: "PRD-SAF-002", name: "Sepatu Safety Krushers Utah Steel Toe", categoryId: categories[5].id, unit: "PASANG", supplierId: suppliers[5].id, price: 480000, stock: 22, minStock: 10, rackLocation: "RAK-F1-02" },
 { sku: "PRD-SAF-003", name: "Sarung Tangan Bintik Kuning Dus (12dz)", categoryId: categories[5].id, unit: "DUS", supplierId: suppliers[5].id, price: 290000, stock: 16, minStock: 5, rackLocation: "RAK-F1-03" },

 { sku: "PRD-OFC-001", name: "Kertas HVS PaperOne A4 80gsm Ream", categoryId: categories[6].id, unit: "BOX", supplierId: suppliers[6].id, price: 245000, stock: 40, minStock: 10, rackLocation: "RAK-G1-01" },
 { sku: "PRD-OFC-002", name: "Tinta Printer Epson 664 Black Original", categoryId: categories[6].id, unit: "BOTOL", supplierId: suppliers[6].id, price: 92000, stock: 30, minStock: 8, rackLocation: "RAK-G1-02" },

 { sku: "PRD-SPR-001", name: "Bearing SKF 6205 2RSH", categoryId: categories[7].id, unit: "PCS", supplierId: suppliers[7].id, price: 65000, stock: 120, minStock: 25, rackLocation: "RAK-H1-01" },
 { sku: "PRD-SPR-002", name: "Conveyor Belt Rubber 800mm 4 Ply", categoryId: categories[7].id, unit: "METER", supplierId: suppliers[7].id, price: 420000, stock: 50, minStock: 15, rackLocation: "RAK-H1-02" },
 { sku: "PRD-SPR-003", name: "Oil Seal Viton TC 40-62-10", categoryId: categories[7].id, unit: "PCS", supplierId: suppliers[7].id, price: 35000, stock: 1, minStock: 10, rackLocation: "RAK-H1-03" }, // Low stock!

 { sku: "PRD-CNS-001", name: "Air Mineral Le Minerale 600ml DUS", categoryId: categories[8].id, unit: "DUS", supplierId: suppliers[8].id, price: 48000, stock: 85, minStock: 20, rackLocation: "RAK-I1-01" },
 { sku: "PRD-CNS-002", name: "Kopi Beng-Beng 1 Dus (12 renteng)", categoryId: categories[8].id, unit: "DUS", supplierId: suppliers[8].id, price: 135000, stock: 30, minStock: 10, rackLocation: "RAK-I1-02" },

 { sku: "PRD-AUT-001", name: "Ban Pneumatic Forklift 28x9-15 GT", categoryId: categories[9].id, unit: "UNIT", supplierId: suppliers[9].id, price: 2950000, stock: 8, minStock: 4, rackLocation: "PALLET-J-01" },
 { sku: "PRD-AUT-002", name: "Aki GS Astra 12V 100Ah N100", categoryId: categories[9].id, unit: "UNIT", supplierId: suppliers[9].id, price: 1850000, stock: 6, minStock: 3, rackLocation: "RAK-J1-02" }
 ];

 const products = [];
 for (const prod of productSeeds) {
 const p = await prisma.product.upsert({
 where: { sku: prod.sku },
 update: {},
 create: { ...prod, status: ProductStatus.ACTIVE }
 });
 products.push(p);
 }

 // 6. Seed Sample Transactions
 console.log("-> Seeding Sample Stock Transactions...");
 const sampleTrxIn = await prisma.stockTransaction.upsert({
 where: { transactionNo: "TRX-IN-20260920-0001" },
 update: {},
 create: {
 transactionNo: "TRX-IN-20260920-0001",
 type: TransactionType.IN,
 supplierId: suppliers[0].id,
 notes: "Penerimaan PO #PO-2026-0901 dari Panasonic",
 createdById: userGudang.id,
 items: {
 create: [
 {
 productId: products[0].id,
 quantity: 20,
 unitPrice: 285000,
 totalPrice: 5700000,
 stockBefore: 25,
 stockAfter: 45
 }
 ]
 }
 }
 });

 const sampleTrxOut = await prisma.stockTransaction.upsert({
 where: { transactionNo: "TRX-OUT-20260921-0001" },
 update: {},
 create: {
 transactionNo: "TRX-OUT-20260921-0001",
 type: TransactionType.OUT,
 destination: "Departemen Maintenance Line 2",
 notes: "Permintaan pengantian sparepart conveyor",
 createdById: userGudang.id,
 items: {
 create: [
 {
 productId: products[20].id, // Bearing SKF
 quantity: 10,
 unitPrice: 65000,
 totalPrice: 650000,
 stockBefore: 130,
 stockAfter: 120
 }
 ]
 }
 }
 });

 // 7. Seed Sample Stock Opname
 console.log("-> Seeding Sample Stock Opname...");
 await prisma.stockOpname.upsert({
 where: { opnameNo: "OPN-202609-0001" },
 update: {},
 create: {
 opnameNo: "OPN-202609-0001",
 title: "Stock Opname Bulanan September 2026",
 period: "2026-09",
 status: OpnameStatus.WAITING_APPROVAL,
 notes: "Pemeriksaan fisik stok area Rak A dan Rak H",
 createdById: userGudang.id,
 items: {
 create: [
 {
 productId: products[0].id,
 systemStock: 45,
 physicalStock: 45,
 difference: 0,
 notes: "Sesuai"
 },
 {
 productId: products[2].id, // Inverter
 systemStock: 3,
 physicalStock: 2,
 difference: -1,
 notes: "1 unit dalam proses perbaikan garansi"
 }
 ]
 }
 }
 });

 // 8. Seed Initial Notifications
 console.log("-> Seeding Notifications...");
 await prisma.notification.createMany({
 data: [
 {
 userId: userSupervisor.id,
 title: "Stock Opname Menunggu Verifikasi",
 message: "Stock Opname 'OPN-202609-0001' telah disubmit oleh Budi Gudang dan membutuhkan persetujuan Anda.",
 type: "OPNAME_APPROVAL"
 },
 {
 userId: userGudang.id,
 title: "Peringatan Stok Menipis",
 message: "Produk PRD-ELC-003 (Inverter Omron) berada di bawah stok minimum (Sisa: 3, Min: 5).",
 type: "LOW_STOCK"
 }
 ]
 });

 // 9. Seed Audit Logs
 console.log("-> Seeding Initial Audit Logs...");
 await prisma.auditLog.createMany({
 data: [
 {
 userId: userAdminSystem.id,
 action: "INITIAL_DATABASE_SEED",
 module: "SYSTEM",
 details: { message: "Database WMS berhasil di-seed dengan data master awal." },
 ipAddress: "127.0.0.1"
 },
 {
 userId: userGudang.id,
 action: "CREATE_STOCK_IN",
 module: "TRANSACTIONS",
 recordId: sampleTrxIn.id,
 details: { transactionNo: "TRX-IN-20260920-0001", totalItems: 1 },
 ipAddress: "127.0.0.1"
 }
 ]
 });

 console.log("[x] Database Seeding Completed Successfully!");
}

main()
 .catch((e) => {
 console.error("[ ] Error during seeding:", e);
 process.exit(1);
 })
 .finally(async () => {
 await prisma.$disconnect();
 });
