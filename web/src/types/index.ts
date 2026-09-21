export type UserRole = "SUPER_ADMIN" | "ADMIN_KOPERASI" | "HR_PAYROLL" | "PENGELOLA_KANTIN" | "FINANCE_AUDIT";

export type SystemModuleKey =
  | "dashboard"
  | "employees"
  | "savings_loans"
  | "canteen"
  | "store"
  | "payroll"
  | "bank_channeling"
  | "user_management";

export type ModuleAccessLevel = "NONE" | "READ" | "FULL";

export interface UserAccount {
  id: string;
  username: string; // e.g., "superadmin", "dewi.hrd", "kasir.kantin"
  email: string;    // e.g., "superadmin@bhakti.co.id"
  name: string;
  role: UserRole;
  department: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  lastLogin: string;
  avatarUrl?: string;
  isRootSuperadmin?: boolean; // Protect root superadmin from accidental deletion
  permissions: Record<SystemModuleKey, ModuleAccessLevel>;
}

export type PositionLevel = "Operator" | "Staff" | "Supervisor" | "Manager" | "Kepala Divisi";

export interface EmployeeMember {
  id: string;
  nik: string;
  name: string;
  department: string;
  position: PositionLevel;
  joinDate: string; // YYYY-MM-DD
  tenureYears: number;
  monthlySalary: number; // e.g., Rp 10.000.000
  isCoopMember: boolean;
  memberSinceDate: string;
  // Dynamic loan limit calculation based on Position & Tenure
  calculatedLoanLimit: number;
  activeLoanAmount: number;
  remainingLoanLimit: number;
  // Savings
  simpananWajib: number;
  simpananSukarela: number;
  simpananSukarelaLockedUntil?: string; // e.g. 6/12 month lock
  isSimpananWajibWithdrawable: boolean; // eligible after threshold tenure
  canteenMonthlyBill: number; // unpaid canteen bill for payroll deduction
  avatarUrl?: string;
}

export type LoanStatus = "PENDING_HR" | "PENDING_KOPERASI" | "APPROVED" | "REJECTED" | "DISBURSED" | "ACTIVE" | "PAID_OFF";

export interface LoanApplication {
  id: string;
  employeeId: string;
  employeeNik: string;
  employeeName: string;
  department: string;
  position: PositionLevel;
  amount: number;
  tenorMonths: number;
  monthlyInstallment: number;
  interestRateAnnual: number;
  purpose: string;
  status: LoanStatus;
  appliedDate: string;
  fundingSource: "KAS_KOPERASI" | "BANK_CHANNELING";
  bankPartnerName?: string;
}

export type ProductCategory = "MAKANAN" | "MINUMAN" | "ELEKTRONIK_BIT" | "ALAT_KERJA" | "KEBUTUHAN_HARIAN";

// ==========================================
// TOKO KOPERASI & PENJUALAN ELEKTRONIK / BARANG
// ==========================================
export type StoreCategory =
  | "ELEKTRONIK_RUMAH"
  | "PERKAKAS_KERJA"
  | "PERALATAN_DAPUR"
  | "KESEHATAN_SAFETY"
  | "MERCHANDISE_BIT";

export interface StoreProduct {
  id: string;
  code: string; // e.g. "ELK-001"
  name: string;
  category: StoreCategory;
  brand: string; // e.g. "Maspion", "Cosmos", "Philips", "Bosch", "Krisbow"
  cashPrice: number; // Harga Kontan / Tunai Koperasi
  memberPrice: number; // Harga Khusus Anggota Koperasi
  installmentAvailable: boolean; // Bisa dicicil via Payroll
  maxInstallmentMonths: number; // e.g. 12 bulan
  stock: number;
  unit: string; // e.g. "Unit", "Set", "Pcs"
  imageUrl: string;
  description: string;
  warrantyPeriod: string; // e.g. "1 Tahun Resmi"
  rating?: number;
  soldCount?: number;
}

export type StorePaymentMethod = "TUNAI" | "QRIS_MANDIRI" | "POTONG_GAJI_CICILAN" | "SALDO_SUKARELA";

