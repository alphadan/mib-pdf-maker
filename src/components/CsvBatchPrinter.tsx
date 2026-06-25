import { useState, useRef } from "react";
import Papa from "papaparse";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Printer,
  Settings,
  FileText,
  X,
} from "lucide-react";

interface FieldCoord {
  name: string;
  label: string;
  x: number;
  y: number;
  type: "text" | "checkbox";
}

interface CsvBatchPrinterProps {
  coords: Record<string, FieldCoord>;
  resetCoordinates: () => void;
  handleCoordinateChange: (
    fieldName: string,
    axis: "x" | "y",
    val: number,
  ) => void;
  mediumFontBytes: ArrayBuffer | null;
  pdfTemplateLoaded: boolean | null;
  requiredHeaders: string[];
}

export default function CsvBatchPrinter({
  coords,
  resetCoordinates,
  handleCoordinateChange,
  mediumFontBytes,
  pdfTemplateLoaded,
  requiredHeaders,
}: CsvBatchPrinterProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [missingHeaders, setMissingHeaders] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showCoordsEditor, setShowCoordsEditor] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");
  const [generatedBlobUrl, setGeneratedBlobUrl] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"upload" | "preview">("upload");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processCSV = (file: File) => {
    setValidationError(null);
    setMissingHeaders([]);
    setRecords([]);

    if (!file.name.endsWith(".csv")) {
      setValidationError(
        "Invalid file format. Please upload a spreadsheet with a .csv extension.",
      );
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];

        // Find missing headers (case sensitive checklist)
        const missing = requiredHeaders.filter((h) => !headers.includes(h));

        if (missing.length > 0) {
          setMissingHeaders(missing);
          setValidationError(
            `The CSV is missing ${missing.length} required field columns.`,
          );
          return;
        }

        const rawData = results.data;
        if (rawData.length === 0) {
          setValidationError(
            "The CSV file does not contain any voter records.",
          );
          return;
        }

        if (rawData.length > 25) {
          setValidationError(
            `Batch limit exceeded. You uploaded ${rawData.length} records, but the prototype is limited to a maximum of 25 records to protect memory and client performance.`,
          );
          return;
        }

        const mappedData = rawData.map((record: any) => {
          return {
            ...record,
            last_name: record.Last_Name || "",
            suffix: record.Suffix || "",
            first_name: record.First_Name || "",
            middle_name: record.Middle_Name || "",
            birthdate: record.Date_Of_Birth || "",
            phone: record["RNCfiles.PrimaryPhone"] || "",
            suite_number: record.Apt__ || "",
            city: record.City || "",
            state: record.State || "",
            zip_code: record.Zip_Code || "",
            precinct: record.Precinct || "",
            ward: record.Ward || "",
            mailing_city: record.MCity || "",
            mailing_state: record.MState || "",
            mailing_zip: record.MZip_Code || "",

            // Construct virtual compound fields for overlaying
            address:
              `${record.House__ || ""} ${record.StreetNameComplete || ""}`.trim(),
            mailing_address:
              `${record.MAddress_Line_1 || ""} ${record.MAddress_Line_2 || ""}`.trim(),
            annual_request: String(record["VBM.AppType"] || "")
              .toLowerCase()
              .includes("annual")
              ? "yes"
              : "no",
          };
        });

        setCsvFile(file);
        setRecords(mappedData);
        setActiveTab("preview");
      },
      error: (err) => {
        setValidationError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processCSV(files[0]);
    }
  };

  const clearFile = () => {
    setCsvFile(null);
    setRecords([]);
    setValidationError(null);
    setMissingHeaders([]);
    setGeneratedBlobUrl(null);
    setIsSuccess(false);
    setActiveTab("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generatePDF = async (singleRecordIndex: number | null = null) => {
    if (pdfTemplateLoaded === false) {
      alert(
        'Cannot generate PDF: The application template "PADOS_MailInApplication.pdf" was not found in the public folder. Please verify installation.',
      );
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setStatusText("Downloading ballot PDF template into browser memory...");
    setValidationError(null);

    try {
      const response = await fetch("/PADOS_MailInApplication.pdf");
      if (!response.ok)
        throw new Error(
          "Official Pennsylvania Mail-In PDF template could not be loaded.",
        );
      const templateBytes = await response.arrayBuffer();

      const batchPdf = await PDFDocument.create();
      const recordsToProcess =
        singleRecordIndex !== null ? [records[singleRecordIndex]] : records;
      const total = recordsToProcess.length;

      for (let i = 0; i < total; i++) {
        const record = recordsToProcess[i];
        const name =
          `${record.first_name || ""} ${record.last_name || ""}`.trim() ||
          `Record #${i + 1}`;

        setStatusText(`Filling out application ${i + 1} of ${total}: ${name}`);
        setProgress(Math.round((i / total) * 90) + 5);

        // Load a temporary instance of the template, modify it, and copy it
        const tempDoc = await PDFDocument.load(templateBytes);
        tempDoc.registerFontkit(fontkit);
        const page = tempDoc.getPages()[0];

        // Embed the custom Inter-Medium font if loaded; fallback to standard Helvetica-Bold
        const fontMedium = mediumFontBytes
          ? await tempDoc.embedFont(mediumFontBytes)
          : await tempDoc.embedFont(StandardFonts.HelveticaBold);

        const fontBold = await tempDoc.embedFont(StandardFonts.HelveticaBold);

        // Dark rich ballot-safe blue ink
        const bluePenColor = rgb(0.08, 0.22, 0.58);

        // Map every text field in the record
        Object.keys(coords).forEach((key) => {
          const field = coords[key];
          const val = record[key];

          if (field.type === "text" && val && String(val).trim() !== "") {
            page.drawText(String(val).trim(), {
              x: field.x,
              y: field.y,
              size: 12,
              font: fontMedium,
              color: bluePenColor,
            });
          }
        });

        // Specialized Checkbox Logic: Section 4 - Same as Above
        const mailingAddress = record.mailing_address
          ? String(record.mailing_address).trim()
          : "";
        const hasMailing = mailingAddress.length > 0;

        if (!hasMailing) {
          // Check "Same as above" box in Section 4 (Coordinates X: 262, Y: 428)
          page.drawText("X", {
            x: 262,
            y: 428,
            size: 11,
            font: fontBold,
            color: bluePenColor,
          });
        }

        // Section 7 - Annual Mail-in request
        const isAnnualVal = String(record.annual_request || "")
          .trim()
          .toLowerCase();
        const isAnnualChecked = [
          "true",
          "yes",
          "y",
          "1",
          "checked",
          "on",
        ].includes(isAnnualVal);

        if (isAnnualChecked) {
          const annualField = coords.annual_request;
          page.drawText("X", {
            x: annualField.x,
            y: annualField.y,
            size: 11.5,
            font: fontBold,
            color: bluePenColor,
          });
        }

        // Copy modified template page into the final consolidated batch document
        const [copiedPage] = await batchPdf.copyPages(tempDoc, [0]);
        batchPdf.addPage(copiedPage);

        // A tiny artificial delay to give the browser thread space to render our progress state smoothly
        await new Promise((resolve) => setTimeout(resolve, 80));
      }

      setStatusText("Assembling multi-page ballot batch file...");
      setProgress(95);

      const batchBytes = await batchPdf.save();
      const blob = new Blob([batchBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setGeneratedBlobUrl(url);
      setProgress(100);
      setIsSuccess(true);

      // Programmatic auto-download of the completed file
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.setAttribute(
        "download",
        `pa_ballot_applications_batch_${recordsToProcess.length}_records.pdf`,
      );
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err: any) {
      setValidationError(`Engine processing failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl shadow-sm flex items-start gap-3">
          <div className="p-1 bg-rose-100 rounded text-rose-800 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-grow">
            <h4 className="font-semibold text-sm">Processing Error</h4>
            <p className="text-xs mt-0.5 leading-relaxed">{validationError}</p>
            {missingHeaders.length > 0 && (
              <div className="mt-2">
                <span className="text-xs font-semibold">
                  Missing Headers Checklist:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {missingHeaders.map((h) => (
                    <span
                      key={h}
                      className="bg-rose-100 border border-rose-200 text-rose-700 px-2 py-0.5 rounded text-[10px] font-mono"
                    >
                      ⚠️ {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Upload Control */}
        <div className="lg:col-span-2 space-y-6">
          {/* TABS SELECTOR */}
          {csvFile && (
            <div className="flex space-x-1 bg-slate-200/60 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "upload"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upload Center
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "preview"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Parsed Voters Preview ({records.length})
              </button>
            </div>
          )}

          {/* TAB 1: UPLOAD BOX */}
          {activeTab === "upload" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center">
              <label
                htmlFor="voter-csv-upload"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="w-full max-w-lg border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-blue-500 hover:bg-slate-50/50 transition-all cursor-pointer flex flex-col items-center group"
              >
                <div className="p-4 bg-blue-50 rounded-full text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8" />
                </div>

                <h4 className="text-slate-900 font-bold text-base">
                  Drag & Drop Your Voter CSV
                </h4>
                <p className="text-slate-500 text-xs mt-1 max-w-xs">
                  Supports <code>.csv</code> spreadsheet format. Auto schema
                  verification inside browser.
                </p>

                <div className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
                  Select File From Device
                </div>

                <input
                  id="voter-csv-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, text/csv, application/csv, application/vnd.ms-excel"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      processCSV(e.target.files[0]);
                    }
                  }}
                />
              </label>

              {csvFile && (
                <div className="mt-6 flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-left w-full max-w-lg">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h5 className="font-bold text-slate-900 text-xs truncate">
                      {csvFile.name}
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      {(csvFile.size / 1024).toFixed(1)} KB • {records.length}{" "}
                      records parsed
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
          )}

          {/* TAB 2: DATA TABLE PREVIEW */}
          {activeTab === "preview" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Voter Record Listing
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Verified schema rows parsed safely in memory.
                  </p>
                </div>
                <button
                  onClick={clearFile}
                  className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear Dataset
                </button>
              </div>

              <div className="overflow-x-auto max-h-[440px]">
                <table className="w-full text-left text-[11px] text-slate-600">
                  <thead className="bg-slate-100 text-[10px] text-slate-700 uppercase font-bold tracking-wider sticky top-0">
                    <tr>
                      <th className="px-4 py-3 border-b border-slate-200">#</th>
                      <th className="px-4 py-3 border-b border-slate-200">
                        Voter Name
                      </th>
                      <th className="px-4 py-3 border-b border-slate-200">
                        Age
                      </th>
                      <th className="px-4 py-3 border-b border-slate-200">
                        Party
                      </th>
                      <th className="px-4 py-3 border-b border-slate-200">
                        Address
                      </th>
                      <th className="px-4 py-3 border-b border-slate-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-slate-900">
                          {r.first_name} {r.last_name}
                        </td>
                        <td className="px-4 py-2.5 font-medium">
                          {r["RNCfiles.Age"] || "N/A"}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              String(r["RNCfiles.OfficialParty"])
                                .toLowerCase()
                                .includes("dem")
                                ? "bg-blue-50 border-blue-100 text-blue-700"
                                : String(r["RNCfiles.OfficialParty"])
                                      .toLowerCase()
                                      .includes("rep")
                                  ? "bg-red-50 border-red-100 text-red-700"
                                  : "bg-slate-50 border-slate-100 text-slate-600"
                            }`}
                          >
                            {r["RNCfiles.OfficialParty"] || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 max-w-xs truncate">
                          {r.address}, {r.city}
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            onClick={() => generatePDF(idx)}
                            disabled={isProcessing}
                            className="text-blue-600 font-bold hover:underline"
                          >
                            Download Single
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Instructions, coordinates & progress */}
        <div className="space-y-6">
          {/* PROCESSING STATE LOADER */}
          {isProcessing && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  Generating Batch PDF
                </span>
                <span className="text-xs font-mono text-blue-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 animate-pulse">
                {statusText}
              </p>
            </div>
          )}

          {/* SUCCESS STATUS */}
          {isSuccess && generatedBlobUrl && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Batch Compilation Complete
              </div>
              <p className="text-[10px] text-emerald-700 leading-relaxed">
                All voter records have been successfully embedded onto
                individual ballot applications and merged into a single
                multi-page PDF document.
              </p>
              <div className="flex gap-2">
                <a
                  href={generatedBlobUrl}
                  download={`pa_ballot_applications_batch_${records.length}_records.pdf`}
                  className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" /> Re-download Batch
                </a>
              </div>
            </div>
          )}

          {/* BATCH ACTION CONTAINER */}
          {records.length > 0 && !isProcessing && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center space-y-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-full w-fit mx-auto">
                <Printer className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Trigger Consolidated Batch Print
                </h4>
                <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">
                  Merge all {records.length} voter records onto the PA Ballot
                  Application template and download a single multi-page file.
                </p>
              </div>
              <button
                onClick={() => generatePDF(null)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Compile and Download Batch PDF ({records.length} Pages)
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* WORKFLOW GUIDE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-3">
              <FileText className="h-4.5 w-4.5 text-blue-600" />
              Workflow Instructions
            </h3>
            <ol className="space-y-3.5 text-xs text-slate-600 list-decimal pl-4.5">
              <li>
                <a
                  href="/pa_voter_ballots_sample.csv"
                  download
                  className="text-blue-600 hover:underline font-semibold text-left focus:outline-none"
                >
                  Download the sample voter CSV template
                </a>{" "}
                to check the required column mapping structure.
              </li>
              <li>
                Ensure your voter spreadsheet has the mandatory columns (e.g.,{" "}
                <code>last_name</code>, <code>first_name</code>,{" "}
                <code>address</code>, <code>birthdate</code>, etc.).
              </li>
              <li>
                Upload your CSV file. The browser will run auto schema
                validation on columns and records.
              </li>
              <li>
                Review individual rows in the preview tab, then trigger the{" "}
                <strong>batch generation button</strong> to print all
                applications.
              </li>
            </ol>
            <a
              href="/pa_voter_ballots_sample.csv"
              download
              className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-semibold hover:bg-slate-50 transition-colors block text-center"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 inline-block align-middle" />
              <span className="ml-1.5 align-middle">
                Download Sample CSV Template
              </span>
            </a>
          </div>

          {/* ADVANCED COORDINATES TUNER */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setShowCoordsEditor(!showCoordsEditor)}
              className="w-full flex justify-between items-center p-5 bg-white border-b border-transparent font-bold text-slate-900 text-xs hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <span className="flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-blue-600" />
                Fine-tune Application Alignment (Advanced)
              </span>
              <span className="text-xs text-blue-600">
                {showCoordsEditor ? "Hide Panel" : "Open Panel"}
              </span>
            </button>

            {showCoordsEditor && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Adjust text alignment coordinates in PDF points. Origin{" "}
                  <span className="font-semibold">(0,0)</span> is at the{" "}
                  <strong>bottom-left</strong> of standard Letter size (612 x
                  792 points). Changes apply immediately to generating sheets.
                </p>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] font-bold text-slate-700">
                    Database Fields Coordinate Mapping
                  </span>
                  <button
                    onClick={resetCoordinates}
                    className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 hover:underline"
                  >
                    Reset Map
                  </button>
                </div>

                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {Object.keys(coords).map((key) => {
                    const item = coords[key];
                    return (
                      <div
                        key={key}
                        className="bg-white border border-slate-200 p-3 rounded-xl shadow-xs space-y-2 text-[11px]"
                      >
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{item.label}</span>
                          <span className="font-mono text-slate-400 text-[10px]">
                            {key}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-bold">X:</span>
                            <input
                              type="number"
                              value={item.x}
                              onChange={(e) =>
                                handleCoordinateChange(
                                  key,
                                  "x",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-bold">Y:</span>
                            <input
                              type="number"
                              value={item.y}
                              onChange={(e) =>
                                handleCoordinateChange(
                                  key,
                                  "y",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
