import { useRef } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";

interface CsvUploadCenterProps {
  csvFile: File | null;
  records: any[];
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  processCSV: (file: File) => void;
  clearFile: () => void;
}

export default function CsvUploadCenter({
  csvFile,
  records,
  handleDragOver,
  handleDrop,
  processCSV,
  clearFile,
}: CsvUploadCenterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center select-none">
      <label
        htmlFor="voter-csv-upload"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="w-full max-w-lg border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-blue-500 hover:bg-slate-50/50 transition-all cursor-pointer flex flex-col items-center group"
      >
        <div className="p-4 bg-blue-50 rounded-full text-blue-600 mb-4 group-hover:scale-110 transition-transform">
          <Upload className="h-8 w-8" />
        </div>

        <h4 className="text-slate-900 font-bold text-base">Drag & Drop Your Voter CSV or Excel</h4>
        <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">
          Supports <code>.csv</code> and <code>.xlsx</code> spreadsheet formats. Auto schema verification inside browser.
        </p>

        <div className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
          Select File From Device
        </div>

        <input
          id="voter-csv-upload"
          ref={fileInputRef}
          type="file"
          accept=".csv, text/csv, application/csv, application/vnd.ms-excel, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xls"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              processCSV(e.target.files[0]);
            }
          }}
        />
      </label>

      {csvFile && (
        <div className="mt-6 flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-left w-full max-w-lg select-text">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div className="flex-grow min-w-0">
            <h5 className="font-bold text-slate-900 text-xs truncate">{csvFile.name}</h5>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {(csvFile.size / 1024).toFixed(1)} KB • {records.length} records parsed
            </p>
          </div>
          <button
            onClick={clearFile}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
