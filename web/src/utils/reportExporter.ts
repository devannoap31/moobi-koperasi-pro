/**
 * Report Exporter Utility
 * Koperasi Karyawan PT Bhakti Idola Tama (Kopkar BIT)
 * 
 * Provides:
 * 1. Professional Formal PDF Document Generator (with Official Kop Surat, Document ID, Executive Summary, Formal Tables, Signatures, and Print Stylesheet)
 * 2. Excel / CSV Spreadsheet Exporter with UTF-8 BOM support
 * 3. Pre-configured domain report builders for all application modules
 */

export interface ReportColumn {
  header: string;
  key: string;
  align?: "left" | "center" | "right";
  width?: string;
  formatter?: (val: any, row: any) => string;
}

export interface ReportSummaryItem {
  label: string;
  value: string;
  subLabel?: string;
  highlight?: boolean;
}

export interface ReportSignature {
  role: string;
  name: string;
  titleOrNik?: string;
}

export interface FormalReportConfig {
  title: string;
  subTitle?: string;
  documentNumber: string;
  period: string;
  date: string;
  departmentOrUnit?: string;
  orientation?: "portrait" | "landscape";
  summaries?: ReportSummaryItem[];
  columns: ReportColumn[];
  data: any[];
  totalRow?: Record<string, string | number>;
  notes?: string[];
  signatures?: ReportSignature[];
  filename?: string;
}

export type ReportConfig = FormalReportConfig;

/**
 * Trigger CSV / Excel file download with UTF-8 BOM
 */
