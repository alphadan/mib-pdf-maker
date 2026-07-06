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
  Adams: {
    name: "Adams County Voter Registration",
    line1: "117 Baltimore St, Rm 106",
    line2: "Gettysburg, PA 17325",
    line3: "",
  },
  Allegheny: {
    name: "Allegheny County Voter Registration",
    line1: "542 Forbes Ave, Ste 312",
    line2: "Pittsburgh, PA 15219",
    line3: "",
  },
  Armstrong: {
    name: "Armstrong County Voter Registration",
    line1: "Administration Bldg, 450 E Market St",
    line2: "Kittanning, PA 16201",
    line3: "",
  },
  Beaver: {
    name: "Beaver County Voter Registration",
    line1: "810 Third St",
    line2: "Beaver, PA 15009",
    line3: "",
  },
  Bedford: {
    name: "Bedford County Voter Registration",
    line1: "200 S Juliana St, 3rd Fl",
    line2: "Bedford, PA 15522",
    line3: "",
  },
  Berks: {
    name: "Berks County Voter Registration",
    line1: "633 Court St, 1st Fl",
    line2: "Reading, PA 19601",
    line3: "",
  },
  Blair: {
    name: "Blair County Voter Registration",
    line1: "423 Allegheny St",
    line2: "Hollidaysburg, PA 16648",
    line3: "",
  },
  Bradford: {
    name: "Bradford County Voter Registration",
    line1: "6 Court St, Ste 2",
    line2: "Towanda, PA 18848",
    line3: "",
  },
  Bucks: {
    name: "Bucks County Voter Registration",
    line1: "55 E Court St",
    line2: "Doylestown, PA 18901",
    line3: "",
  },
  Butler: {
    name: "Butler County Voter Registration",
    line1: "PO Box 1208, 227 West Cunningham St",
    line2: "Butler, PA 16003",
    line3: "",
  },
  Cambria: {
    name: "Cambria County Voter Registration",
    line1: "200 S Center St",
    line2: "Ebensburg, PA 15931",
    line3: "",
  },
  Cameron: {
    name: "Cameron County Voter Registration",
    line1: "20 E Fifth St",
    line2: "Emporium, PA 15834",
    line3: "",
  },
  Carbon: {
    name: "Carbon County Voter Registration",
    line1: "44 Susquehanna St, PO Box 170",
    line2: "Jim Thorpe, PA 18229",
    line3: "",
  },
  Centre: {
    name: "Centre County Voter Registration",
    line1: "420 Holmes St, Willowbank Office Bldg",
    line2: "Bellefonte, PA 16823",
    line3: "",
  },
  Chester: {
    name: "Chester County Voter Registration",
    line1: "601 Westtown Rd, Ste 150",
    line2: "West Chester, PA 19380",
    line3: "",
  },
  Clarion: {
    name: "Clarion County Voter Registration",
    line1: "Administrative Bldg, Rm 104",
    line2: "Clarion, PA 16214",
    line3: "",
  },
  Clearfield: {
    name: "Clearfield County Voter Registration",
    line1: "212 E Locust St, Ste 106",
    line2: "Clearfield, PA 16830",
    line3: "",
  },
  Clinton: {
    name: "Clinton County Voter Registration",
    line1: "2 Piper Way, Ste 309",
    line2: "Lock Haven, PA 17745",
    line3: "",
  },
  Columbia: {
    name: "Columbia County Voter Registration",
    line1: "Columbia Cnty Courthouse, 11 W Main St",
    line2: "Bloomsburg, PA 17815",
    line3: "",
  },
  Crawford: {
    name: "Crawford County Voter Registration",
    line1: "903 Diamond Park",
    line2: "Meadville, PA 16335",
    line3: "",
  },
  Cumberland: {
    name: "Cumberland County Voter Registration",
    line1: "1601 Ritner Highway, Ste 201",
    line2: "Carlisle, PA 17013",
    line3: "",
  },
  Dauphin: {
    name: "Dauphin County Voter Registration",
    line1: "2 S Second St, 5th Fl",
    line2: "Harrisburg, PA 17101",
    line3: "",
  },
  Delaware: {
    name: "Delaware County Voter Registration",
    line1: "Govt Center Bldg, 201 W Front St",
    line2: "Media, PA 19063",
    line3: "",
  },
  Elk: {
    name: "Elk County Voter Registration",
    line1: "300 Center St",
    line2: "Ridgway, PA 15853",
    line3: "",
  },
  Erie: {
    name: "Erie County Voter Registration",
    line1: "140 W 6th St",
    line2: "Erie, PA 16501",
    line3: "",
  },
  Fayette: {
    name: "Fayette County Voter Registration",
    line1: "2 W Main St",
    line2: "Uniontown, PA 15401",
    line3: "",
  },
  Forest: {
    name: "Forest County Voter Registration",
    line1: "526 Elm St",
    line2: "Tionesta, PA 16353",
    line3: "",
  },
  Franklin: {
    name: "Franklin County Voter Registration",
    line1: "272 N Second St",
    line2: "Chambersburg, PA 17201",
    line3: "",
  },
  Fulton: {
    name: "Fulton County Voter Registration",
    line1: "116 W Market St, Ste 203",
    line2: "McConnellsburg, PA 17233",
    line3: "",
  },
  Greene: {
    name: "Greene County Voter Registration",
    line1: "93 E High St",
    line2: "Waynesburg, PA 15370",
    line3: "",
  },
  Huntingdon: {
    name: "Huntingdon County Voter Registration",
    line1: "Bailey Bldg, 233 Penn St",
    line2: "Huntingdon, PA 16652",
    line3: "",
  },
  Indiana: {
    name: "Indiana County Voter Registration",
    line1: "825 Philadelphia St",
    line2: "Indiana, PA 15701",
    line3: "",
  },
  Jefferson: {
    name: "Jefferson County Voter Registration",
    line1: "155 Main St",
    line2: "Brookville, PA 15825",
    line3: "",
  },
  Juniata: {
    name: "Juniata County Voter Registration",
    line1: "1 N Main St",
    line2: "Mifflintown, PA 17059",
    line3: "",
  },
  Lackawanna: {
    name: "Lackawanna County Voter Registration",
    line1: "123 Wyoming Ave",
    line2: "Scranton, PA 18503",
    line3: "",
  },
  Lancaster: {
    name: "Lancaster County Voter Registration",
    line1: "PO Box 2139, 150 N Queen St",
    line2: "Lancaster, PA 17608",
    line3: "",
  },
  Lawrence: {
    name: "Lawrence County Voter Registration",
    line1: "430 Court St",
    line2: "New Castle, PA 16101",
    line3: "",
  },
  Lebanon: {
    name: "Lebanon County Voter Registration",
    line1: "400 S 8th St",
    line2: "Lebanon, PA 17042",
    line3: "",
  },
  Lehigh: {
    name: "Lehigh County Voter Registration",
    line1: "17 S Seventh St",
    line2: "Allentown, PA 18101",
    line3: "",
  },
  Luzerne: {
    name: "Luzerne County Voter Registration",
    line1: "20 N Pennsylvania Ave",
    line2: "Wilkes-Barre, PA 18711",
    line3: "",
  },
  Lycoming: {
    name: "Lycoming County Voter Registration",
    line1: "48 W Third St",
    line2: "Williamsport, PA 17701",
    line3: "",
  },
  McKean: {
    name: "McKean County Voter Registration",
    line1: "500 W Main St",
    line2: "Smethport, PA 16749",
    line3: "",
  },
  Mercer: {
    name: "Mercer County Voter Registration",
    line1: "130 North Pitt Street",
    line2: "Mercer, PA 16137",
    line3: "",
  },
  Mifflin: {
    name: "Mifflin County Voter Registration",
    line1: "20 N Wayne St",
    line2: "Lewistown, PA 17044",
    line3: "",
  },
  Monroe: {
    name: "Monroe County Voter Registration",
    line1: "One Quaker Plaza",
    line2: "Stroudsburg, PA 18360",
    line3: "",
  },
  Montgomery: {
    name: "Montgomery County Voter Registration",
    line1: "PO Box 311",
    line2: "Norristown, PA 19404",
    line3: "",
  },
  Montour: {
    name: "Montour County Voter Registration",
    line1: "435 East Front St",
    line2: "Danville, PA 17821",
    line3: "",
  },
  Northampton: {
    name: "Northampton County Voter Registration",
    line1: "670 Wolf Ave",
    line2: "Easton, PA 18042",
    line3: "",
  },
  Northumberland: {
    name: "Northumberland County Voter Registration",
    line1: "320 N 2nd St",
    line2: "Sunbury, PA 17801",
    line3: "",
  },
  Perry: {
    name: "Perry County Voter Registration",
    line1: "PO Box 37",
    line2: "New Bloomfield, PA 17068",
    line3: "",
  },
  Philadelphia: {
    name: "Philadelphia County Voter Registration",
    line1: "1423 Spring Garden St",
    line2: "Philadelphia, PA 19130",
    line3: "",
  },
  Pike: {
    name: "Pike County Voter Registration",
    line1: "506 Broad St",
    line2: "Milford, PA 18337",
    line3: "",
  },
  Potter: {
    name: "Potter County Voter Registration",
    line1: "1 N Main St",
    line2: "Coudersport, PA 16915",
    line3: "",
  },
  Schuylkill: {
    name: "Schuylkill County Voter Registration",
    line1: "420 N Centre St",
    line2: "Pottsville, PA 17901",
    line3: "",
  },
  Snyder: {
    name: "Snyder County Voter Registration",
    line1: "PO Box 217",
    line2: "Middleburg, PA 17842",
    line3: "",
  },
  Somerset: {
    name: "Somerset County Voter Registration",
    line1: "300 N Center Ave",
    line2: "Somerset, PA 15501",
    line3: "",
  },
  Sullivan: {
    name: "Sullivan County Voter Registration",
    line1: "245 Muncy St, PO Box 157",
    line2: "Laporte, PA 18626",
    line3: "",
  },
  Susquehanna: {
    name: "Susquehanna County Voter Registration",
    line1: "PO Box 218, 105 Maple St",
    line2: "Montrose, PA 18801",
    line3: "",
  },
  Tioga: {
    name: "Tioga County Voter Registration",
    line1: "118 Main St",
    line2: "Wellsboro, PA 16901",
    line3: "",
  },
  Union: {
    name: "Union County Voter Registration",
    line1: "155 N 15th St",
    line2: "Lewisburg, PA 17837",
    line3: "",
  },
  Venango: {
    name: "Venango County Voter Registration",
    line1: "1174 Elk St",
    line2: "Franklin, PA 16323",
    line3: "",
  },
  Warren: {
    name: "Warren County Voter Registration",
    line1: "204 Fourth Ave",
    line2: "Warren, PA 16365",
    line3: "",
  },
  Washington: {
    name: "Washington County Voter Registration",
    line1: "95 W Beau St",
    line2: "Washington, PA 15301",
    line3: "",
  },
  Wayne: {
    name: "Wayne County Voter Registration",
    line1: "925 Court St",
    line2: "Honesville, PA 18431",
    line3: "",
  },
  Westmoreland: {
    name: "Westmoreland County Voter Registration",
    line1: "2 N Main St, Ste 109",
    line2: "Greensburg, PA 15601",
    line3: "",
  },
  Wyoming: {
    name: "Wyoming County Voter Registration",
    line1: "1 Wyoming Ave",
    line2: "Tunkhannock, PA 18657",
    line3: "",
  },
  York: {
    name: "York County Voter Registration",
    line1: "2401 Pleasant Valley Rd",
    line2: "York, PA 17402",
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
              {Object.keys(COUNTY_ADDRESSES)
                .sort()
                .map((countyName) => (
                  <option key={countyName} value={countyName}>
                    {countyName} County
                  </option>
                ))}
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
