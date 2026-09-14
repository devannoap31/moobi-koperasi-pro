export type UserRole = "SUPER_ADMIN" | "ADMIN_KOPERASI" | "HR_PAYROLL" | "PENGELOLA_KANTIN" | "FINANCE_AUDIT";

export type SystemModuleKey =
  | "dashboard"
  | "employees"
  | "savings_loans"
  | "canteen"
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

export type TenantStatus = "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | "REJECTED";

export interface CanteenTenant {
  id: string;
  name: string; // e.g., "Kantin Mbak Sri - Masakan Nusantara"
  ownerName: string; // e.g., "Sri Wahyuni"
  username: string; // e.g., "kantin.sri"
  email: string;
  phone: string;
  location: string; // e.g., "Kantin Utama - Stand 01"
  category: string; // e.g., "Masakan Nusantara & Aneka Nasi"
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

export type CanteenPaymentMethod = "POTONG_GAJI" | "SALDO_KOPERASI" | "QRIS_TUNAI";

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
  status: CanteenOrderStatus;
  orderType: "KANTIN_MAKANAN" | "TOKO_PRODUK";
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