export interface StoreTransactionItem {
  productId: string;
  productCode: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface StoreTransaction {
  id: string;
  invoiceNumber: string; // e.g. "INV-STORE-2026-089"
  employeeId: string;
  employeeNik: string;
  employeeName: string;
  department: string;
  position: PositionLevel;
  items: StoreTransactionItem[];
  totalAmount: number;
  totalSaved: number;
  paymentMethod: StorePaymentMethod;
  installmentMonths?: number; // e.g. 1, 3, 6, 12 Bulan
  monthlyInstallment?: number; // Nominal potong gaji / bulan
  payrollCutoffDay?: number; // 25
  status: "LUNAS" | "CICILAN_BERJALAN";
  cashReceived?: number;
  cashChange?: number;
  transactionDate: string; // YYYY-MM-DD HH:mm
  notes?: string;
}

export type TenantStatus = "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | "REJECTED";

export interface CanteenQrisProfile {
  id: string;
  label: string; // e.g. "QRIS Utama BCA - Stand Mbak Sri"
  imageUrl: string; // Base64 data URL or public file path
  nmid: string; // e.g. "ID1020039281920"
  bankOrProvider?: string; // e.g. "BCA", "Mandiri", "Nobu Kopkar", "BRI", "Lainnya"
  isActive: boolean; // True if this QRIS is currently active for POS and Employee App
  createdAt?: string;
}

export interface CanteenTenant {
  id: string;
  name: string; // e.g., "Kantin Mbak Sri - Masakan Nusantara"
  ownerName: string; // e.g., "Sri Wahyuni"
  ownerNik?: string;
  username: string; // e.g., "kantin.sri"
  password?: string;
  email: string;
  phone: string;
  location: string; // e.g., "Kantin Utama - Stand 01"
  category: string; // e.g., "Masakan Nusantara & Aneka Nasi"
  description?: string;
  isOpen?: boolean; // Status operasional buka/tutup
  openingHours?: string; // e.g. "07:30 - 16:30 WIB"
  whatsappContact?: string;
  qrisImageUrl?: string; // Barcode QRIS Stand (active fallback)
  qrisNmid?: string; // NMID QRIS (active fallback)
  qrisProfiles?: CanteenQrisProfile[]; // Up to 3 QRIS profiles
  activeQrisId?: string; // ID of active QRIS
  bannerUrl?: string;
  bankName: string; // e.g., "Bank Mandiri"
  bankAccountNumber: string; // e.g., "137-00-1928371-2"
  bankAccountName: string; // e.g., "Sri Wahyuni"
  status: TenantStatus;
  createdAt: string;
  totalRevenue: number;
  pendingSettlement: number;
  activeProductsCount: number;
  rating: number;
  avatarUrl?: string;
  notes?: string;
}

export interface TenantUpdateRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  submittedAt: string;
  requestedFields: {
    name?: string;
    ownerName?: string;
    ownerNik?: string;
    phone?: string;
    email?: string;
    location?: string;
    category?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
  };
  reason: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  adminNotes?: string;
  reviewedAt?: string;
}

export interface CanteenProduct {
  id: string;
  tenantId?: string; // Multi-tenant owner stand
  tenantName?: string;
  name: string;
  category: ProductCategory;
  regularPrice: number; // Harga Umum
  memberPrice: number;  // Harga Khusus Karyawan Koperasi (Diskon Khusus)
  stock: number;
  unit: string;
  imageUrl?: string;
  description?: string;
}

export type CanteenOrderStatus =
  | "MENUNGGU_KONFIRMASI"
  | "DIPROSES"
  | "SIAP_DIAMBIL"
  | "SELESAI"
  | "DIBATALKAN";

export type CanteenPaymentMethod = "POTONG_GAJI" | "SALDO_KOPERASI" | "QRIS_TUNAI" | "CASH_TUNAI";

