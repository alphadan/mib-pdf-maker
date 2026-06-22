import { useState, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  Mail,
  Download,
  Info,
  CheckCircle,
  ChevronRight,
  Sliders,
  RotateCcw,
} from "lucide-react";

interface CountyAddress {
  name: string;
  line1: string;
  line2: string;
  line3: string;
}

const COUNTY_ADDRESSES: Record<string, CountyAddress> = {
  Berks: {
    name: "Berks County Board of Elections",
    line1: "633 Court St 1st Fl",
    line2: "Reading, PA 19601",
    line3: "",
  },
  Chester: {
    name: "Chester County Board of Elections",
    line1: "601 Westtown Rd Ste 105",
    line2: "West Chester, PA 19380",
    line3: "",
  },
  Delaware: {
    name: "Delaware County Board of Elections",
    line1: "Govt Center Bldg",
    line2: "201 W Front St",
    line3: "Media, PA 19063-2728",
  },
  Montgomery: {
    name: "Montgomery County Board of Elections",
    line1: "PO Box 311",
    line2: "Norristown, PA 19404-0311",
    line3: "",
  },
};

// Default coordinates on PADOS_address_page.pdf for the recipient address window
const DEFAULT_ADDRESS_COORDS = {
  x: 310,
  y: 348,
  fontSize: 12,
  lineSpacing: 22,
};

interface AddressPrinterProps {
  mediumFontBytes: ArrayBuffer | null;
}

