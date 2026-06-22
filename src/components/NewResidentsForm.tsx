import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  Download,
  User,
  Home,
  MapPin,
  Mail,
  Sparkles,
  Phone,
  Shield,
  Settings,
  RotateCcw,
} from "lucide-react";

interface FieldCoord {
  name: string;
  label: string;
  x: number;
  y: number;
  type: "text" | "checkbox";
}

const DEFAULT_COORDS_REGISTER: Record<string, FieldCoord> = {
  last_name: {
    name: "last_name",
    label: "Last Name",
    x: 248,
    y: 698,
    type: "text",
  },
  suffix: {
    name: "suffix",
    label: "Suffix (Jr, Sr, etc.)",
    x: 425,
    y: 698,
    type: "text",
  },
  first_name: {
    name: "first_name",
    label: "First Name",
    x: 248,
    y: 676,
    type: "text",
  },
  middle_name: {
    name: "middle_name",
    label: "Middle Name / Initial",
    x: 504,
    y: 676,
    type: "text",
  },
  birthdate: {
    name: "birthdate",
    label: "Birthdate (MM/DD/YYYY)",
    x: 272,
    y: 568,
    type: "text",
  },
  phone: {
    name: "phone",
    label: "Phone (Optional)",
    x: 230,
    y: 550,
    type: "text",
  },
  email: {
    name: "email",
    label: "Email (Optional)",
    x: 400,
    y: 550,
    type: "text",
  },
  address: {
    name: "address",
    label: "Address (not P.O. Box)",
    x: 280,
    y: 504,
    type: "text",
  },
  suite_number: {
    name: "suite_number",
    label: "Apt/Suite Number",
    x: 544,
    y: 504,
    type: "text",
  },
  city: { name: "city", label: "City/Town", x: 242, y: 486, type: "text" },
  state: { name: "state", label: "State", x: 390, y: 486, type: "text" },
  zip_code: {
    name: "zip_code",
    label: "ZIP Code",
    x: 432,
    y: 486,
    type: "text",
  },
  county: { name: "county", label: "County", x: 524, y: 486, type: "text" },
  municipality: {
    name: "municipality",
    label: "Municipality",
    x: 244,
    y: 466,
    type: "text",
  },
  precinct: {
    name: "precinct",
    label: "Voting District / Precinct",
    x: 280,
    y: 446,
    type: "text",
  },
  ward: { name: "ward", label: "Ward", x: 390, y: 436, type: "text" },
  mailing_address: {
    name: "mailing_address",
    label: "Mailing Address",
    x: 356,
    y: 422,
    type: "text",
  },
  mailing_city: {
    name: "mailing_city",
    label: "Mailing City",
    x: 234,
    y: 402,
    type: "text",
  },
  mailing_state: {
    name: "mailing_state",
    label: "Mailing State",
    x: 480,
    y: 402,
    type: "text",
  },
  mailing_zip: {
    name: "mailing_zip",
    label: "Mailing ZIP",
    x: 528,
    y: 402,
    type: "text",
  },
  annual_request: {
    name: "annual_request",
    label: "Annual Request Checkbox",
    x: 189,
    y: 206,
    type: "checkbox",
  },
};

interface NewResidentsFormProps {
  mediumFontBytes: ArrayBuffer | null;
}