export interface CanteenOrderItem {
  productId: string;
  productName: string;
  price: number; // Harga anggota
  regularPrice?: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface CanteenOrder {
  id: string;
  tenantId?: string;
  tenantName?: string;
  orderNumber: string; // e.g. "ORD-BIT-881"
  employeeId: string;
  employeeNik: string;
  employeeName: string;
  department: string;
  items: CanteenOrderItem[];
  totalAmount: number;
  totalSaved: number; // Penghematan berkat harga anggota
  paymentMethod: CanteenPaymentMethod;
  cashReceived?: number; // Nominal uang tunai yang diterima dari pembeli
  cashChange?: number; // Nominal uang kembalian untuk pembeli
  status: CanteenOrderStatus;
  orderType: "KANTIN_MAKANAN" | "KANTIN_PRODUK";
  pickupTime?: string; // e.g. "Jam Istirahat 12:00"
  notes?: string;
  createdAt: string;
}

export interface EmployeeCanteenActivity {
  id: string;
  transactionTime: string; // YYYY-MM-DD HH:mm
  employeeId: string;
  employeeNik: string;
  employeeName: string;
  department: string;
  tenantId: string;
  tenantName: string;
  itemsSummary: string; // e.g. "2x Ayam Geprek, 1x Es Teh"
  totalAmount: number;
  memberSavings: number;
  paymentMethod: CanteenPaymentMethod;
  payrollCutoffDate: string; // e.g. "2026-09-25"
  settlementStatus: "PENDING_CUTOFF" | "SETTLED_TO_TENANT";
}

export interface CanteenSettlement {
  id: string;
  tenantId: string;
  tenantName: string;
  period: string; // e.g. "September 2026 (Cutoff 25)"
  totalTransactions: number;
  grossRevenue: number;
  platformFee: number; // e.g. 1% atau iuran koperasi
  netDisbursement: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  status: "PENDING" | "PROCESSED";
  processedAt?: string;
}

export interface PayrollDeductionRecord {
  employeeId: string;
  nik: string;
  name: string;
  department: string;
  baseSalary: number;
  simpananWajibDeduction: number;
  loanInstallmentDeduction: number;
  canteenBillDeduction: number;
  totalDeductions: number;
  netTakeHomePay: number;
  period: string; // e.g., "September 2026"
  status: "DRAFT" | "PROCESSED" | "FINALIZED";
}

export interface BankLiquidityStatus {
  cooperativeCashReserve: number; // e.g. Rp 120.000.000
  totalActiveLoans: number;       // e.g. Rp 850.000.000
  pendingLoanDemand: number;      // e.g. Rp 250.000.000
  isLiquidityTight: boolean;
  bankCreditLineLimit: number;   // e.g. Rp 1.000.000.000 dari Bank Mitra (Bank BNI / Mandiri / BRI)
  bankCreditLineUsed: number;
  bankPartnerName: string;
}

export interface BankPartnerProfile {
  id: string;
  code: "MANDIRI" | "BSI" | "BCA" | "BRI";
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  pksNumber: string;
  pksSignedDate: string;
  pksExpiryDate: string;
  creditLineLimit: number;
  creditLineUsed: number;
  wholesaleInterestRate: number; // % per annum (Cost of Fund)
  maxTenorMonths: number;
  scheme: "KONVENSIONAL" | "SYARIAH_MURABAHAH";
  h2hStatus: "CONNECTED" | "STANDBY" | "MAINTENANCE";
  isPrimary: boolean;
  contactPerson: string;
  contactPhone: string;
}

export interface BankDrawdownTranche {
  id: string;
  referenceNumber: string; // e.g. TRX-MDR-20260901-081
  bankId: string;
  bankName: string;
  drawdownDate: string;
  drawdownTime: string;
  amount: number;
  purpose: string;
  status: "SELESAI" | "DIPROSES" | "TERJADWAL";
  picApproval: string;
  disbursementChannel: "KAS_KOPERASI" | "DIRECT_PAYROLL_ACCOUNT";
  interestRateAnnual: number;
  tenorMonths: number;
  monthlyRepaymentToBank: number;
  notes?: string;
}

export interface ChannelingLoanDebtor {
  id: string;
  loanId: string;
  employeeId: string;
  employeeNik: string;
  employeeName: string;
  department: string;
  position: string;
  bankName: string;
  approvedAmount: number;
  disbursedDate: string;
  outstandingBalance: number;
  tenorMonths: number;
  paidMonths: number;
  monthlyInstallment: number;
  bankWholesaleRate: number; // e.g. 5.25%
  coopInterestRate: number;  // e.g. 7.50%
  coopNetMarginRate: number; // e.g. 2.25%
  autodebetPayrollStatus: "LANCAR" | "HOLD" | "TIDAK_AKTIF";
  collectibilityScore: "LANCAR (KOL-1)" | "DALAM_PENGAWASAN (KOL-2)" | "KURANG_LANCAR (KOL-3)";
  purpose: string;
}

export interface BankRepaymentSchedule {
  id: string;
  period: string; // e.g. "September 2026"
  bankId: string;
  bankName: string;
  dueDate: string; // e.g. "2026-09-28"
  principalAmount: number;
  interestAmount: number;
  totalDue: number;
  collectedFromPayroll: number;
  disbursedToBank: number;
  status: "LUNAS" | "SIAP_DISETOR" | "MENUNGGU_PAYROLL";
  paymentDate?: string;
  reconciliationMatch: boolean;
  notes?: string;
}

export interface H2HGatewayStatus {
  id: string;
  serviceName: string;
  provider: string;
  endpointUrl: string;
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  latencyMs: number;
  lastPingTime: string;
  biFastReady: boolean;
  directDebitActive: boolean;
  dailyTransactionQuota: number;
  dailyTransactionUsed: number;
}

// ==========================================
// 🏭 MODUL PRODUKSI & MANAJEMEN BAHAN BAKU
// ==========================================

export interface RawMaterialCategory {
  id: string;
  code: string;
  name: string;
  order: number;
  inventoryAccountCode: string; // e.g. "1130215"
  expenseAccountCode: string;   // e.g. "5110224"
  description?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  city: string;
  supplierType: "PASAR_TRADISIONAL" | "GROSIR" | "DISTRIBUTOR" | "SUPERMARKET" | "LOKAL";
  paymentTermDays: number;
  notes?: string;
}

export interface RawMaterial {
  id: string;
  code: string; // e.g. "BB-001"
  barcode?: string;
  name: string;
  categoryId: string;
  categoryName: string;
  purchaseUnit: string; // e.g. "Kg", "Liter", "Sak", "Dus", "Karton", "PCS", "Pack"
  unitRatio: number;    // e.g. 1000 (1 Kg = 1000 gram)
  usageUnit: string;    // e.g. "gram", "ml", "pcs", "butir", "lembar"
  lastPurchasePrice: number; // e.g. 48000 (Rp 48.000 / Kg)
  usageUnitPrice: number;    // e.g. 48 (Rp 48 / gram)
  minStock: number;          // Safety stock alert in usageUnit (e.g. 3000 gr)
  currentStock: number;      // Current stock in usageUnit (e.g. 12500 gr)
  bddYieldPercent?: number;  // Berat Dapat Dimakan % (e.g. 85%)
  shrinkagePercent?: number; // Susut % (e.g. 5%)
  supplierId?: string;
  supplierName?: string;
  leadTimeDays?: number;     // e.g. 1 hari
  status: "AKTIF" | "NONAKTIF";
  caloriesPerUnit?: number;  // kkal / usageUnit (opsional SPPG)
  proteinPerUnit?: number;   // gram / usageUnit
  fatPerUnit?: number;       // gram / usageUnit
  carbsPerUnit?: number;     // gram / usageUnit
  specificationNotes?: string;
}

export interface RecipeIngredient {
  id: string;
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  usageUnit: string;
  usageUnitPrice: number;
  amountPerPortion: number; // e.g. 80 (80 gram)
  subtotalCogs: number;     // usageUnitPrice * amountPerPortion
  costPercentage?: number;  // e.g. 45%
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface MenuRecipe {
  id: string;
  menuCode: string; // e.g. "MNU-001"
  menuName: string; // e.g. "Batagor Spesial BIT"
  category: "MAKANAN" | "MINUMAN" | "SNACK";
  sellingPrice: number; // e.g. 16000
  portionYield: number; // Standard 1 portion
  ingredients: RecipeIngredient[];
  totalCogs: number; // Total HPP Bahan Baku (sum of subtotalCogs)
  grossProfitRp: number; // sellingPrice - totalCogs
  grossProfitPercent: number; // (grossProfitRp / sellingPrice) * 100
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  instructions?: string;
  imageUrl?: string;
  lastUpdated: string;
}

export interface PurchaseOrderItem {
  id: string;
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  categoryName: string;
  purchaseUnit: string;
  unitRatio: number;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. "PO-BB/2026/09/001"
  orderDate: string;
  expectedDeliveryDate: string;
  supplierId: string;
  supplierName: string;
  supplierContact?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  location: string; // e.g. "Dapur Kantin Pabrik BIT (Lt. 1)"
  items: PurchaseOrderItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  shippingAdminCost: number;
  grandTotal: number;
  status: "DRAFT" | "SENT" | "RECEIVED" | "CANCELLED";
  notes?: string;
  createdAt: string;
}

export interface RawMaterialPurchaseItem {
  id: string;
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  purchaseUnit: string;
  unitRatio: number;
  usageUnit: string;
  unitPrice: number;
  quantityReceived: number;
  totalStockAdded: number; // quantityReceived * unitRatio
  subtotal: number;
}

export interface RawMaterialPurchase {
  id: string;
  invoiceNumber: string; // e.g. "INV-BB/2026/09/014"
  purchaseDate: string;
  poNumber?: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  vehiclePlateNumber?: string;
  location: string;
  paymentType: "TUNAI_KAS_DAPUR" | "TRANSFER_KOPERASI" | "TEMPO_HUTANG";
  cashBook: string; // e.g. "KAS DAPUR KANTIN" | "KAS UTAMA KOPKAR"
  items: RawMaterialPurchaseItem[];
  subtotal: number;
  discountAmount: number;
  adminCost: number;
  grandTotal: number;
  amountPaid: number;
  amountDue: number; // Sisa hutang jika tempo
  notes?: string;
  createdAt: string;
}

export interface RawMaterialUsageItem {
  id: string;
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  usageUnit: string;
  unitPrice: number;
  quantityUsed: number;
  subtotalCost: number;
}

export interface RawMaterialUsage {
  id: string;
  usageNumber: string; // e.g. "USG/2026/09/001"
  usageDate: string;
  batchCode?: string; // e.g. "BATCH-BATAGOR-0921"
  menuId?: string;
  menuName?: string;
  portionCount?: number;
  cookPic: string; // e.g. "Siti Rahayu (Chef Kantin)"
  shift: "SHIFT_1" | "SHIFT_2" | "GENERAL";
  location: string;
  mode: "RECIPE_BATCH" | "MANUAL_AD_HOC";
  items: RawMaterialUsageItem[];
  totalUsageCost: number;
  notes?: string;
  createdAt: string;
}

export interface StockOpnameItem {
  id: string;
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  categoryName: string;
  usageUnit: string;
  unitPrice: number;
  systemStock: number;
  systemValue: number;
  physicalStock: number;
  physicalValue: number;
  varianceQty: number; // physicalStock - systemStock
  varianceValue: number; // varianceQty * unitPrice
  varianceStatus: "MATCH" | "SHORTAGE" | "SURPLUS";
  reason?: string;
}

export interface StockOpname {
  id: string;
  opnameNumber: string; // e.g. "SO-BB/2026/09/001"
  opnameDate: string;
  location: string;
  auditorName: string;
  shiftPic?: string;
  items: StockOpnameItem[];
  totalSystemValue: number;
  totalPhysicalValue: number;
  totalVarianceValue: number;
  status: "DRAFT" | "ADJUSTED";
  notes?: string;
  createdAt: string;
}

export interface StockMutation {
  id: string;
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  timestamp: string;
  referenceNumber: string;
  mutationType: "PEMBELIAN_MASUK" | "PENGGUNAAN_DAPUR" | "OPNAME_PENYESUAIAN";
  qtyIn: number;
  qtyOut: number;
  endingBalance: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  pic: string;
  notes?: string;
}