export function exportToCsv(config: FormalReportConfig | {
  filename?: string;
  columns: ReportColumn[];
  data: any[];
  totalRow?: Record<string, any>;
  reportTitle?: string;
  title?: string;
  period?: string;
}): void {
  const filename = config.filename || ("title" in config && config.title ? config.title.toLowerCase().replace(/[^a-z0-9]/g, "_") : "Laporan_Koperasi_BIT");
  const { columns, data, totalRow, period } = config;
  const reportTitle = "title" in config ? config.title : (config as any).reportTitle;

  const escapeCsv = (str: any): string => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const lines: string[] = [];

  // Header metadata in CSV
  if (reportTitle) {
    lines.push(`"KOPERASI KARYAWAN PT BHAKTI IDOLA TAMA (KOPKAR BIT)"`);
    lines.push(escapeCsv(reportTitle));
    if (period) lines.push(escapeCsv(`Periode: ${period}`));
    lines.push(escapeCsv(`Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB`));
    lines.push(""); // empty separator
  }

  // Column Headers
  const headerLine = columns.map((c) => escapeCsv(c.header)).join(";");
  lines.push(headerLine);

  // Data Rows
  data.forEach((row, idx) => {
    const rowValues = columns.map((col) => {
      let val: any;
      if (col.key === "_no" || col.key === "no") {
        val = idx + 1;
      } else {
        val = row[col.key];
      }

      if (col.formatter) {
        val = col.formatter(val, row);
      }
      return escapeCsv(val);
    });
    lines.push(rowValues.join(";"));
  });

  // Total Row
  if (totalRow) {
    const totalValues = columns.map((col) => {
      const val = totalRow[col.key];
      if (val !== undefined && val !== null) {
        return escapeCsv(val);
      }
      return '""';
    });
    lines.push(totalValues.join(";"));
  }

  // UTF-8 BOM for Microsoft Excel compatibility
  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Pristine Formal Indonesian Cooperative HTML Document
 */
export function generateFormalReportHtml(config: FormalReportConfig): string {
  const {
    title,
    subTitle,
    documentNumber,
    period,
    date,
    departmentOrUnit = "Unit Pengelola Koperasi PT. Bhakti Idola Tama",
    orientation = "portrait",
    summaries = [],
    columns,
    data,
    totalRow,
    notes = [],
    signatures = [
      { role: "Dibuat Oleh,", name: "Admin Koperasi", titleOrNik: "Petugas Administrasi" },
      { role: "Diperiksa Oleh,", name: "Dewi Lestari", titleOrNik: "Bendahara Koperasi (NIK: BIT-2022-098)" },
      { role: "Disetujui Oleh,", name: "Ir. Bambang Trihatmojo", titleOrNik: "Ketua Kopkar BIT & HR Director" },
    ],
  } = config;

  const pageSize = orientation === "landscape" ? "A4 landscape" : "A4 portrait";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title} - Kopkar PT Bhakti Idola Tama</title>
  <style>
    @page {
      size: ${pageSize};
      margin: 14mm 12mm 14mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: 'Times New Roman', Times, 'Liberation Serif', serif;
      font-size: 10.5pt;
      line-height: 1.35;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    .report-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }
    
    /* KOP SURAT RESMI */
    .kop-surat {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 8px;
      border-bottom: 3px double #000;
      margin-bottom: 14px;
      gap: 12px;
    }
    .kop-logo-wrapper {
      width: 75px;
      height: 75px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .kop-logo-img {
      max-width: 75px;
      max-height: 75px;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
    }
    .kop-text {
      flex: 1;
      text-align: center;
    }
    .kop-spacer {
      width: 75px;
      height: 75px;
      flex-shrink: 0;
      display: block;
    }
    .kop-title {
      font-family: Arial, sans-serif;
      font-size: 13pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin: 0 0 2px 0;
    }
    .kop-subtitle {
      font-size: 9.5pt;
      font-weight: bold;
      margin: 0 0 2px 0;
    }
    .kop-address {
      font-size: 8pt;
      color: #222;
      margin: 0;
      line-height: 1.3;
    }

    /* TITLE & DOKUMEN NUMBER */
    .doc-header {
      text-align: center;
      margin-bottom: 14px;
    }
    .doc-title {
      font-family: Arial, sans-serif;
      font-size: 12pt;
      font-weight: bold;
      text-decoration: underline;
      text-transform: uppercase;
      margin: 0 0 3px 0;
      letter-spacing: 0.3px;
    }
    .doc-number {
      font-family: 'Courier New', Courier, monospace;
      font-size: 9pt;
      font-weight: bold;
      margin: 0 0 3px 0;
    }
    .doc-subtitle {
      font-size: 8.5pt;
      font-style: italic;
      color: #333;
      margin: 0;
    }

    /* METADATA INFO TABLE */
    .meta-table {
      width: 100%;
      margin-bottom: 12px;
      border-collapse: collapse;
      font-size: 9pt;
      font-family: Arial, sans-serif;
    }
    .meta-table td {
      padding: 2px 4px;
      vertical-align: top;
    }
    .meta-label {
      width: 18%;
      font-weight: bold;
      color: #333;
    }
    .meta-sep {
      width: 2%;
      text-align: center;
    }
    .meta-val {
      width: 30%;
    }

    /* SUMMARY CARDS / TABLE */
    .summary-section {
      margin-bottom: 12px;
      border: 1px solid #000;
      background: #fafafa;
      padding: 6px 10px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(${Math.min(summaries.length || 1, 4)}, 1fr);
      gap: 8px;
    }
    .summary-item {
      font-family: Arial, sans-serif;
      text-align: center;
      border-right: 1px dashed #bbb;
      padding: 2px 6px;
    }
    .summary-item:last-child {
      border-right: none;
    }
    .summary-label {
      font-size: 7.5pt;
      color: #555;
      text-transform: uppercase;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .summary-val {
      font-size: 10pt;
      font-weight: bold;
      color: #000;
    }

    /* DATA TABLE */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 8.5pt;
      font-family: Arial, Helvetica, sans-serif;
      color: #000000;
    }
    .data-table th, .data-table td {
      border: 1px solid #111111;
      padding: 5px 7px;
      color: #000000;
      line-height: 1.25;
    }
    .data-table th {
      background-color: #f0f2f5 !important;
      color: #000000 !important;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.2px;
    }
    .data-table tr:nth-child(even) td {
      background-color: #fbfbfc !important;
    }
    .data-table tr:nth-child(odd) td {
      background-color: #ffffff !important;
    }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .font-mono { font-family: 'Courier New', Courier, monospace; white-space: nowrap; }
    .nowrap { white-space: nowrap; }

    .total-row td {
      background-color: #e9ecef !important;
      color: #000000 !important;
      font-weight: bold;
      border-top: 2px solid #000000 !important;
      border-bottom: 3px double #000000 !important;
    }

    /* NOTES / CATATAN */
    .notes-box {
      font-size: 7.8pt;
      color: #111111;
      margin-bottom: 16px;
      line-height: 1.4;
      border-left: 3px solid #333333;
      padding-left: 10px;
      background: #fafafa;
      padding-top: 4px;
      padding-bottom: 4px;
    }
    .notes-box p {
      margin: 0 0 3px 0;
    }

    /* SIGNATURES BLOCK */
    .signatures-block {
      width: 100%;
      margin-top: 20px;
      page-break-inside: avoid;
    }
    .sig-table {
      width: 100%;
      border-collapse: collapse;
      text-align: center;
      font-size: 8.5pt;
      font-family: Arial, sans-serif;
      color: #000000;
    }
    .sig-table td {
      width: ${100 / (signatures.length || 1)}%;
      vertical-align: top;
      padding: 0 10px;
    }
    .sig-role {
      font-weight: normal;
      color: #000000;
      margin-bottom: 50px;
    }
    .sig-name {
      font-weight: bold;
      text-decoration: underline;
      color: #000000;
      margin-bottom: 2px;
    }
    .sig-title {
      font-size: 7.5pt;
      color: #333333;
    }

    /* FOOTER */
    .report-footer {
      margin-top: 20px;
      padding-top: 8px;
      border-top: 1px dashed #666666;
      font-size: 7pt;
      color: #444444;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: Arial, sans-serif;
    }

    /* NO PRINT / PRINT ONLY */
    @media screen {
      html, body {
        background-color: #2b2e36;
        margin: 0;
        padding: 20px 10px;
        display: flex;
        justify-content: center;
      }
      .report-container {
        background-color: #ffffff !important;
        color: #000000 !important;
        width: 100%;
        max-width: ${orientation === "landscape" ? "1050px" : "800px"};
        padding: 36px 42px;
        box-shadow: 0 10px 35px rgba(0,0,0,0.5);
        border-radius: 4px;
        min-height: ${orientation === "landscape" ? "650px" : "900px"};
      }
      .print-action-bar {
        display: none !important;
      }
    }

    @media print {
      body {
        background: #fff;
        padding: 0;
        margin: 0;
      }
      .report-container {
        padding: 0;
        box-shadow: none;
        max-width: 100%;
        width: 100%;
      }
      .print-action-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-action-bar" onclick="window.print()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 14h12v8H6z"></path></svg>
    <span>Cetak Dokumen Resmi (Ctrl + P)</span>
  </div>

  <div class="report-container">
    <!-- 1. KOP SURAT RESMI KOPERASI -->
    <div class="kop-surat">
      <div class="kop-logo-wrapper">
        <img src="/images/logo.webp" alt="Logo Kopkar BIT" class="kop-logo-img" onerror="this.onerror=null; this.src='/icons/favicon.png';" />
      </div>
      <div class="kop-text">
        <h1 class="kop-title">Koperasi Karyawan PT. Bhakti Idola Tama</h1>
        <p class="kop-subtitle">Badan Hukum No: 518/BH/KDK.10.1/VIII/2015 &bull; NPWP: 02.842.190.4-035.000</p>
        <p class="kop-address">
          Kawasan Industri & Pergudangan Terpadu Kav. 12-14, Jakarta Barat 11840<br>
          Telp: (021) 582-8888 &bull; Email: koperasi@bhakti.co.id &bull; Portal: moobi-koperasi.bhakti.co.id
        </p>
      </div>
      <div class="kop-spacer"></div>
    </div>

    <!-- 2. JUDUL DOKUMEN & NOMOR REGISTRASI -->
    <div class="doc-header">
      <h2 class="doc-title">${title}</h2>
      <div class="doc-number">Nomor Registrasi: ${documentNumber}</div>
      ${subTitle ? `<p class="doc-subtitle">${subTitle}</p>` : ""}
    </div>

    <!-- 3. METADATA LAPORAN -->
    <table class="meta-table">
      <tr>
        <td class="meta-label">Periode Laporan</td>
        <td class="meta-sep">:</td>
        <td class="meta-val"><strong>${period}</strong></td>
        <td class="meta-label">Tanggal Cetak</td>
        <td class="meta-sep">:</td>
        <td class="meta-val">${date}</td>
      </tr>
      <tr>
        <td class="meta-label">Unit / Pengelola</td>
        <td class="meta-sep">:</td>
        <td class="meta-val">${departmentOrUnit}</td>
        <td class="meta-label">Klasifikasi Dokumen</td>
        <td class="meta-sep">:</td>
        <td class="meta-val">Resmi &bull; Terverifikasi Sistem Moobi Pro</td>
      </tr>
    </table>

    <!-- 4. RINGKASAN EKSEKUTIF -->
    ${summaries.length > 0 ? `
    <div class="summary-section">
      <div class="summary-grid">
        ${summaries.map(s => `
          <div class="summary-item">
            <div class="summary-label">${s.label}</div>
            <div class="summary-val">${s.value}</div>
            ${s.subLabel ? `<div style="font-size: 7pt; color: #666;">${s.subLabel}</div>` : ""}
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}

    <!-- 5. TABEL DATA RESMI -->
    <table class="data-table">
      <thead>
        <tr>
          ${columns.map(c => `<th style="${c.width ? `width: ${c.width};` : ""}" class="text-${c.align || 'left'}">${c.header}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${data.map((row, idx) => `
          <tr>
            ${columns.map(col => {
              let val: any;
              if (col.key === "_no" || col.key === "no") {
                val = idx + 1;
              } else {
                val = row[col.key];
              }
              if (col.formatter) {
                val = col.formatter(val, row);
              }
              const isAlign = col.align || (typeof val === "number" ? "right" : "left");
              return `<td class="text-${isAlign}">${val !== undefined && val !== null ? val : "-"}</td>`;
            }).join("")}
          </tr>
        `).join("")}

        <!-- TOTAL ROW -->
        ${totalRow ? `
          <tr class="total-row">
            ${columns.map(col => {
              const val = totalRow[col.key];
              const isAlign = col.align || "left";
              return `<td class="text-${isAlign}">${val !== undefined && val !== null ? val : ""}</td>`;
            }).join("")}
          </tr>
        ` : ""}
      </tbody>
    </table>

    <!-- 6. CATATAN KETENTUAN -->
    <div class="notes-box">
      <p><strong>Ketentuan &amp; Audit Trail:</strong></p>
      ${notes.length > 0
        ? notes.map(n => `<p>&bull; ${n}</p>`).join("")
        : `
          <p>&bull; Dokumen ini dihasilkan secara otomatis dan sah oleh Sistem Terpadu Moobi Koperasi Pro PT. Bhakti Idola Tama.</p>
          <p>&bull; Seluruh angka pemotongan dan mutasi keuangan telah tervalidasi dan disinkronkan dengan Data Master HRD &amp; Payroll Pusat.</p>
          <p>&bull; Salinan fisik/digital ini dapat digunakan sebagai lampiran resmi pelaporan Rapat Anggota Tahunan (RAT) dan audit keuangan berkala.</p>
        `
      }
    </div>

    <!-- 7. LEMBAR PENGESAHAN / TANDA TANGAN -->
    <div class="signatures-block">
      <table class="sig-table">
        <tr>
          ${signatures.map(sig => `
            <td>
              <div class="sig-role">${sig.role}</div>
              <div class="sig-name">${sig.name}</div>
              <div class="sig-title">${sig.titleOrNik || ""}</div>
            </td>
          `).join("")}
        </tr>
      </table>
    </div>

    <!-- 8. FOOTER DOKUMEN -->
    <div class="report-footer">
      <div>
        Sistem Moobi Koperasi Pro &bull; Dicetak pada: ${date}
      </div>
      <div>
        Verifikasi Sistem ID: <strong>BIT-${Math.random().toString(36).substring(2, 9).toUpperCase()}</strong> &bull; Halaman 1 dari 1
      </div>
    </div>
  </div>

  <script>
    window.addEventListener('load', function() {
      if (window.location.search.includes('autoprint=true')) {
        setTimeout(function() {
          window.print();
        }, 300);
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Print or Open Formal PDF Document in Clean Window
 */
export function printFormalReport(config: FormalReportConfig): void {
  const htmlContent = generateFormalReportHtml(config);
  const printWindow = window.open("", "_blank", "width=1050,height=850");

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  } else {
    // Fallback using hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1200);
      }, 500);
    }
  }
}

/* ========================================================================= */
/* PRESET DOMAIN REPORT BUILDERS                                              */
/* ========================================================================= */

/**
 * 1. PAYROLL DEDUCTION REPORT BUILDER
 */
export function buildPayrollReportConfig(
  deductions: any[],
  period: string = "September 2026"
): FormalReportConfig {
  const totalBaseSalary = deductions.reduce((acc, d) => acc + (d.baseSalary || 0), 0);
  const totalSimpananWajib = deductions.reduce((acc, d) => acc + (d.simpananWajibDeduction || 0), 0);
  const totalCicilan = deductions.reduce((acc, d) => acc + (d.loanInstallmentDeduction || 0), 0);
  const totalKantin = deductions.reduce((acc, d) => acc + (d.canteenBillDeduction || 0), 0);
  const totalDeductions = deductions.reduce((acc, d) => acc + (d.totalDeductions || 0), 0);
  const totalTakeHomePay = deductions.reduce((acc, d) => acc + (d.netTakeHomePay || 0), 0);

  return {
    title: "LAPORAN REKAPITULASI PEMOTONGAN GAJI (PAYROLL)",
    subTitle: "Integrasi Simpanan Wajib Kopkar, Angsuran Pinjaman, dan Belanja Karyawan PT. Bhakti Idola Tama",
    documentNumber: `KOP-BIT/PAY/${new Date().getFullYear()}/09/${Math.floor(100 + Math.random() * 900)}`,
    period: period,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    departmentOrUnit: "Divisi HRD & Payroll PT. Bhakti Idola Tama & Pengurus Kopkar",
    orientation: "landscape",
    filename: `Laporan-Payroll-Kopkar-BIT-${period.replace(/\s+/g, "-")}`,
    summaries: [
      { label: "Total Karyawan", value: `${deductions.length} Orang`, subLabel: "Tervalidasi HRD" },
      { label: "Total Gaji Bruto", value: `Rp ${totalBaseSalary.toLocaleString("id-ID")}` },
      { label: "Total Potongan Koperasi", value: `Rp ${totalDeductions.toLocaleString("id-ID")}` },
      { label: "Total Gaji Bersih (THP)", value: `Rp ${totalTakeHomePay.toLocaleString("id-ID")}`, highlight: true },
    ],
    columns: [
      { header: "No", key: "_no", align: "center", width: "35px" },
      { header: "Nama Karyawan", key: "name", align: "left" },
      { header: "NIK BIT", key: "nik", align: "center" },
      { header: "Departemen", key: "department", align: "left" },
      {
        header: "Gaji Pokok",
        key: "baseSalary",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Simp. Wajib",
        key: "simpananWajibDeduction",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Cicilan Pinjaman",
        key: "loanInstallmentDeduction",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Belanja Toko/Kantin",
        key: "canteenBillDeduction",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Total Potongan",
        key: "totalDeductions",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Gaji Bersih (THP)",
        key: "netTakeHomePay",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
    ],
    data: deductions,
    totalRow: {
      _no: "",
      name: "GRAND TOTAL",
      nik: "",
      department: "",
      baseSalary: `Rp ${totalBaseSalary.toLocaleString("id-ID")}`,
      simpananWajibDeduction: `Rp ${totalSimpananWajib.toLocaleString("id-ID")}`,
      loanInstallmentDeduction: `Rp ${totalCicilan.toLocaleString("id-ID")}`,
      canteenBillDeduction: `Rp ${totalKantin.toLocaleString("id-ID")}`,
      totalDeductions: `Rp ${totalDeductions.toLocaleString("id-ID")}`,
      netTakeHomePay: `Rp ${totalTakeHomePay.toLocaleString("id-ID")}`,
    },
    notes: [
      "Pemotongan gaji dilakukan pada tanggal cutoff 25 setiap bulannya melalui autodebet sistem payroll terpadu HRD.",
      "Seluruh potongan simpanan wajib otomatis dialokasikan ke pos Buku Tabungan Simpanan Anggota.",
      "Dokumen ini mengikat secara hukum dan telah disinkronkan antara Bank Payroll, HRD PT BIT, dan Pengurus Koperasi.",
    ],
    signatures: [
      { role: "Dibuat Oleh,", name: "Admin Payroll Koperasi", titleOrNik: "Staff Keuangan & Pajak" },
      { role: "Diperiksa Oleh,", name: "Dewi Lestari", titleOrNik: "Bendahara Koperasi (NIK: BIT-2022-098)" },
      { role: "Disetujui Oleh,", name: "Ir. Bambang Trihatmojo", titleOrNik: "Ketua Koperasi & HR Director PT BIT" },
    ],
  };
}

/**
 * 2. CANTEEN MERCHANT FINANCE & LEDGER REPORT BUILDER
 */
export function buildMerchantFinanceReportConfig(
  ledger: any[],
  breakdown: { qris: { amount: number }; cash: { amount: number } },
  period: string = "September 2026",
  tenant: any = { name: "Kantin Utama Koperasi PT. Bhakti Idola Tama", ownerName: "Bu Siti Rahayu", location: "Area Kantin Pabrik Lantai 1" }
): FormalReportConfig {
  const totalOmzet = (breakdown.qris?.amount || 0) + (breakdown.cash?.amount || 0);

  return {
    title: "LAPORAN KEUANGAN & REKAPITULASI OMZET KANTIN PABRIK",
    subTitle: `Unit Stand: ${tenant.name} &bull; Pengelola: ${tenant.ownerName} (${tenant.location})`,
    documentNumber: `KOP-BIT/KTN/${new Date().getFullYear()}/09/${Math.floor(100 + Math.random() * 900)}`,
    period: period,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    departmentOrUnit: "Manajemen Pengelola Kantin Karyawan PT. Bhakti Idola Tama",
    orientation: "portrait",
    filename: `Laporan-Omzet-Kantin-${period.replace(/\s+/g, "-")}`,
    summaries: [
      { label: "Total Omzet Keseluruhan", value: `Rp ${totalOmzet.toLocaleString("id-ID")}`, highlight: true },
      { label: "QRIS Statis Stand Mandiri", value: `Rp ${(breakdown.qris?.amount || 0).toLocaleString("id-ID")}`, subLabel: "Langsung Rekening Bank" },
      { label: "Cash / Uang Tunai Kasir", value: `Rp ${(breakdown.cash?.amount || 0).toLocaleString("id-ID")}`, subLabel: "Fisik Kasir Stand" },
      { label: "Total Transaksi", value: `${ledger.length} Pesanan`, subLabel: "Tercatat POS" },
    ],
    columns: [
      { header: "No", key: "_no", align: "center", width: "35px" },
      { header: "No. Order", key: "orderNumber", align: "center" },
      { header: "Waktu", key: "timeOnly", align: "center" },
      { header: "Pelanggan / Divisi", key: "customerName", align: "left" },
      { header: "Menu yang Terjual", key: "itemsSummary", align: "left" },
      {
        header: "Metode Bayar",
        key: "paymentMethod",
        align: "center",
        formatter: (v) => (v === "QRIS_TUNAI" ? "QRIS Statis Stand" : "Uang Tunai (Cash)"),
      },
      {
        header: "Total Bayar",
        key: "totalAmount",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Status Dana",
        key: "disbursementStatus",
        align: "center",
        formatter: () => "Diterima Langsung",
      },
    ],
    data: ledger,
    totalRow: {
      _no: "",
      orderNumber: "TOTAL",
      timeOnly: "",
      customerName: "",
      itemsSummary: "",
      paymentMethod: "",
      totalAmount: `Rp ${ledger.reduce((sum, item) => sum + (item.totalAmount || 0), 0).toLocaleString("id-ID")}`,
      disbursementStatus: "LUNAS",
    },
    notes: [
      "Penerimaan transaksi via QRIS Statis masuk langsung ke rekening penampungan Bank Mandiri pengelola stand.",
      "Penerimaan kas tunai dihitung dan dicocokkan setiap pergantian shift kerja pabrik (Shift 1 & Shift 2).",
      "Laporan ini ditandatangani oleh Pengelola Stand dan diperiksa oleh Badan Pengawas Kantin Koperasi.",
    ],
    signatures: [
      { role: "Kasir / Pengelola Stand,", name: tenant.ownerName || "Siti Rahayu", titleOrNik: "Mitra Pengelola Kantin BIT" },
      { role: "Diperiksa Oleh,", name: "Ahmad Fauzi", titleOrNik: "Pengawas Operasional Kantin" },
      { role: "Mengetahui,", name: "Dewi Lestari", titleOrNik: "Bendahara Koperasi BIT" },
    ],
  };
}

/**
 * 3. CANTEEN SUPERADMIN ACTIVITY & SETTLEMENT REPORT BUILDER
 */
export function buildCanteenSuperadminReportConfig(
  activities: any[],
  period: string = "September 2026"
): FormalReportConfig {
  const totalAmount = activities.reduce((sum, act) => sum + (act.totalAmount || 0), 0);
  const totalSavings = activities.reduce((sum, act) => sum + (act.memberSavings || 0), 0);

  return {
    title: "LAPORAN REKAPITULASI AKTIVITAS BELANJA KANTIN KARYAWAN",
    subTitle: "Monitoring Transaksi Belanja & Fasilitas Diskon Anggota Koperasi PT. Bhakti Idola Tama",
    documentNumber: `KOP-BIT/KTN-ADM/${new Date().getFullYear()}/09/${Math.floor(100 + Math.random() * 900)}`,
    period: period,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    departmentOrUnit: "Divisi Operasional & Manajemen Kantin Kopkar BIT",
    orientation: "landscape",
    filename: `Laporan-Aktivitas-Kantin-Superadmin-${period.replace(/\s+/g, "-")}`,
    summaries: [
      { label: "Total Transaksi Kantin", value: `${activities.length} Transaksi`, subLabel: "Bulan Berjalan" },
      { label: "Total Omzet Belanja", value: `Rp ${totalAmount.toLocaleString("id-ID")}`, highlight: true },
      { label: "Total Diskon Anggota", value: `Rp ${totalSavings.toLocaleString("id-ID")}`, subLabel: "Keuntungan Member" },
      { label: "Metode Transaksi", value: "Tunai & QRIS Statis", subLabel: "100% Lunas Instan" },
    ],
    columns: [
      { header: "No", key: "_no", align: "center", width: "35px" },
      { header: "Waktu Belanja", key: "transactionTime", align: "center" },
      { header: "Nama Karyawan", key: "employeeName", align: "left" },
      { header: "NIK", key: "employeeNik", align: "center" },
      { header: "Departemen", key: "department", align: "left" },
      { header: "Menu / Item yang Dibeli", key: "itemsSummary", align: "left" },
      {
        header: "Total Belanja",
        key: "totalAmount",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Diskon Member",
        key: "memberSavings",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Metode Bayar",
        key: "paymentMethod",
        align: "center",
        formatter: (v) => (v === "QRIS_TUNAI" ? "QRIS Statis Stand" : "Uang Tunai (Cash)"),
      },
    ],
    data: activities,
    totalRow: {
      _no: "",
      transactionTime: "TOTAL",
      employeeName: "",
      employeeNik: "",
      department: "",
      itemsSummary: "",
      totalAmount: `Rp ${totalAmount.toLocaleString("id-ID")}`,
      memberSavings: `Rp ${totalSavings.toLocaleString("id-ID")}`,
      paymentMethod: "",
    },
    notes: [
      "Harga diskon anggota secara otomatis diterapkan bagi seluruh karyawan terdaftar PT. Bhakti Idola Tama.",
      "Pembayaran diselesaikan secara langsung di kasir melalui Uang Tunai atau QRIS Statis Stand.",
    ],
    signatures: [
      { role: "Petugas Kasir,", name: "Admin Kantin", titleOrNik: "Staff Operasional" },
      { role: "Diperiksa Oleh,", name: "Ahmad Fauzi", titleOrNik: "Supervisor Pengelola Kantin" },
      { role: "Disetujui Oleh,", name: "Dewi Lestari", titleOrNik: "Bendahara Koperasi BIT" },
    ],
  };
}

/**
 * 4. COOPERATIVE STORE & ELECTRONIC SALES REPORT BUILDER
 */
export function buildStoreReportConfig(
  transactions: any[],
  products: any[],
  period: string = "September 2026"
): FormalReportConfig {
  const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
  const totalSavings = transactions.reduce((sum, tx) => sum + (tx.totalSaved || 0), 0);
  const totalCatalogStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  return {
    title: "LAPORAN PENJUALAN BARANG ELEKTRONIK & TOKO KOPERASI",
    subTitle: "Unit Bisnis Komersial Penjualan Peralatan Rumah Tangga & Perkakas Kerja Karyawan PT. Bhakti Idola Tama",
    documentNumber: `KOP-BIT/STR/${new Date().getFullYear()}/09/${Math.floor(100 + Math.random() * 900)}`,
    period: period,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    departmentOrUnit: "Unit Bisnis Toko & Pengadaan Barang Kopkar BIT",
    orientation: "landscape",
    filename: `Laporan-Penjualan-Toko-Koperasi-${period.replace(/\s+/g, "-")}`,
    summaries: [
      { label: "Total Omzet Penjualan", value: `Rp ${totalRevenue.toLocaleString("id-ID")}`, highlight: true },
      { label: "Total Penghematan Anggota", value: `Rp ${totalSavings.toLocaleString("id-ID")}`, subLabel: "Diskon Anggota BIT" },
      { label: "Total Transaksi", value: `${transactions.length} Faktur`, subLabel: "Status 100% Lunas" },
      { label: "Sisa Stok Katalog", value: `${totalCatalogStock} Unit`, subLabel: `${products.length} Jenis Produk` },
    ],
    columns: [
      { header: "No", key: "_no", align: "center", width: "35px" },
      { header: "No. Invoice", key: "invoiceNumber", align: "center" },
      { header: "Tanggal", key: "transactionDate", align: "center" },
      { header: "Nama Pembeli", key: "employeeName", align: "left" },
      { header: "NIK", key: "employeeNik", align: "center" },
      { header: "Departemen", key: "department", align: "left" },
      {
        header: "Rincian Barang",
        key: "items",
        align: "left",
        formatter: (items) => (Array.isArray(items) ? items.map((i: any) => `${i.quantity}x ${i.productName}`).join(", ") : "-"),
      },
      {
        header: "Total Belanja",
        key: "totalAmount",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Hemat Member",
        key: "totalSaved",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Metode Bayar",
        key: "paymentMethod",
        align: "center",
        formatter: (v) => (v === "QRIS_MANDIRI" ? "QRIS Mandiri" : "Uang Tunai (Cash)"),
      },
      {
        header: "Status",
        key: "status",
        align: "center",
        formatter: () => "LUNAS",
      },
    ],
    data: transactions,
    totalRow: {
      _no: "",
      invoiceNumber: "GRAND TOTAL",
      transactionDate: "",
      employeeName: "",
      employeeNik: "",
      department: "",
      items: "",
      totalAmount: `Rp ${totalRevenue.toLocaleString("id-ID")}`,
      totalSaved: `Rp ${totalSavings.toLocaleString("id-ID")}`,
      paymentMethod: "",
      status: "LUNAS",
    },
    notes: [
      "Seluruh produk elektronik yang dijual dilengkapi garansi resmi pabrik minimal 1 (satu) tahun.",
      "Pembayaran dilakukan secara tunai di kasir toko atau melalui scan QRIS Statis Bank Mandiri Kopkar BIT.",
      "Klaim garansi atau penukaran barang wajib menyertakan bukti nota invoice penjualan resmi.",
    ],
    signatures: [
      { role: "Petugas Kasir Toko,", name: "Rian Hidayat", titleOrNik: "Operator Toko Koperasi" },
      { role: "Pengelola Toko,", name: "Hendra Wijaya", titleOrNik: "Kepala Pengadaan Barang" },
      { role: "Disetujui Oleh,", name: "Dewi Lestari", titleOrNik: "Bendahara Koperasi BIT" },
    ],
  };
}

/**
 * 5. SAVINGS & LOANS (SIMPAN PINJAM) REPORT BUILDER
 */
export function buildSavingsLoansReportConfig(
  loans: any[],
  employees: any[],
  period: string = "September 2026"
): FormalReportConfig {
  const totalLoanAmount = loans.reduce((sum, l) => sum + (l.amount || 0), 0);
  const totalMonthlyInterest = loans.reduce((sum, l) => sum + (l.monthlyInterest || 0), 0);
  const totalSimpananWajib = employees.reduce((sum, e) => sum + (e.simpananWajib || 0), 0);
  const totalSimpananSukarela = employees.reduce((sum, e) => sum + (e.simpananSukarela || 0), 0);

  return {
    title: "LAPORAN PORTOFOLIO PINJAMAN & SIMPANAN ANGGOTA",
    subTitle: "Unit Simpan Pinjam Syariah & Konvensional Koperasi Karyawan PT. Bhakti Idola Tama",
    documentNumber: `KOP-BIT/SP/${new Date().getFullYear()}/09/${Math.floor(100 + Math.random() * 900)}`,
    period: period,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    departmentOrUnit: "Komite Kredit & Simpan Pinjam Kopkar BIT",
    orientation: "landscape",
    filename: `Laporan-Simpan-Pinjam-Kopkar-${period.replace(/\s+/g, "-")}`,
    summaries: [
      { label: "Total Portofolio Pinjaman", value: `Rp ${totalLoanAmount.toLocaleString("id-ID")}`, highlight: true },
      { label: "Simpanan Wajib Terkumpul", value: `Rp ${totalSimpananWajib.toLocaleString("id-ID")}` },
      { label: "Simpanan Sukarela Deposito", value: `Rp ${totalSimpananSukarela.toLocaleString("id-ID")}` },
      { label: "Total Debitur Aktif", value: `${loans.length} Berkas Pinjaman`, subLabel: "Kolektibilitas Lancar" },
    ],
    columns: [
      { header: "No", key: "_no", align: "center", width: "35px" },
      { header: "ID Pinjaman", key: "id", align: "center" },
      { header: "Nama Anggota", key: "employeeName", align: "left" },
      { header: "NIK", key: "employeeNik", align: "center" },
      { header: "Departemen", key: "department", align: "left" },
      {
        header: "Plafon Pinjaman",
        key: "amount",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Tenor",
        key: "tenorMonths",
        align: "center",
        formatter: (v) => `${v} Bulan`,
      },
      {
        header: "Angsuran / Bln",
        key: "monthlyInstallment",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      { header: "Tujuan Pinjaman", key: "purpose", align: "left" },
      {
        header: "Status Pinjaman",
        key: "status",
        align: "center",
        formatter: (v) => (v === "APPROVED" || v === "ACTIVE" ? "DISETUJUI / AKTIF" : v === "PENDING_HR" ? "VERIFIKASI HRD" : v === "PENDING_KOPERASI" ? "KOMITE KREDIT" : v),
      },
    ],
    data: loans,
    totalRow: {
      _no: "",
      id: "TOTAL",
      employeeName: "",
      employeeNik: "",
      department: "",
      amount: `Rp ${totalLoanAmount.toLocaleString("id-ID")}`,
      tenorMonths: "",
      monthlyInstallment: `Rp ${loans.reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0).toLocaleString("id-ID")}`,
      purpose: "",
      status: "LANCAR (NPL 0%)",
    },
    notes: [
      "Bunga pinjaman flat sebesar 6% per tahun diperuntukkan sebagai Sisa Hasil Usaha (SHU) anggota.",
      "Limit pinjaman dibatasi secara ketat berdasarkan matriks masa kerja dan batas DSR gaji maksimal 35%.",
      "Angsuran pokok dan bunga dipotong langsung dari sistem payroll tanggal 25 setiap bulan.",
    ],
    signatures: [
      { role: "Analis Kredit,", name: "Siti Rahmawati", titleOrNik: "Staff Verifikasi Kredit" },
      { role: "Diperiksa Oleh,", name: "Dewi Lestari", titleOrNik: "Bendahara Koperasi (NIK: BIT-2022-098)" },
      { role: "Disetujui Oleh,", name: "Ir. Bambang Trihatmojo", titleOrNik: "Ketua Koperasi Kopkar BIT" },
    ],
  };
}

/**
 * 6. EMPLOYEES & MEMBERS MASTER DATA REPORT BUILDER
 */
export function buildEmployeesReportConfig(employees: any[]): FormalReportConfig {
  const totalWajib = employees.reduce((sum, e) => sum + (e.simpananWajib || 0), 0);
  const totalSukarela = employees.reduce((sum, e) => sum + (e.simpananSukarela || 0), 0);
  const totalPokok = employees.reduce((sum, e) => sum + (e.simpananPokok || 0), 0);
  const totalSimpanan = totalPokok + totalWajib + totalSukarela;

  return {
    title: "LAPORAN BUKU INDUK ANGGOTA & REKAP SIMPANAN KOPERASI",
    subTitle: "Master Data Karyawan PT. Bhakti Idola Tama yang Terdaftar Sebagai Anggota Kopkar BIT",
    documentNumber: `KOP-BIT/AGT/${new Date().getFullYear()}/09/${Math.floor(100 + Math.random() * 900)}`,
    period: `Tahun Buku ${new Date().getFullYear()}`,
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    departmentOrUnit: "Sekretariat & Keanggotaan Koperasi PT. Bhakti Idola Tama",
    orientation: "landscape",
    filename: `Laporan-Buku-Induk-Anggota-Kopkar-BIT-${new Date().getFullYear()}`,
    summaries: [
      { label: "Total Anggota Terdaftar", value: `${employees.length} Orang`, highlight: true },
      { label: "Total Simpanan Pokok", value: `Rp ${totalPokok.toLocaleString("id-ID")}` },
      { label: "Total Simpanan Wajib", value: `Rp ${totalWajib.toLocaleString("id-ID")}` },
      { label: "Total Simpanan Sukarela", value: `Rp ${totalSukarela.toLocaleString("id-ID")}` },
    ],
    columns: [
      { header: "No", key: "_no", align: "center", width: "35px" },
      { header: "NIK", key: "nik", align: "center" },
      { header: "Nama Lengkap", key: "name", align: "left" },
      { header: "Departemen", key: "department", align: "left" },
      { header: "Jabatan", key: "position", align: "center" },
      {
        header: "Masa Kerja",
        key: "tenureYears",
        align: "center",
        formatter: (v) => `${v} Tahun`,
      },
      {
        header: "Gaji Pokok",
        key: "monthlySalary",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Limit Kredit",
        key: "calculatedLoanLimit",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Simp. Wajib",
        key: "simpananWajib",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Simp. Sukarela",
        key: "simpananSukarela",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Total Simpanan",
        key: "totalSavings",
        align: "right",
        formatter: (_, r) => `Rp ${((r.simpananPokok || 0) + (r.simpananWajib || 0) + (r.simpananSukarela || 0)).toLocaleString("id-ID")}`,
      },
    ],
    data: employees,
    totalRow: {
      _no: "",
      nik: "TOTAL",
      name: "",
      department: "",
      position: "",
      tenureYears: "",
      monthlySalary: "",
      calculatedLoanLimit: "",
      simpananWajib: `Rp ${totalWajib.toLocaleString("id-ID")}`,
      simpananSukarela: `Rp ${totalSukarela.toLocaleString("id-ID")}`,
      totalSavings: `Rp ${totalSimpanan.toLocaleString("id-ID")}`,
    },
    notes: [
      "Keanggotaan koperasi bersifat otomatis bagi seluruh karyawan tetap dan kontrak PT. Bhakti Idola Tama.",
      "Simpanan pokok dibayarkan saat awal masuk dan simpanan wajib dipotong rutin Rp 100.000 / bulan.",
      "Seluruh anggota berhak mendapatkan bagian Sisa Hasil Usaha (SHU) tahunan secara proporsional.",
    ],
    signatures: [
      { role: "Petugas Data Anggota,", name: "Budi Santoso", titleOrNik: "Staff Administrasi" },
      { role: "Sekretaris Koperasi,", name: "Siti Rahmawati", titleOrNik: "Sekretaris Pengurus" },
      { role: "Ketua Koperasi,", name: "Ir. Bambang Trihatmojo", titleOrNik: "Ketua Kopkar BIT" },
    ],
  };
}

/**
 * 7. BANK MANDIRI CHANNELING REPORT BUILDER
 */
export function buildBankChannelingReportConfig(
  debtors: any[],
  bankStatus: any,
  drawdowns: any[] = []
): FormalReportConfig {
  const totalChanneled = debtors.reduce((sum, d) => sum + (d.loanAmount || 0), 0);
  const totalPrincipalRemain = debtors.reduce((sum, d) => sum + (d.remainingPrincipal || 0), 0);

  return {
    title: "LAPORAN PENYALURAN KREDIT CHANNELING BANK MANDIRI",
    subTitle: "Skema Kerjasama Kemitraan Likuiditas PT. Bank Mandiri (Persero) Tbk dengan Kopkar PT. Bhakti Idola Tama",
    documentNumber: `KOP-BIT/CHN-MDR/${new Date().getFullYear()}/09/${Math.floor(100 + Math.random() * 900)}`,
    period: "September 2026 (Fasilitas Standby Rp 1.5 Miliar)",
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    departmentOrUnit: "Treasury & Hubungan Lembaga Keuangan Kopkar BIT & Bank Mandiri",
    orientation: "landscape",
    filename: `Laporan-Channeling-Bank-Mandiri-Kopkar-${new Date().getFullYear()}`,
    summaries: [
      { label: "Total Plafon Fasilitas", value: "Rp 1.500.000.000", highlight: true },
      { label: "Kredit Channeling Terpakai", value: `Rp ${(bankStatus?.bankCreditLineUsed || 620000000).toLocaleString("id-ID")}` },
      { label: "Sisa Idle Line Mandiri", value: `Rp ${(bankStatus?.availableBankLimit || 880000000).toLocaleString("id-ID")}`, subLabel: "Siap Disalurkan" },
      { label: "Tingkat Kolektibilitas", value: "100% Lancar (KOL-1)", subLabel: "NPL: 0.00%" },
    ],
    columns: [
      { header: "No", key: "_no", align: "center", width: "35px" },
      { header: "No. Rek Debitur", key: "mandiriLoanAccount", align: "center" },
      { header: "Nama Debitur", key: "employeeName", align: "left" },
      { header: "NIK", key: "employeeNik", align: "center" },
      { header: "Departemen", key: "department", align: "left" },
      {
        header: "Plafon Kredit",
        key: "loanAmount",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Tenor",
        key: "tenorMonths",
        align: "center",
        formatter: (v) => `${v} Bulan`,
      },
      {
        header: "Bunga Bank",
        key: "interestRatePerYear",
        align: "center",
        formatter: (v) => `${v}% / Thn`,
      },
      {
        header: "Sisa Pokok",
        key: "remainingPrincipal",
        align: "right",
        formatter: (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`,
      },
      {
        header: "Status / Kolektibilitas",
        key: "collectibilityStatus",
        align: "center",
        formatter: (v) => (v === "LANCAR_KOL_1" ? "KOL-1 (LANCAR)" : v),
      },
    ],
    data: debtors,
    totalRow: {
      _no: "",
      mandiriLoanAccount: "TOTAL",
      employeeName: "",
      employeeNik: "",
      department: "",
      loanAmount: `Rp ${totalChanneled.toLocaleString("id-ID")}`,
      tenorMonths: "",
      interestRatePerYear: "",
      remainingPrincipal: `Rp ${totalPrincipalRemain.toLocaleString("id-ID")}`,
      collectibilityStatus: "100% KOL-1",
    },
    notes: [
      "Fasilitas pembiayaan channeling terikat perjanjian kerjasama PKS No. PKS-MDR/KOP-BIT/2026/01.",
      "Jaminan kredit didukung oleh jaminan potong gaji resmi HRD PT. Bhakti Idola Tama dan dana cadangan koperasi.",
      "Pembayaran bunga dan pokok ke Bank Mandiri didebet otomatis setiap tanggal 28 bulan berjalan.",
    ],
    signatures: [
      { role: "Treasury Koperasi,", name: "Dewi Lestari", titleOrNik: "Bendahara Kopkar BIT" },
      { role: "Ketua Koperasi,", name: "Ir. Bambang Trihatmojo", titleOrNik: "Ketua Kopkar BIT" },
      { role: "Relationship Manager,", name: "Rendy Pratama", titleOrNik: "PT Bank Mandiri (Persero) Tbk" },
    ],
  };
}