export default function NewResidentsForm({
  mediumFontBytes,
}: NewResidentsFormProps) {
  const [coords, setCoords] = useState<Record<string, FieldCoord>>(() => {
    const saved = localStorage.getItem("mib-registration-coords");
    return saved ? JSON.parse(saved) : DEFAULT_COORDS_REGISTER;
  });

  const [showCoordsEditor, setShowCoordsEditor] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    birthdate: "",
    phone: "",
    email: "",
    address: "",
    suite_number: "",
    city: "",
    state: "PA",
    zip_code: "",
    municipality: "",
    county: "",
    precinct: "",
    ward: "",
    mailing_address: "",
    mailing_city: "",
    mailing_state: "PA",
    mailing_zip: "",
    annual_request: false,
  });

  const [useSameMailing, setUseSameMailing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleCoordinateChange = (
    fieldName: string,
    axis: "x" | "y",
    val: number,
  ) => {
    setCoords((prev) => {
      const updated = {
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          [axis]: Math.max(0, val),
        },
      };
      localStorage.setItem("mib-registration-coords", JSON.stringify(updated));
      return updated;
    });
  };

  const resetCoordinates = () => {
    setCoords(DEFAULT_COORDS_REGISTER);
    localStorage.removeItem("mib-registration-coords");
  };

  const generateSinglePDF = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // 1. Fetch template
      const response = await fetch("/PADOS_Registration_Application.pdf");
      if (!response.ok)
        throw new Error("Could not find the voter registration PDF template.");
      const templateBytes = await response.arrayBuffer();

      // 2. Load PDF
      const pdfDoc = await PDFDocument.load(templateBytes);
      pdfDoc.registerFontkit(fontkit);
      const page = pdfDoc.getPages()[0];

      // 3. Setup Fonts
      const fontMedium = mediumFontBytes
        ? await pdfDoc.embedFont(mediumFontBytes)
        : await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const bluePenColor = rgb(0.08, 0.22, 0.58);

      // 4. Fill text fields
      Object.keys(coords).forEach((key) => {
        const field = coords[key];
        let val = formData[key as keyof typeof formData];

        // Skip mailing address overrides if "same as above" is selected
        if (useSameMailing && key.startsWith("mailing_")) {
          return;
        }

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

      // 5. Section 4 Checkbox (Same as above)
      if (useSameMailing) {
        page.drawText("X", {
          x: 262,
          y: 428,
          size: 11,
          font: fontBold,
          color: bluePenColor,
        });
      }

      // 6. Section 7 Checkbox (Annual request)
      if (formData.annual_request) {
        const annualField = coords.annual_request;
        page.drawText("X", {
          x: annualField.x,
          y: annualField.y,
          size: 11.5,
          font: fontBold,
          color: bluePenColor,
        });
      }

      // Save and trigger download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Programmatic trigger
      const link = document.createElement("a");
      link.href = url;
      link.download = `ballot_application_${formData.first_name || "voter"}_${formData.last_name || "record"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`Error generating PDF: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={generateSinglePDF} className="space-y-6">
        {/* Intro */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5 mb-2">
            <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
            New Movers Pre-Filler
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Fill in manual registrations on the spot. On completion, download a
            fully pre-filled single-voter registration form ready to print and
            sign.
          </p>
        </div>

        {/* SECTION 1: Personal Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="h-4.5 w-4.5 text-blue-600" />
            Section 1: Applicant Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                First Name
              </label>
              <input
                required
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Middle Name / Initial
              </label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Suffix (Jr, Sr, etc.)
              </label>
              <input
                type="text"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Last Name
              </label>
              <input
                required
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Birthdate (MM/DD/YYYY)
              </label>
              <input
                required
                placeholder="MM/DD/YYYY"
                type="text"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" />
                Phone (Optional)
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Mail className="h-3 w-3 text-slate-400" />
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* SECTION 2: Voting Address */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Home className="h-4.5 w-4.5 text-blue-600" />
            Section 2: Registered Voting Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Street Address (Not P.O. Box)
              </label>
              <input
                required
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Apt / Suite
              </label>
              <input
                type="text"
                name="suite_number"
                value={formData.suite_number}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                City
              </label>
              <input
                required
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                State
              </label>
              <input
                required
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ZIP Code
              </label>
              <input
                required
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Municipality (City, Boro, or Twp)
              </label>
              <input
                required
                type="text"
                name="municipality"
                value={formData.municipality}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                County
              </label>
              <select
                required
                name="county"
                value={formData.county}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select County...</option>
                <option value="Berks">Berks</option>
                <option value="Chester">Chester</option>
                <option value="Delaware">Delaware</option>
                <option value="Montgomery">Montgomery</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Voting District / Precinct (Optional)
              </label>
              <input
                type="text"
                name="precinct"
                value={formData.precinct}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ward (Optional)
              </label>
              <input
                type="text"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Mailing Address */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-blue-600" />
              Section 3: Mailing Address
            </h3>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useSameMailing}
                onChange={(e) => setUseSameMailing(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              Same as Registered Address
            </label>
          </div>

          {!useSameMailing && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alternative Mailing Address (or P.O. Box)
                </label>
                <input
                  required={!useSameMailing}
                  type="text"
                  name="mailing_address"
                  value={formData.mailing_address}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    City
                  </label>
                  <input
                    required={!useSameMailing}
                    type="text"
                    name="mailing_city"
                    value={formData.mailing_city}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    State
                  </label>
                  <input
                    required={!useSameMailing}
                    type="text"
                    name="mailing_state"
                    value={formData.mailing_state}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ZIP Code
                  </label>
                  <input
                    required={!useSameMailing}
                    type="text"
                    name="mailing_zip"
                    value={formData.mailing_zip}
                    onChange={handleChange}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Annual Option */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-3.5">
          <input
            id="annual_request"
            type="checkbox"
            name="annual_request"
            checked={formData.annual_request}
            onChange={handleChange}
            className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 h-5 w-5 mt-0.5 cursor-pointer"
          />
          <label
            htmlFor="annual_request"
            className="cursor-pointer select-none"
          >
            <h4 className="text-slate-900 font-bold text-sm">
              Yes, I want to receive mail-in ballots annually
            </h4>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
              Checking this box completes Section 7, registering the resident to
              automatically receive a ballot application for all elections this
              calendar year.
            </p>
          </label>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl px-4 py-2.5 text-xs font-medium max-w-md">
            <Shield className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
            <span>
              Secure Zero-Server processing. This data never leaves your browser
              window.
            </span>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all shadow-md focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
          >
            {isGenerating
              ? "Generating Registration..."
              : "Generate & Download PDF"}
            <Download className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* ADVANCED COORDINATES TUNER FOR REGISTRATION TEMPLATE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-8">
        <button
          onClick={() => setShowCoordsEditor(!showCoordsEditor)}
          className="w-full flex justify-between items-center p-5 bg-white border-b border-transparent font-bold text-slate-900 text-xs hover:bg-slate-50 transition-colors focus:outline-none"
        >
          <span className="flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-blue-600" />
            Fine-tune Registration Alignment Coordinates (Advanced)
          </span>
          <span className="text-xs text-blue-600">
            {showCoordsEditor ? "Hide Tuning Panel" : "Open Tuning Panel"}
          </span>
        </button>

        {showCoordsEditor && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Adjust coordinates to match the fields of the{" "}
              <strong>PADOS_Registration_Application.pdf</strong>. Origin{" "}
              <span className="font-semibold">(0,0)</span> is at the bottom-left
              of Letter size (612 x 792 points). Changes are saved automatically
              to your device.
            </p>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] font-bold text-slate-700">
                Registration Fields Coordinate Mapping
              </span>
              <button
                onClick={resetCoordinates}
                className="text-[10px] text-rose-600 font-bold flex items-center gap-1 hover:underline border border-rose-200 bg-white px-2 py-1.5 rounded-lg"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
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
  );
}