export default function AddressPrinter({
  mediumFontBytes,
}: AddressPrinterProps) {
  // Load county preference from localStorage if available
  const [selectedCounty, setSelectedCounty] = useState<string>(() => {
    return localStorage.getItem("mib-selected-county") || "";
  });

  const [coords, setCoords] = useState(() => {
    const saved = localStorage.getItem("mib-address-coords");
    return saved ? JSON.parse(saved) : DEFAULT_ADDRESS_COORDS;
  });

  const [showTuner, setShowTuner] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Save county to localStorage on change
  useEffect(() => {
    if (selectedCounty) {
      localStorage.setItem("mib-selected-county", selectedCounty);
    } else {
      localStorage.removeItem("mib-selected-county");
    }
  }, [selectedCounty]);

  // Save coords to localStorage on change
  useEffect(() => {
    localStorage.setItem("mib-address-coords", JSON.stringify(coords));
  }, [coords]);

  const handleNudge = (
    axis: "x" | "y" | "fontSize" | "lineSpacing",
    val: number,
  ) => {
    setCoords((prev: any) => ({
      ...prev,
      [axis]: Math.max(0, val),
    }));
  };

  const handleReset = () => {
    setCoords(DEFAULT_ADDRESS_COORDS);
  };

  const generateAddressPDF = async () => {
    if (!selectedCounty) {
      alert("Please select a county Board of Elections first.");
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Fetch template
      const response = await fetch("/PADOS_address_page.pdf");
      if (!response.ok)
        throw new Error(
          "Could not find the PADOS_address_page.pdf template in the public folder.",
        );
      const templateBytes = await response.arrayBuffer();

      // 2. Load PDF
      const pdfDoc = await PDFDocument.load(templateBytes);
      pdfDoc.registerFontkit(fontkit);
      const page = pdfDoc.getPages()[0];

      // 3. Fonts and Colors
      const fontMedium = mediumFontBytes
        ? await pdfDoc.embedFont(mediumFontBytes)
        : await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const penColor = rgb(0, 0, 0); // Solid black ink for postal routing systems

      const countyData = COUNTY_ADDRESSES[selectedCounty];

      // Assemble lines of text (only non-empty strings)
      const lines = [
        countyData.name,
        countyData.line1,
        countyData.line2,
        countyData.line3,
      ].filter((line) => line && line.trim() !== "");

      // 4. Overlay address lines
      lines.forEach((lineText, index) => {
        page.drawText(lineText.trim(), {
          x: coords.x,
          // PDF coordinates start at bottom-left, so we subtract vertical spacing for each new line
          y: coords.y - index * coords.lineSpacing,
          size: coords.fontSize,
          font: fontMedium,
          color: penColor,
        });
      });

      // 5. Generate and trigger download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `county_address_page_${selectedCounty.toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`Failed to overlay address PDF: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const activeAddress = COUNTY_ADDRESSES[selectedCounty];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Informative Header / Guide */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-xl text-blue-800">
          <Info className="h-6 w-6" />
        </div>
        <div className="space-y-1.5 flex-grow">
          <h3 className="font-bold text-blue-950 text-base">
            Mailing Workflow Quick-Tip
          </h3>
          <p className="text-blue-800 text-xs leading-relaxed">
            You only need to print <strong>one copy</strong> of this address
            page for your entire batch. Fold it and place it face-out inside
            your envelope window, or paste it as the mailing cover label. All
            voter applications in your batch will mail together to this official
            county address.
          </p>
        </div>
      </div>

      {/* Main Selector & Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* County Select Column */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-1">
                Select Registration County
              </h4>
              <p className="text-slate-500 text-[11px]">
                Choose the county where your batch of voters is registered.
              </p>
            </div>

            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            >
              <option value="">Choose County...</option>
              <option value="Berks">Berks County</option>
              <option value="Chester">Chester County</option>
              <option value="Delaware">Delaware County</option>
              <option value="Montgomery">Montgomery County</option>
            </select>
          </div>

          {selectedCounty && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <button
                onClick={generateAddressPDF}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isGenerating
                  ? "Pre-filling PDF..."
                  : "Generate & Download Self-Mailer Page"}
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Address Card Preview Column */}
        <div className="bg-slate-100/50 rounded-2xl border border-slate-200 border-dashed p-6 flex flex-col justify-center items-center text-center min-h-[220px]">
          {selectedCounty ? (
            <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-left space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 w-fit px-2 py-1 rounded-full border border-emerald-100">
                <CheckCircle className="h-3 w-3" />
                <span>Selected Recipient</span>
              </div>

              <div className="space-y-1.5 pl-1.5 font-mono text-[13px] text-slate-800 leading-normal">
                <p className="font-bold text-slate-900">{activeAddress.name}</p>
                <p>{activeAddress.line1}</p>
                <p>{activeAddress.line2}</p>
                {activeAddress.line3 && <p>{activeAddress.line3}</p>}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-slate-400 text-[10px]">
                <ChevronRight className="h-3 w-3 text-blue-500" />
                <span>Standard window envelope placement</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              <div className="p-4 bg-slate-200/50 text-slate-400 rounded-full w-fit mx-auto">
                <Mail className="h-7 w-7" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-xs">
                  No County Selected
                </h5>
                <p className="text-slate-400 text-[10px] mt-0.5">
                  Choose a county to see the pre-filled official mailing
                  address.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Coordinate Tuner */}
      {selectedCounty && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setShowTuner(!showTuner)}
            className="w-full flex justify-between items-center p-5 bg-white font-bold text-slate-900 text-xs hover:bg-slate-50 transition-colors focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Sliders className="h-4.5 w-4.5 text-blue-600" />
              Tweak Envelope Window Alignment Coordinates (Advanced)
            </span>
            <span className="text-xs text-blue-600">
              {showTuner ? "Hide Adjustments" : "Show Adjustments"}
            </span>
          </button>

          {showTuner && (
            <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-4 animate-slideDown">
              <p className="text-[10px] text-slate-500">
                Adjust coordinates to ensure the mailing address fits perfectly
                inside standard physical window envelopes. Or change line sizes.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    X Coordinate (Horizontal)
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="number"
                      value={coords.x}
                      onChange={(e) =>
                        handleNudge("x", parseInt(e.target.value) || 0)
                      }
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Y Coordinate (Vertical)
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="number"
                      value={coords.y}
                      onChange={(e) =>
                        handleNudge("y", parseInt(e.target.value) || 0)
                      }
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Font Size (pt)
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="number"
                      value={coords.fontSize}
                      onChange={(e) =>
                        handleNudge("fontSize", parseInt(e.target.value) || 0)
                      }
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Line Spacing (pt)
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="number"
                      value={coords.lineSpacing}
                      onChange={(e) =>
                        handleNudge(
                          "lineSpacing",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 py-1.5 px-3 text-[10px] text-rose-600 font-bold border border-rose-200 rounded-lg bg-white hover:bg-rose-50 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset to Factory Settings
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