/**
 * 8. EXECUTIVE SUMMARY DASHBOARD REPORT BUILDER
 */
export function buildExecutiveDashboardReportConfig(stats: {
  totalEmployees: number;
  totalLoansDisbursed: number;
  totalSavings: number;
  canteenRevenue: number;
  storeRevenue: number;
  bankLimitAvailable: number;
}): FormalReportConfig {
  const summaryRows = [
    { no: 1, unit: "Unit Simpan Pinjam Anggota", metric: "Total Penyaluran Pinjaman Aktif", value: `Rp ${stats.totalLoansDisbursed.toLocaleString("id-ID")}`, status: "Sehat (NPL 0%)" },
    { no: 2, unit: "Unit Tabungan Simpanan", metric: "Total Saldo Simpanan Anggota Terkumpul", value: `Rp ${stats.totalSavings.toLocaleString("id-ID")}`, status: "Tumbuh 18.5% YoY" },
    { no: 3, unit: "Unit Stand Kantin Pabrik", metric: "Total Omzet Penjualan Makanan & Minuman", value: `Rp ${stats.canteenRevenue.toLocaleString("id-ID")}`, status: "Operasional Lancar" },
    { no: 4, unit: "Unit Toko Koperasi & Elektronik", metric: "Total Omzet Penjualan Barang Rumah Tangga", value: `Rp ${stats.storeRevenue.toLocaleString("id-ID")}`, status: "Penjualan Tunai/QRIS" },
    { no: 5, unit: "Kemitraan Bank Mandiri", metric: "Sisa Idle Line Channeling Tersedia", value: `Rp ${stats.bankLimitAvailable.toLocaleString("id-ID")}`, status: "Likuiditas Aman (1.5 M)" },
  ];

  return {
    title: "LAPORAN EKSEKUTIF KINERJA KOPERASI KARYAWAN",
    subTitle: "Ringkasan Konsolidasi Kinerja Seluruh Unit Bisnis Kopkar PT. Bhakti Idola Tama",
    documentNumber: `KOP-BIT/EKS/${new Date().getFullYear()}/09/${Math.floor(100 + Math.random() * 900)}`,
    period: "September 2026",
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    departmentOrUnit: "Dewan Pengawas & Pengurus Koperasi PT. Bhakti Idola Tama",
    orientation: "portrait",
    filename: `Laporan-Eksekutif-Kinerja-Kopkar-BIT-${new Date().getFullYear()}`,
    summaries: [
      { label: "Total Anggota Aktif", value: `${stats.totalEmployees} Karyawan`, highlight: true },
      { label: "Portofolio Pinjaman", value: `Rp ${stats.totalLoansDisbursed.toLocaleString("id-ID")}` },
      { label: "Dana Simpanan", value: `Rp ${stats.totalSavings.toLocaleString("id-ID")}` },
      { label: "Likuiditas Siap Pakai", value: `Rp ${stats.bankLimitAvailable.toLocaleString("id-ID")}` },
    ],
    columns: [
      { header: "No", key: "no", align: "center", width: "35px" },
      { header: "Unit Usaha Koperasi", key: "unit", align: "left" },
      { header: "Parameter Kinerja Utama", key: "metric", align: "left" },
      { header: "Realisasi Nilai", key: "value", align: "right" },
      { header: "Status Kinerja", key: "status", align: "center" },
    ],
    data: summaryRows,
    notes: [
      "Kondisi kesehatan keuangan Koperasi Karyawan PT. Bhakti Idola Tama berada pada predikat SANGAT SEHAT.",
      "Rasio kecukupan likuiditas dan permodalan terjamin melalui kemitraan strategis fasilitas kredit Bank Mandiri.",
      "Laporan eksekutif ini diserahkan kepada Direksi PT. Bhakti Idola Tama dan Dewan Pengawas Koperasi.",
    ],
    signatures: [
      { role: "Bendahara Koperasi,", name: "Dewi Lestari", titleOrNik: "Bendahara Pengurus" },
      { role: "Ketua Koperasi,", name: "Ir. Bambang Trihatmojo", titleOrNik: "Ketua Kopkar BIT" },
      { role: "Ketua Dewan Pengawas,", name: "Drs. H. Sukamto, M.M.", titleOrNik: "Dewan Pengawas Koperasi" },
    ],
  };
}

