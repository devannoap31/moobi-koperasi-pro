import { EmployeeMember, LoanApplication, CanteenProduct, PayrollDeductionRecord, BankLiquidityStatus, UserAccount, SystemModuleKey, ModuleAccessLevel } from "@/types";

// Helper function to calculate dynamic loan limit based on Position & Tenure for PT Bhakti Idola Tama
export function calculateDynamicLoanLimit(position: string, tenureYears: number, monthlySalary: number): number {
  let multiplier = 2; // base multiplier x gaji
  if (position === "Operator") multiplier = tenureYears >= 3 ? 3.5 : 2;
  else if (position === "Staff") multiplier = tenureYears >= 3 ? 4.5 : 3;
  else if (position === "Supervisor") multiplier = tenureYears >= 3 ? 6 : 4.5;
  else if (position === "Manager") multiplier = tenureYears >= 3 ? 8 : 6;
  else if (position === "Kepala Divisi") multiplier = 10;

  return Math.round(monthlySalary * multiplier);
}

export const initialBankLiquidity: BankLiquidityStatus = {
  cooperativeCashReserve: 145000000,   // Rp 145 Juta kas internal Kopkar BIT
  totalActiveLoans: 680000000,         // Rp 680 Juta pinjaman aktif karyawan
  pendingLoanDemand: 180000000,        // Rp 180 Juta pengajuan masuk
  isLiquidityTight: true,              // Kas internal menipis -> Bank Channeling
  bankCreditLineLimit: 1500000000,     // Rp 1.5 Milyar Plafon Channeling Bank Mitra
  bankCreditLineUsed: 350000000,       // Rp 350 Juta sudah terpakai
  bankPartnerName: "PT Bank Mandiri (Persero) Tbk - Payroll PT Bhakti Idola Tama",
};

