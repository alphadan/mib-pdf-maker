import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Lock,
  Printer,
  Sliders,
  Settings,
  Eye,
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

const DEFAULT_COORDS: Record<string, FieldCoord> = {
  last_name: {
    name: "last_name",
    label: "Last Name",
    x: 255,
    y: 642,
    type: "text",
  },
  suffix: {
    name: "suffix",
    label: "Suffix (Jr, Sr, etc.)",
    x: 425,
    y: 642,
    type: "text",
  },
  first_name: {
    name: "first_name",
    label: "First Name",
    x: 255,
    y: 625,
    type: "text",
  },
  middle_name: {
    name: "middle_name",
    label: "Middle Name / Initial",
    x: 425,
    y: 625,
    type: "text",
  },
  birthdate: {
    name: "birthdate",
    label: "Birthdate (MM/DD/YYYY)",
    x: 255,
    y: 592,
    type: "text",
  },
  phone: {
    name: "phone",
    label: "Phone (Optional)",
    x: 370,
    y: 592,
    type: "text",
  },
  email: {
    name: "email",
    label: "Email (Optional)",
    x: 255,
    y: 575,
    type: "text",
  },
  address: {
    name: "address",
    label: "Address (not P.O. Box)",
    x: 255,
    y: 540,
    type: "text",
  },
  suite_number: {
    name: "suite_number",
    label: "Apt/Suite Number",
    x: 430,
    y: 540,
    type: "text",
  },
  city: { name: "city", label: "City/Town", x: 255, y: 523, type: "text" },
  state: { name: "state", label: "State", x: 355, y: 523, type: "text" },
  zip_code: {
    name: "zip_code",
    label: "ZIP Code",
    x: 390,
    y: 523,
    type: "text",
  },
  municipality: {
    name: "municipality",
    label: "Municipality",
    x: 255,
    y: 502,
    type: "text",
  },
  county: { name: "county", label: "County", x: 370, y: 502, type: "text" },
  precinct: {
    name: "precinct",
    label: "Voting District / Precinct",
    x: 255,
    y: 478,
    type: "text",
  },
  ward: { name: "ward", label: "Ward", x: 370, y: 478, type: "text" },
  mailing_address: {
    name: "mailing_address",
    label: "Mailing Address",
    x: 320,
    y: 412,
    type: "text",
  },
  mailing_city: {
    name: "mailing_city",
    label: "Mailing City",
    x: 255,
    y: 395,
    type: "text",
  },
  mailing_state: {
    name: "mailing_state",
    label: "Mailing State",
    x: 370,
    y: 395,
    type: "text",
  },
  mailing_zip: {
    name: "mailing_zip",
    label: "Mailing ZIP",
    x: 405,
    y: 395,
    type: "text",
  },
  annual_request: {
    name: "annual_request",
    label: "Annual Request Checkbox",
    x: 262,
    y: 217,
    type: "checkbox",
  },
};

const REQUIRED_HEADERS = Object.keys(DEFAULT_COORDS);

