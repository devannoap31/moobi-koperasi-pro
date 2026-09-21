"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  X,
  Printer,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  FormalReportConfig,
  exportToCsv,
  printFormalReport,
  generateFormalReportHtml,
} from "@/utils/reportExporter";

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FormalReportConfig | null;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  // Auto-detect optimal orientation: wide tables (>= 7 columns) default to landscape
  const defaultOrientation = config?.orientation || (config && config.columns.length >= 7 ? "landscape" : "portrait");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(defaultOrientation);
  const [copyNotice, setCopyNotice] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync orientation when config changes
  useEffect(() => {
    if (config) {
      const opt = config.orientation || (config.columns.length >= 7 ? "landscape" : "portrait");
      setOrientation(opt);
    }
  }, [config]);

  // Generate complete, pristine HTML for the current configuration
  const currentConfig = useMemo(() => {
    if (!config) return null;
    return {
      ...config,
      orientation: orientation,
    };
  }, [config, orientation]);

  const htmlContent = useMemo(() => {
    if (!currentConfig) return "";
    return generateFormalReportHtml(currentConfig);
  }, [currentConfig]);

  if (!isOpen || !config || !currentConfig) return null;

  // Direct print via iframe (no popup blocking issues)
  const handlePrintPdf = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      } catch (e) {
        console.warn("Iframe print fallback triggered:", e);
      }
    }
    printFormalReport(currentConfig);
  };

  // Open in new standalone tab
  const handleOpenNewTab = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    exportToCsv(currentConfig);
  };

  // Copy Summary text to clipboard
  const handleCopySummary = () => {
    const summaryLines = [
      `KOPERASI KARYAWAN PT BHAKTI IDOLA TAMA (KOPKAR BIT)`,
      config.title,
      `Nomor Dokumen: ${config.documentNumber}`,
      `Periode: ${config.period}`,
      `Tanggal: ${config.date}`,
      `Unit: ${config.departmentOrUnit || "Koperasi BIT"}`,
      "",
      "RINGKASAN EKSEKUTIF:",
      ...(config.summaries || []).map((s) => `- ${s.label}: ${s.value}`),
      "",
      `Total Baris Data: ${config.data.length} Record`,
    ].join("\n");

    navigator.clipboard.writeText(summaryLines);
    setCopyNotice(true);
    setTimeout(() => setCopyNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-[#181920] text-white rounded-[20px] shadow-2xl border border-white/10 w-full max-w-6xl h-[94vh] flex flex-col overflow-hidden">
        
        {/* 1. TOP HEADER */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#121318]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[12px] bg-[#4A3AFF] text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-white truncate">
                  {config.title}
                </h3>
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#E6F9F0] text-[#2DBA7D]">
                  Dokumen Resmi Koperasi
                </span>
              </div>
              <p className="text-[11px] text-[#A5A2B8] flex items-center gap-2 mt-0.5 truncate">
                <span>No: <strong className="text-white font-mono">{config.documentNumber}</strong></span>
                <span>&bull;</span>
                <span>Periode: <strong className="text-white">{config.period}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewTab}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Buka Dokumen di Tab Baru"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tab Baru</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. ACTION TOOLBAR */}
        <div className="px-5 py-2.5 bg-[#20222a] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Orientation Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A5A2B8] font-medium hidden md:inline">Orientasi Kertas:</span>
            <div className="flex items-center bg-[#121318] p-1 rounded-full border border-white/10">
              <button
                onClick={() => setOrientation("portrait")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  orientation === "portrait"
                    ? "bg-[#4A3AFF] text-white shadow-xs"
                    : "text-white/60 hover:text-white"
                }`}
              >
                A4 Tegak (Portrait)
              </button>
              <button
                onClick={() => setOrientation("landscape")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  orientation === "landscape"
                    ? "bg-[#4A3AFF] text-white shadow-xs"
                    : "text-white/60 hover:text-white"
                }`}
              >
                A4 Melebar (Landscape)
              </button>
            </div>
            {config.columns.length >= 7 && orientation === "portrait" && (
              <span className="text-[10px] text-amber-400 hidden lg:inline">
                (Saran: Gunakan Landscape untuk tabel banyak kolom)
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Salin Ringkasan Teks Laporan"
            >
              {copyNotice ? <CheckCircle2 className="w-3.5 h-3.5 text-[#2DBA7D]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copyNotice ? "Tersalin!" : "Salin Ringkasan"}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 rounded-full bg-[#2DBA7D] hover:bg-[#239962] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Unduh Spreadsheet Excel (.csv UTF-8 BOM)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handlePrintPdf}
              className="px-4 py-1.5 rounded-full bg-[#4A3AFF] hover:bg-[#3D2EE0] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#4A3AFF]/30"
              title="Buka Dialog Cetak / Simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* 3. ISOLATED IFRAME DOCUMENT PREVIEW */}
        <div className="flex-1 bg-[#2b2e36] p-2 sm:p-4 overflow-hidden flex items-center justify-center">
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            title={config.title}
            className="w-full h-full border-0 rounded-[6px] shadow-2xl bg-[#2b2e36]"
          />
        </div>

      </div>
    </div>
  );
};