export const sampleEmployees: EmployeeMember[] = [
  {
    id: "EMP-001",
    nik: "BIT-2021-089",
    name: "Budi Santoso",
    department: "Logistik & Central Warehouse",
    position: "Supervisor",
    joinDate: "2021-03-15",
    tenureYears: 5,
    monthlySalary: 10000000, // Rp 10.000.000 (sesuai contoh PM)
    isCoopMember: true,
    memberSinceDate: "2021-04-01",
    calculatedLoanLimit: calculateDynamicLoanLimit("Supervisor", 5, 10000000), // Rp 60.000.000
    activeLoanAmount: 15000000,
    remainingLoanLimit: 45000000,
    simpananWajib: 6000000,
    simpananSukarela: 12000000,
    simpananSukarelaLockedUntil: "2027-03-01", // Locked 1 year
    isSimpananWajibWithdrawable: true, // >= 3 tahun anggota
    canteenMonthlyBill: 250000,
  },
  {
    id: "EMP-002",
    nik: "BIT-2023-142",
    name: "Siti Rahmawati",
    department: "Technical Service & QC",
    position: "Staff",
    joinDate: "2023-01-10",
    tenureYears: 3,
    monthlySalary: 7500000,
    isCoopMember: true,
    memberSinceDate: "2023-02-01",
    calculatedLoanLimit: calculateDynamicLoanLimit("Staff", 3, 7500000), // Rp 33.750.000
    activeLoanAmount: 10000000,
    remainingLoanLimit: 23750000,
    simpananWajib: 3200000,
    simpananSukarela: 5000000,
    simpananSukarelaLockedUntil: "2026-12-31", // Locked 6 month
    isSimpananWajibWithdrawable: true,
    canteenMonthlyBill: 180000,
  },
  {
    id: "EMP-003",
    nik: "BIT-2025-412",
    name: "Ahmad Fauzi",
    department: "Assembly & Packaging",
    position: "Operator",
    joinDate: "2025-06-01",
    tenureYears: 1,
    monthlySalary: 5500000,
    isCoopMember: true,
    memberSinceDate: "2025-07-01",
    calculatedLoanLimit: calculateDynamicLoanLimit("Operator", 1, 5500000), // Rp 11.000.000
    activeLoanAmount: 0,
    remainingLoanLimit: 11000000,
    simpananWajib: 1400000,
    simpananSukarela: 2000000,
    simpananSukarelaLockedUntil: "2027-01-15",
    isSimpananWajibWithdrawable: false, // < 2 tahun belum bisa ditarik
    canteenMonthlyBill: 310000,
  },
  {
    id: "EMP-004",
    nik: "BIT-2020-015",
    name: "Hendra Wijaya",
    department: "Sales & Distribusi Nasional",
    position: "Manager",
    joinDate: "2020-02-01",
    tenureYears: 6,
    monthlySalary: 18000000,
    isCoopMember: true,
    memberSinceDate: "2020-03-01",
    calculatedLoanLimit: calculateDynamicLoanLimit("Manager", 6, 18000000), // Rp 144.000.000
    activeLoanAmount: 30000000,
    remainingLoanLimit: 114000000,
    simpananWajib: 15000000,
    simpananSukarela: 35000000,
    simpananSukarelaLockedUntil: "2027-06-30",
    isSimpananWajibWithdrawable: true,
    canteenMonthlyBill: 420000,
  },
  {
    id: "EMP-005",
    nik: "BIT-2024-301",
    name: "Dewi Lestari",
    department: "HR & General Affairs",
    position: "Staff",
    joinDate: "2024-04-12",
    tenureYears: 2,
    monthlySalary: 7200000,
    isCoopMember: true,
    memberSinceDate: "2024-05-01",
    calculatedLoanLimit: calculateDynamicLoanLimit("Staff", 2, 7200000), // Rp 21.600.000
    activeLoanAmount: 0,
    remainingLoanLimit: 21600000,
    simpananWajib: 2200000,
    simpananSukarela: 4000000,
    simpananSukarelaLockedUntil: "2026-11-01",
    isSimpananWajibWithdrawable: false,
    canteenMonthlyBill: 125000,
  },
  {
    id: "EMP-006",
    nik: "BIT-2022-198",
    name: "Rizky Pratama",
    department: "Logistik & Central Warehouse",
    position: "Operator",
    joinDate: "2022-09-01",
    tenureYears: 4,
    monthlySalary: 5800000,
    isCoopMember: true,
    memberSinceDate: "2022-10-01",
    calculatedLoanLimit: calculateDynamicLoanLimit("Operator", 4, 5800000), // Rp 20.300.000
    activeLoanAmount: 8000000,
    remainingLoanLimit: 12300000,
    simpananWajib: 4500000,
    simpananSukarela: 6000000,
    simpananSukarelaLockedUntil: "2027-02-15",
    isSimpananWajibWithdrawable: true,
    canteenMonthlyBill: 295000,
  },
];

export const sampleLoans: LoanApplication[] = [
  {
    id: "LOAN-BIT-041",
    employeeId: "EMP-001",
    employeeNik: "BIT-2021-089",
    employeeName: "Budi Santoso",
    department: "Logistik & Central Warehouse",
    position: "Supervisor",
    amount: 15000000,
    tenorMonths: 20,
    monthlyInstallment: 750000, // Rp 750.000 potong gaji bulanan
    interestRateAnnual: 6.0,
    purpose: "Renovasi Rumah & Biaya Pendidikan Anak",
    status: "APPROVED",
    appliedDate: "2026-08-15",
    fundingSource: "KAS_KOPERASI",
  },
  {
    id: "LOAN-BIT-042",
    employeeId: "EMP-002",
    employeeNik: "BIT-2023-142",
    employeeName: "Siti Rahmawati",
    department: "Technical Service & QC",
    position: "Staff",
    amount: 10000000,
    tenorMonths: 12,
    monthlyInstallment: 883000,
    interestRateAnnual: 6.0,
    purpose: "Kebutuhan Medis Keluarga",
    status: "ACTIVE",
    appliedDate: "2026-07-10",
    fundingSource: "KAS_KOPERASI",
  },
  {
    id: "LOAN-BIT-043",
    employeeId: "EMP-004",
    employeeNik: "BIT-2020-015",
    employeeName: "Hendra Wijaya",
    department: "Sales & Distribusi Nasional",
    position: "Manager",
    amount: 50000000,
    tenorMonths: 36,
    monthlyInstallment: 1638000,
    interestRateAnnual: 5.5,
    purpose: "Pembelian Kendaraan Operasional Pribadi",
    status: "PENDING_KOPERASI",
    appliedDate: "2026-09-12",
    fundingSource: "BANK_CHANNELING",
    bankPartnerName: "Bank Mandiri Channeling",
  },
  {
    id: "LOAN-BIT-044",
    employeeId: "EMP-003",
    employeeNik: "BIT-2025-412",
    employeeName: "Ahmad Fauzi",
    department: "Assembly & Packaging",
    position: "Operator",
    amount: 8000000,
    tenorMonths: 10,
    monthlyInstallment: 840000,
    interestRateAnnual: 6.0,
    purpose: "Perbaikan Rumah Orang Tua",
    status: "PENDING_HR",
    appliedDate: "2026-09-13",
    fundingSource: "KAS_KOPERASI",
  },
];

