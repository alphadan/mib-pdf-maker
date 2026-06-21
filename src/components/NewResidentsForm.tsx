import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  Download,
  User,
  Home,
  MapPin,
  Mail,
  Sparkles,
  Phone,
  Shield,
} from "lucide-react";

interface FieldCoord {
  name: string;
  label: string;
  x: number;
  y: number;
  type: "text" | "checkbox";
}

interface NewResidentsFormProps {
  coords: Record<string, FieldCoord>;
  mediumFontBytes: ArrayBuffer | null;
}

export default function NewResidentsForm({
  coords,
  mediumFontBytes,
}: NewResidentsFormProps) {
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
            New Resident Individual Pre-Filler
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Fill in individual registrations manually. On completion, download a
            fully pre-filled single-voter Ballot Application ready to print and
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
              ? "Generating Ballot Application..."
              : "Generate & Download PDF"}
            <Download className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