export default function App() {
  const [coords, setCoords] =
    useState<Record<string, FieldCoord>>(DEFAULT_COORDS);
  const [pdfTemplateLoaded, setPdfTemplateLoaded] = useState<boolean | null>(
    null,
  );
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

  // Load PDF Template to check readiness
  useEffect(() => {
    fetch("/PADOS_MailInApplication.pdf")
      .then((res) => {
        if (res.ok) {
          setPdfTemplateLoaded(true);
        } else {
          setPdfTemplateLoaded(false);
          console.error("PDF Template was not found in the public folder.");
        }
      })
      .catch((err) => {
        setPdfTemplateLoaded(false);
        console.error("Error loading PDF template:", err);
      });
  }, []);

  const handleCoordinateChange = (
    fieldName: string,
    axis: "x" | "y",
    val: number,
  ) => {
    setCoords((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        [axis]: Math.max(0, val),
      },
    }));
  };

  const resetCoordinates = () => {
    setCoords(DEFAULT_COORDS);
  };

  const downloadSampleCSV = () => {
    const sampleRows = [
      {
        last_name: "Smith",
        suffix: "Jr",
        first_name: "John",
        middle_name: "Arthur",
        birthdate: "10/14/1982",
        phone: "717-555-0192",
        email: "john.smith@example.org",
        address: "124 Market St",
        suite_number: "Apt 3B",
        city: "Harrisburg",
        state: "PA",
        zip_code: "17101",
        municipality: "Harrisburg City",
        county: "Dauphin",
        precinct: "Ward 4 Precinct 1",
        ward: "4",
        mailing_address: "",
        mailing_city: "",
        mailing_state: "",
        mailing_zip: "",
        annual_request: "yes",
      },
      {
        last_name: "Rodriguez",
        suffix: "",
        first_name: "Maria",
        middle_name: "Elena",
        birthdate: "03/22/1990",
        phone: "215-555-0481",
        email: "maria.r90@example.net",
        address: "5820 Germantown Ave",
        suite_number: "",
        city: "Philadelphia",
        state: "PA",
        zip_code: "19144",
        municipality: "Philadelphia City",
        county: "Philadelphia",
        precinct: "Ward 12 Precinct 4",
        ward: "12",
        mailing_address: "P.O. Box 92831",
        mailing_city: "Philadelphia",
        mailing_state: "PA",
        mailing_zip: "19106",
        annual_request: "no",
      },
    ];

    const csvContent = Papa.unparse(sampleRows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "pa_voter_ballots_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));

        if (missing.length > 0) {
          setMissingHeaders(missing);
          setValidationError(
            `The CSV is missing ${missing.length} required field columns.`,
          );
          return;
        }

        const data = results.data;
        if (data.length === 0) {
          setValidationError(
            "The CSV file does not contain any voter records.",
          );
          return;
        }

        if (data.length > 25) {
          setValidationError(
            `Batch limit exceeded. You uploaded ${data.length} records, but the prototype is limited to a maximum of 25 records to protect memory and client performance.`,
          );
          return;
        }

        setCsvFile(file);
        setRecords(data);
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
        const page = tempDoc.getPages()[0];

        // Standard fonts embedded inside standard PDF specifications
        const font = await tempDoc.embedFont(StandardFonts.Helvetica);
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
              size: 9.5,
              font: font,
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
          // Check "Same as above" box in Section 4 (Coordinates X: 262, Y: 422)
          page.drawText("X", {
            x: 262,
            y: 422,
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

      setStatusText("Assembling, indexing, and finalizing PDF batch...");
      setProgress(95);
      await new Promise((resolve) => setTimeout(resolve, 150));

      const finalPdfBytes = await batchPdf.save();
      const pdfBlob = new Blob([finalPdfBytes as any], {
        type: "application/pdf",
      });
      const downloadUrl = URL.createObjectURL(pdfBlob);
      setGeneratedBlobUrl(downloadUrl);

      // Trigger automatic file download
      const filename =
        singleRecordIndex !== null
          ? `PA_Ballot_Test_Alignment_${recordsToProcess[0].last_name}.pdf`
          : `PA_Ballot_Batch_${recordsToProcess.length}_records_${new Date().toISOString().slice(0, 10)}.pdf`;

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setProgress(100);
      setStatusText("Batch created and downloaded successfully!");
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setValidationError(
        err.message || "An unexpected error occurred while compiling the PDF.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-lg text-white shadow-md">
              <Printer className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                PA Ballot Application Batch Printer
                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                  MVP Prototype
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-fill Pennsylvania Mail-In Ballot Applications securely in
                batches.
              </p>
            </div>
          </div>

          {/* Setup verification indicator */}
          <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-xs">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                pdfTemplateLoaded === true
                  ? "bg-emerald-500 animate-pulse"
                  : pdfTemplateLoaded === false
                    ? "bg-rose-500"
                    : "bg-amber-400"
              }`}
            ></span>
            <span className="font-medium text-slate-700">
              {pdfTemplateLoaded === true
                ? "PA Ballot Template Ready"
                : pdfTemplateLoaded === false
                  ? "Template Missing! (public folder)"
                  : "Verifying Template..."}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PRIVACY WARNING NOTICE (PII Security is absolute High Priority) */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 shadow-sm flex items-start gap-3">
          <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-800 mt-0.5">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900 text-sm">
              Strict Zero-Server Privacy Guard
            </h3>
            <p className="text-emerald-700 text-xs mt-1 leading-relaxed">
              Voter records from CSV spreadsheets are processed{" "}
              <strong>entirely inside your browser's local memory</strong>. No
              files are ever uploaded, saved to databases, or transferred over
              the network. Your Personally Identifiable Information (PII) is
              100% confidential and secure.
            </p>
          </div>
        </div>

        {validationError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl mb-6 shadow-sm flex items-start gap-3">
            <div className="p-1 bg-rose-100 rounded text-rose-800 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-grow">
              <h4 className="font-semibold text-sm">Processing Error</h4>
              <p className="text-xs mt-0.5 leading-relaxed">
                {validationError}
              </p>
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
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="text-rose-400 hover:text-rose-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* WORKSPACE AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDEBAR: CONFIGS & DETAILS */}
          <div className="lg:col-span-1 space-y-6">
            {/* INSTRUCTIONS / ACTIONS */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
                <FileText className="h-4.5 w-4.5 text-blue-600" />
                Workflow Instructions
              </h3>
              <ol className="space-y-3.5 text-xs text-slate-600 list-decimal pl-4.5">
                <li>
                  <button
                    onClick={downloadSampleCSV}
                    className="text-blue-600 hover:underline font-semibold text-left focus:outline-none"
                  >
                    Download the schema template CSV
                  </button>{" "}
                  to construct your database list correctly.
                </li>
                <li>
                  Fill out your voter records (blank cells are permitted;
                  maximum of 25 voters per batch).
                </li>
                <li>Upload the finished CSV spreadsheet.</li>
                <li>
                  Verify your list in the preview grid and run a quick{" "}
                  <strong>Alignment Test</strong> page if needed.
                </li>
                <li>
                  Click <strong>Generate Consolidated Batch</strong> to assemble
                  the unified PDF and download it.
                </li>
              </ol>

              <button
                onClick={downloadSampleCSV}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Sample CSV File
              </button>
            </div>

            {/* X, Y ALIGNMENT TUNER CARD (COLLAPSED BY DEFAULT) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowCoordsEditor(!showCoordsEditor)}
                className="w-full flex justify-between items-center p-5 bg-white border-b border-transparent font-bold text-slate-900 text-sm hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <span className="flex items-center gap-2">
                  <Sliders className="h-4.5 w-4.5 text-blue-600" />
                  X, Y Coordinate Precision Tuner
                </span>
                <Settings
                  className={`h-4.5 w-4.5 text-slate-400 transition-transform ${showCoordsEditor ? "rotate-90 text-blue-500" : ""}`}
                />
              </button>

              {showCoordsEditor && (
                <div className="p-5 border-t border-slate-100 space-y-4 max-h-[480px] overflow-y-auto bg-slate-50/50">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Adjust text alignment coordinates in PDF points. Origin{" "}
                    <span className="font-semibold">(0,0)</span> is at the{" "}
                    <strong>bottom-left</strong> of standard Letter size (612 x
                    792 points). Changes apply immediately to generating sheets.
                  </p>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-bold text-slate-700">
                      Database Fields Coordinate Mapping
                    </span>
                    <button
                      onClick={resetCoordinates}
                      className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw className="h-3 w-3" /> Reset Defaults
                    </button>
                  </div>

                  <div className="space-y-3.5 pt-1">
                    {REQUIRED_HEADERS.map((key) => {
                      const field = coords[key];
                      if (!field) return null;
                      return (
                        <div
                          key={key}
                          className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col gap-2.5"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-800">
                              {field.label}
                            </span>
                            <span className="text-[10px] bg-slate-100 font-mono text-slate-500 px-1.5 py-0.5 rounded">
                              {key}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400">
                                X:
                              </span>
                              <input
                                type="number"
                                value={field.x}
                                onChange={(e) =>
                                  handleCoordinateChange(
                                    key,
                                    "x",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="w-full text-xs p-1.5 border border-slate-200 rounded text-center font-mono font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400">
                                Y:
                              </span>
                              <input
                                type="number"
                                value={field.y}
                                onChange={(e) =>
                                  handleCoordinateChange(
                                    key,
                                    "y",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="w-full text-xs p-1.5 border border-slate-200 rounded text-center font-mono font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
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

          {/* RIGHT SIDEBAR: DASHBOARD & WORKPLACE VIEW */}
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
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="w-full max-w-lg border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-blue-500 hover:bg-slate-50/50 transition-all cursor-pointer flex flex-col items-center group"
                  onClick={() => fileInputRef.current?.click()}
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
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        processCSV(e.target.files[0]);
                      }
                    }}
                  />
                </div>

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
                      className="text-xs text-rose-600 font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DATA PREVIEW & GENERATE PORT */}
            {activeTab === "preview" && csvFile && (
              <div className="space-y-6">
                {/* ACTIONS PANEL */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Batch Ready for Consolidation
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {records.length} voters will be generated as{" "}
                      {records.length} page-ballots inside one consolidated PDF
                      file.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => generatePDF()}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Printer className="h-4 w-4" />
                      Generate Batch PDF ({records.length} Records)
                    </button>
                    <button
                      onClick={clearFile}
                      className="text-xs text-slate-600 font-bold py-2 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-4 rounded-xl transition-all"
                    >
                      Start Over
                    </button>
                  </div>
                </div>

                {/* VISUAL TABLE CARD */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Loaded Voter Directory
                    </h4>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                      Total Voters: {records.length}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                          <th className="p-3 pl-5">Voter Name</th>
                          <th className="p-3">Birthdate</th>
                          <th className="p-3">Primary Residence</th>
                          <th className="p-3">Precinct (Ward)</th>
                          <th className="p-3">Annual?</th>
                          <th className="p-3 pr-5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/85">
                        {records.map((record, index) => {
                          const fullName =
                            `${record.first_name || ""} ${record.middle_name ? record.middle_name + " " : ""}${record.last_name || ""} ${record.suffix || ""}`.trim() ||
                            "Unnamed";
                          const fullAddress =
                            `${record.address || ""} ${record.suite_number ? "#" + record.suite_number + ", " : ""}${record.city || ""}, ${record.state || ""} ${record.zip_code || ""}`.trim();
                          const annualVal = String(
                            record.annual_request || "",
                          ).toLowerCase();
                          const isAnnual = ["true", "yes", "y", "1"].includes(
                            annualVal,
                          );

                          return (
                            <tr
                              key={index}
                              className="hover:bg-slate-50/50 transition-all"
                            >
                              <td className="p-3 pl-5 font-bold text-slate-900">
                                {fullName}
                              </td>
                              <td className="p-3 text-slate-500">
                                {record.birthdate || "N/A"}
                              </td>
                              <td className="p-3 text-slate-600 font-medium truncate max-w-xs">
                                {fullAddress || "N/A"}
                              </td>
                              <td className="p-3 text-slate-500 font-mono text-[10px]">
                                {record.precinct || "N/A"}{" "}
                                {record.ward ? `(W-${record.ward})` : ""}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                    isAnnual
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                      : "bg-slate-50 border-slate-200 text-slate-500"
                                  }`}
                                >
                                  {isAnnual ? "Yes" : "No"}
                                </span>
                              </td>
                              <td className="p-3 pr-5 text-center">
                                <button
                                  onClick={() => generatePDF(index)}
                                  className="text-[11px] text-blue-600 font-bold hover:underline inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded"
                                  title="Print an alignment check sheet for just this single voter"
                                >
                                  <Eye className="h-3.5 w-3.5" /> Test Sheet
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>
            © {new Date().getFullYear()} Pennsylvania Mail-in Ballot Application
            Batch Generator.
          </p>
          <p className="mt-1 font-mono text-[10px] text-slate-400">
            Secure client processing • Fully compiled by Javascript Client
            Engine
          </p>
        </div>
      </footer>

      {/* BATCH PROGRESS MODAL DIALOG */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center">
            {/* Spinning Circular Progress bar */}
            <div className="relative h-24 w-24 mb-4 flex items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  className="stroke-slate-100 fill-transparent stroke-[6]"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  className="stroke-blue-600 fill-transparent stroke-[6] transition-all duration-300"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - progress / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-xl font-black text-slate-900">
                {progress}%
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-base">
              Compiling Voter Ballots
            </h3>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed px-4">
              {statusText}
            </p>

            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-5">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <p className="text-[10px] text-slate-400 mt-4 italic">
              Please leave this window open. Processing in local memory...
            </p>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION POPUP */}
      {isSuccess && generatedBlobUrl && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-100 text-center flex flex-col items-center">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-3.5">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h3 className="font-bold text-slate-900 text-lg">
              Consolidated Batch Compiled!
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Your consolidated multi-page PDF document has been created and
              should have automatically initiated a download on your browser.
            </p>

            <div className="flex flex-col gap-2.5 w-full mt-6">
              <a
                href={generatedBlobUrl}
                download={`PA_Consolidated_Voter_Ballots_Batch_${new Date().toISOString().slice(0, 10)}.pdf`}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md focus:outline-none"
              >
                <Download className="h-4 w-4" />
                Download Batch PDF Again
              </a>
              <button
                onClick={() => setIsSuccess(false)}
                className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 py-2.5 rounded-xl transition-all"
              >
                Return to Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