export const sampleProducts: CanteenProduct[] = [
  // Makanan & Minuman Kantin Karyawan PT Bhakti Idola Tama
  {
    id: "PRD-001",
    name: "Paket Nasi Ayam Bakar Komplit + Es Teh Kantin BIT",
    category: "MAKANAN",
    regularPrice: 28000,
    memberPrice: 22000, // Diskon khusus karyawan Kopkar BIT
    stock: 85,
    unit: "Porsi",
  },
  {
    id: "PRD-002",
    name: "Nasi Rawon Daging Sapi Spesial Shift BIT",
    category: "MAKANAN",
    regularPrice: 32000,
    memberPrice: 26000,
    stock: 60,
    unit: "Porsi",
  },
  {
    id: "PRD-003",
    name: "Soto Ayam Lamongan Spesial Koya",
    category: "MAKANAN",
    regularPrice: 22000,
    memberPrice: 18000,
    stock: 90,
    unit: "Porsi",
  },
  {
    id: "PRD-004",
    name: "Air Mineral Botol 600ml Dingin",
    category: "MINUMAN",
    regularPrice: 5000,
    memberPrice: 3500,
    stock: 240,
    unit: "Botol",
  },
  {
    id: "PRD-005",
    name: "Kopi Susu Gula Aren Barista Koperasi BIT",
    category: "MINUMAN",
    regularPrice: 15000,
    memberPrice: 10000,
    stock: 120,
    unit: "Cup",
  },
  // Alat Teknik, Hardware, & Perlengkapan Kerja (Spesialisasi Bisnis PT Bhakti Idola Tama)
  {
    id: "PRD-006",
    name: "Cordless Drill Set 12V Professional (Harga Khusus Karyawan)",
    category: "ALAT_KERJA",
    regularPrice: 485000,
    memberPrice: 380000, // Diskon pabrik distributor BIT
    stock: 35,
    unit: "Set",
  },
  {
    id: "PRD-007",
    name: "Angle Grinder / Mesin Gerinda Tangan 4 Inch BIT Heavy Duty",
    category: "ALAT_KERJA",
    regularPrice: 340000,
    memberPrice: 265000,
    stock: 45,
    unit: "Unit",
  },
  {
    id: "PRD-008",
    name: "Kunci Pas Ring Set 14 Pcs Cr-V Industrial Grade",
    category: "ALAT_KERJA",
    regularPrice: 175000,
    memberPrice: 130000,
    stock: 60,
    unit: "Set",
  },
  {
    id: "PRD-009",
    name: "Sarung Tangan Safety Grip Anti-Slip & Anti-Cut",
    category: "ALAT_KERJA",
    regularPrice: 35000,
    memberPrice: 25000,
    stock: 150,
    unit: "Pasang",
  },
  {
    id: "PRD-010",
    name: "Kacamata Pelindung Safety Goggles Clear Anti-Fog",
    category: "ALAT_KERJA",
    regularPrice: 45000,
    memberPrice: 35000,
    stock: 75,
    unit: "Pcs",
  },
  {
    id: "PRD-011",
    name: "Tumbler Stainless Steel Termos 800ml Kopkar BIT",
    category: "KEBUTUHAN_HARIAN",
    regularPrice: 75000,
    memberPrice: 50000,
    stock: 65,
    unit: "Pcs",
  },
  {
    id: "PRD-012",
    name: "Paket Sembako Koperasi BIT (Beras 5kg, Minyak 2L, Gula 1kg)",
    category: "KEBUTUHAN_HARIAN",
    regularPrice: 135000,
    memberPrice: 115000,
    stock: 80,
    unit: "Paket",
  },
];

export const samplePayrollDeductions: PayrollDeductionRecord[] = [
  {
    employeeId: "EMP-001",
    nik: "BIT-2021-089",
    name: "Budi Santoso",
    department: "Logistik & Central Warehouse",
    baseSalary: 10000000, // Gaji Pokok 10 Juta
    simpananWajibDeduction: 100000, // Simpanan Wajib 100rb
    loanInstallmentDeduction: 750000, // Cicilan Pinjaman 750rb
    canteenBillDeduction: 250000, // Belanja Kantin & Alat 250rb
    totalDeductions: 1100000, // Total Potongan 1.100.000
    netTakeHomePay: 8900000, // Gaji Bersih Diterima 8.900.000
    period: "September 2026",
    status: "DRAFT",
  },
  {
    employeeId: "EMP-002",
    nik: "BIT-2023-142",
    name: "Siti Rahmawati",
    department: "Technical Service & QC",
    baseSalary: 7500000,
    simpananWajibDeduction: 100000,
    loanInstallmentDeduction: 883000,
    canteenBillDeduction: 180000,
    totalDeductions: 1163000,
    netTakeHomePay: 6337000,
    period: "September 2026",
    status: "DRAFT",
  },
  {
    employeeId: "EMP-003",
    nik: "BIT-2025-412",
    name: "Ahmad Fauzi",
    department: "Assembly & Packaging",
    baseSalary: 5500000,
    simpananWajibDeduction: 100000,
    loanInstallmentDeduction: 0,
    canteenBillDeduction: 310000,
    totalDeductions: 410000,
    netTakeHomePay: 5090000,
    period: "September 2026",
    status: "DRAFT",
  },
  {
    employeeId: "EMP-004",
    nik: "BIT-2020-015",
    name: "Hendra Wijaya",
    department: "Sales & Distribusi Nasional",
    baseSalary: 18000000,
    simpananWajibDeduction: 100000,
    loanInstallmentDeduction: 1638000,
    canteenBillDeduction: 420000,
    totalDeductions: 2158000,
    netTakeHomePay: 15842000,
    period: "September 2026",
    status: "DRAFT",
  },
];

export interface SystemModuleConfig {
  key: SystemModuleKey;
  name: string;
  category: string;
  description: string;
  route: string;
}

export const SYSTEM_MODULE_LIST: SystemModuleConfig[] = [
  {
    key: "dashboard",
    name: "Dashboard Utama",
    category: "Ringkasan Eksekutif & Likuiditas",
    description: "Melihat metrik keuangan kas koperasi, grafik likuiditas, dan pengumuman",
    route: "/dashboard",
  },
  {
    key: "employees",
    name: "Master Data Karyawan",
    category: "500 Anggota & Limit Dinamis",
    description: "Melihat database 500 karyawan PT BIT, simulasi limit pinjaman, dan status anggota",
    route: "/employees",
  },
  {
    key: "savings_loans",
    name: "Simpan Pinjam",
    category: "Wajib/Sukarela & Approval",
    description: "Memproses pengajuan pinjaman, approval kredit, dan pemantauan simpanan wajib/sukarela",
    route: "/savings-loans",
  },
  {
    key: "canteen",
    name: "Kantin & Toko BIT",
    category: "POS Kasir & Dual Pricing",
    description: "Kelola kasir POS, transaksi harga diskon anggota vs umum, dan stok alat teknis/makanan",
    route: "/canteen",
  },
  {
    key: "payroll",
    name: "Rekap Potong Gaji",
    category: "Integrasi Payroll HRD",
    description: "Ekspor rekap potong gaji bulanan ke HRD BIT, verifikasi slip potongan gaji anggota",
    route: "/payroll",
  },
  {
    key: "bank_channeling",
    name: "Likuiditas Bank Partner",
    category: "Bank Mandiri Channeling",
    description: "Pengelolaan dana channeling plafon Rp 1.5 M dari Bank Mandiri untuk suntikan dana pinjaman",
    route: "/bank-channeling",
  },
  {
    key: "user_management",
    name: "Hak Akses & User",
    category: "Superadmin Control",
    description: "Mengatur hak akses modul per user, menambah, mengedit, dan menghapus akun pengguna",
    route: "/users",
  },
];

export const initialUserAccounts: UserAccount[] = [
  {
    id: "USR-001",
    username: "superadmin",
    email: "superadmin@bhakti.co.id",
    name: "Bambang Pratama, S.Kom",
    role: "SUPER_ADMIN",
    department: "IT & Core Systems PT BIT",
    status: "ACTIVE",
    createdAt: "2024-01-01",
    lastLogin: "Baru saja",
    isRootSuperadmin: true,
    permissions: {
      dashboard: "FULL",
      employees: "FULL",
      savings_loans: "FULL",
      canteen: "FULL",
      payroll: "FULL",
      bank_channeling: "FULL",
      user_management: "FULL",
    },
  },
  {
    id: "USR-002",
    username: "admin.koperasi",
    email: "hendra.koperasi@bhakti.co.id",
    name: "Hendra Wijaya, S.E.",
    role: "ADMIN_KOPERASI",
    department: "Operasional Kopkar BIT",
    status: "ACTIVE",
    createdAt: "2024-02-15",
    lastLogin: "15 Menit lalu",
    isRootSuperadmin: false,
    permissions: {
      dashboard: "FULL",
      employees: "FULL",
      savings_loans: "FULL",
      canteen: "FULL",
      payroll: "FULL",
      bank_channeling: "FULL",
      user_management: "NONE",
    },
  },
  {
    id: "USR-003",
    username: "hrd.verifikator",
    email: "siti.hrd@bhakti.co.id",
    name: "Siti Rahmawati, S.Psi",
    role: "HR_PAYROLL",
    department: "HR & General Affairs PT BIT",
    status: "ACTIVE",
    createdAt: "2024-03-10",
    lastLogin: "1 Jam lalu",
    isRootSuperadmin: false,
    permissions: {
      dashboard: "READ",
      employees: "FULL",
      savings_loans: "READ",
      canteen: "NONE",
      payroll: "FULL",
      bank_channeling: "NONE",
      user_management: "NONE",
    },
  },
  {
    id: "USR-004",
    username: "kasir.kantin",
    email: "agus.kantin@bhakti.co.id",
    name: "Agus Setiawan",
    role: "PENGELOLA_KANTIN",
    department: "Kantin & Hardware Store BIT",
    status: "ACTIVE",
    createdAt: "2024-04-01",
    lastLogin: "2 Jam lalu",
    isRootSuperadmin: false,
    permissions: {
      dashboard: "NONE",
      employees: "READ",
      savings_loans: "NONE",
      canteen: "FULL",
      payroll: "NONE",
      bank_channeling: "NONE",
      user_management: "NONE",
    },
  },
  {
    id: "USR-005",
    username: "finance.audit",
    email: "rina.finance@bhakti.co.id",
    name: "Rina Marlina, Ak.",
    role: "FINANCE_AUDIT",
    department: "Finance & Internal Audit",
    status: "ACTIVE",
    createdAt: "2024-05-12",
    lastLogin: "Kemarin, 16:45",
    isRootSuperadmin: false,
    permissions: {
      dashboard: "READ",
      employees: "READ",
      savings_loans: "READ",
      canteen: "READ",
      payroll: "READ",
      bank_channeling: "READ",
      user_management: "NONE",
    },
  },
  {
    id: "USR-006",
    username: "budi.pengurus",
    email: "budi.santoso@bhakti.co.id",
    name: "Budi Santoso",
    role: "ADMIN_KOPERASI",
    department: "Komite Kredit Simpan Pinjam",
    status: "ACTIVE",
    createdAt: "2024-06-20",
    lastLogin: "3 Hari lalu",
    isRootSuperadmin: false,
    permissions: {
      dashboard: "READ",
      employees: "FULL",
      savings_loans: "FULL",
      canteen: "NONE",
      payroll: "READ",
      bank_channeling: "READ",
      user_management: "NONE",
    },
  },
];
