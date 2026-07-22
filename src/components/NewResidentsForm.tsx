import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  Download,
  User,
  Home,
  MapPin,
  Mail,
  Shield,
  Phone,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Flag,
} from "lucide-react";

interface FieldCoord {
  name: string;
  label: string;
  x: number;
  y: number;
  type: "text" | "checkbox";
  pageIndex?: number;
}

interface NewResidentsFormProps {
  mediumFontBytes: ArrayBuffer | null;
  applicationReason: string;
  coords: Record<string, FieldCoord>;
  handleCoordinateChange: (
    fieldName: string,
    axis: "x" | "y",
    val: number,
  ) => void;
  resetCoordinates: () => void;
}

export default function NewResidentsForm({
  mediumFontBytes,
  applicationReason,
  coords,
}: NewResidentsFormProps) {
  const isMailIn = applicationReason === "mail-in-voting";

  const [formData, setFormData] = useState({
    // Standard Info
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
    county: "Chester",
    precinct: "",
    ward: "",
    mailing_address: "",
    mailing_city: "",
    mailing_state: "PA",
    mailing_zip: "",
    annual_request: false,

    // Newly Researched State Portal Fields
    is_citizen: "", // "yes" | "no" | ""
    is_at_least_18: "", // "yes" | "no" | ""
    gender: "", // "F" | "M" | "X" | ""
    race: "", // Official race selections
    id_type: "", // "dl" | "ssn" | "none" | ""
    id_dl_number: "",
    id_ssn_last4: "",
    unit_type: "", // Apartment, Student Mailing Center, etc.
    party_choice: "", // Democratic, Republican, etc.
    party_choice_other: "",
    requires_assistance: "", // "yes" | "no" | ""
    assistance_reason: "", // Help description

    // Section 8 previous registration details
    prev_name: "",
    prev_address: "",
    prev_city: "",
    prev_state: "",
    prev_zip: "",
    prev_county: "",
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
      // 1. Swap template files based on intent
      const templatePath = isMailIn
        ? "/PADOS_MailInApplication.pdf"
        : "/PADOS_Registration_Application.pdf";

      const response = await fetch(templatePath);
      if (!response.ok)
        throw new Error(
          `Could not find the ${isMailIn ? "Mail-In" : "Registration"} PDF template.`,
        );
      const templateBytes = await response.arrayBuffer();

      // 2. Load PDF
      const pdfDoc = await PDFDocument.load(templateBytes);
      pdfDoc.registerFontkit(fontkit);

      // 3. Setup Fonts
      const fontMedium = mediumFontBytes
        ? await pdfDoc.embedFont(mediumFontBytes)
        : await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const bluePenColor = rgb(0.08, 0.22, 0.58);

      // 4. Fill text fields on their respective page indices
      Object.keys(coords).forEach((key) => {
        // Skip drawing the state on the PDF, as 'PA' is already prefilled/printed
        if (key === "state") return;

        // Skip qualifications, gender, party choice, and requires_assistance (handled customly)
        if (
          key === "is_citizen" ||
          key === "is_at_least_18" ||
          key === "gender" ||
          key === "party_choice" ||
          key === "requires_assistance"
        ) {
          return;
        }

        const field = coords[key];
        let val = formData[key as keyof typeof formData];

        // Concatenate previous address fields for single consolidated line on Section 9
        if (key === "prev_full_address") {
          const parts = [
            formData.prev_address,
            formData.prev_city,
            formData.prev_state,
            formData.prev_zip,
            formData.prev_county ? formData.prev_county + " County" : "",
          ].filter((p) => p && String(p).trim() !== "");
          val = parts.join(", ");
        }

        // Skip mailing address overrides if "same as above" is selected
        if (useSameMailing && key.startsWith("mailing_")) {
          return;
        }

        // Limit assistance_reason to 25 characters and skip if requires_assistance is not yes
        if (key === "assistance_reason") {
          const assistVal = String(formData.requires_assistance || "")
            .trim()
            .toLowerCase();
          if (assistVal !== "yes") return;
          val = String(val).substring(0, 25);
        }

        // Fetch target page dynamically (support multi-page PDFs)
        const targetPageIndex = field.pageIndex ?? 0;
        const targetPage =
          pdfDoc.getPages()[targetPageIndex] || pdfDoc.getPages()[0];

        if (field.type === "text" && val && String(val).trim() !== "") {
          targetPage.drawText(String(val).trim(), {
            x: field.x,
            y: field.y,
            size: 11,
            font: fontMedium,
            color: bluePenColor,
          });
        }
      });

      // Fetch the first page for main checkboxes
      const firstPage = pdfDoc.getPages()[0];

      // 5. Section 4 Checkbox (Same as above)
      if (useSameMailing) {
        // Determine the "Same as above" coordinates
        const sameAsAboveX = isMailIn ? 190 : 189;
        const sameAsAboveY = isMailIn ? 468 : 423;
        firstPage.drawText("X", {
          x: sameAsAboveX,
          y: sameAsAboveY,
          size: 11,
          font: fontBold,
          color: bluePenColor,
        });
      }

      // 6. Section 7 Checkbox (Annual request) - Only if Mail-In form
      if (isMailIn && formData.annual_request) {
        const annualField = coords.annual_request;
        firstPage.drawText("X", {
          x: annualField.x,
          y: annualField.y,
          size: 11.5,
          font: fontBold,
          color: bluePenColor,
        });
      }

      // 7. Specialized Suffix Checkbox Logic
      const suffixVal = String(formData.suffix || "")
        .trim()
        .toUpperCase()
        .replace(/\./g, ""); // Clean "JR." to "JR"
      if (suffixVal === "JR") {
        const field = coords.suffix_jr || { x: 414, y: 706 };
        firstPage.drawCircle({
          x: field.x,
          y: field.y,
          size: 7,
          borderColor: bluePenColor,
          borderWidth: 1.5,
        });
      } else if (suffixVal === "SR") {
        const field = coords.suffix_sr || { x: 432, y: 706 };
        firstPage.drawCircle({
          x: field.x,
          y: field.y,
          size: 7,
          borderColor: bluePenColor,
          borderWidth: 1.5,
        });
      } else if (suffixVal === "III") {
        const field = coords.suffix_iii || { x: 462, y: 706 };
        firstPage.drawCircle({
          x: field.x,
          y: field.y,
          size: 7,
          borderColor: bluePenColor,
          borderWidth: 1.5,
        });
      } else if (suffixVal === "IV") {
        const field = coords.suffix_iv || { x: 480, y: 706 };
        firstPage.drawCircle({
          x: field.x,
          y: field.y,
          size: 7,
          borderColor: bluePenColor,
          borderWidth: 1.5,
        });
      }

      // 8. Eligibility Checkboxes (Section 2 - Registration Only)
      if (!isMailIn) {
        if (formData.is_citizen === "yes") {
          const field = coords.is_citizen_yes || { x: 304, y: 652 };
          firstPage.drawText("X", {
            x: field.x,
            y: field.y,
            size: 11,
            font: fontBold,
            color: bluePenColor,
          });
        } else if (formData.is_citizen === "no") {
          const field = coords.is_citizen_no || { x: 340, y: 652 };
          firstPage.drawText("X", {
            x: field.x,
            y: field.y,
            size: 11,
            font: fontBold,
            color: bluePenColor,
          });
        }

        if (formData.is_at_least_18 === "yes") {
          const field = coords.is_at_least_18_yes || { x: 304, y: 632 };
          firstPage.drawText("X", {
            x: field.x,
            y: field.y,
            size: 11,
            font: fontBold,
            color: bluePenColor,
          });
        } else if (formData.is_at_least_18 === "no") {
          const field = coords.is_at_least_18_no || { x: 340, y: 632 };
          firstPage.drawText("X", {
            x: field.x,
            y: field.y,
            size: 11,
            font: fontBold,
            color: bluePenColor,
          });
        }
      }

      // 9. Reason Checkboxes (Section 3 - Registration Only)
      if (!isMailIn) {
        let reasonX = 0;
        let reasonY = 604.6;
        if (applicationReason === "new-registration") {
          reasonX = 189;
        } else if (applicationReason === "mail-in-voting") {
          reasonX = 288;
        } else if (applicationReason === "name-change") {
          reasonX = 375;
        } else if (applicationReason === "address-change") {
          reasonX = 477;
        } else if (applicationReason === "party-change") {
          reasonX = 189;
          reasonY = 593.1;
        } else if (applicationReason === "federal-military") {
          reasonX = 288;
          reasonY = 593.1;
        }

        if (reasonX > 0) {
          firstPage.drawText("X", {
            x: reasonX,
            y: reasonY,
            size: 11,
            font: fontBold,
            color: bluePenColor,
          });
        }
      }

      // 10. Gender Checkboxes (Section 4 - Registration Only)
      if (!isMailIn && formData.gender) {
        const genderVal = String(formData.gender).trim().toUpperCase();
        let genderX = 0;
        if (genderVal.includes("FEMALE") || genderVal === "F") {
          genderX = 233;
        } else if (genderVal.includes("MALE") || genderVal === "M") {
          genderX = 303;
        } else if (
          genderVal.includes("NON-BINARY") ||
          genderVal.includes("OTHER") ||
          genderVal === "X"
        ) {
          genderX = 366;
        }

        if (genderX > 0) {
          firstPage.drawText("X", {
            x: genderX,
            y: 529,
            size: 11,
            font: fontBold,
            color: bluePenColor,
          });
        }
      }

      // 11. Political Party Checkboxes (Section 8 - Registration Only)
      if (!isMailIn && formData.party_choice) {
        const partyVal = String(formData.party_choice).trim().toUpperCase();
        let partyX = 0;
        let partyY = 310;

        if (
          partyVal.includes("DEMOCRATIC") ||
          partyVal === "D" ||
          partyVal === "DEM"
        ) {
          partyX = 188;
        } else if (
          partyVal.includes("REPUBLICAN") ||
          partyVal === "R" ||
          partyVal === "REP"
        ) {
          partyX = 263;
        } else if (partyVal.includes("GREEN") || partyVal === "G") {
          partyX = 337;
        } else if (partyVal.includes("LIBERTARIAN") || partyVal === "L") {
          partyX = 391;
        } else if (partyVal.includes("OTHER") || partyVal === "OTHER") {
          partyX = 188;
          partyY = 290;
        }

        if (partyX > 0) {
          firstPage.drawText("X", {
            x: partyX,
            y: partyY,
            size: 11,
            font: fontBold,
            color: bluePenColor,
          });
        }
      }

      // 12. Section 12 Mail-In Ballot Check (Default Option 2 - Registration Only)
      if (!isMailIn) {
        const secondPage = pdfDoc.getPages()[1];
        if (secondPage) {
          secondPage.drawText("X", {
            x: 189,
            y: 643.5,
            size: 11,
            font: fontBold,
            color: bluePenColor,
          });
        }
      }

      // 13. Section 1.5 ID Checkbox (I do not have either, Registration Only)
      if (!isMailIn && formData.id_type === "none") {
        firstPage.drawText("X", {
          x: 189,
          y: 338,
          size: 11,
          font: fontBold,
          color: bluePenColor,
        });
      }

      // 14. Section 10 Voting Assistance YES Checkbox (Page 1, Registration Only)
      if (!isMailIn && formData.requires_assistance === "yes") {
        firstPage.drawText("X", {
          x: 188,
          y: 159,
          size: 11,
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
      link.download = `${isMailIn ? "mailin" : "registration"}_application_${formData.first_name || "voter"}_${formData.last_name || "record"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`Error generating PDF: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const isPreviousRegistrationRequired =
    applicationReason === "name-change" ||
    applicationReason === "address-change";

  const isIneligible =
    formData.is_citizen === "no" || formData.is_at_least_18 === "no";

  return (
    <div className="space-y-6 select-text">
      {/* SECTION 0: ELIGIBILITY & QUALIFICATIONS (New Researched Panel) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="h-4.5 w-4.5 text-blue-600" />
          Section 0: Eligibility Qualifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 leading-relaxed">
              Are you a citizen of the United States? *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                <input
                  required
                  type="radio"
                  name="is_citizen"
                  value="yes"
                  checked={formData.is_citizen === "yes"}
                  onChange={handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                Yes
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                <input
                  required
                  type="radio"
                  name="is_citizen"
                  value="no"
                  checked={formData.is_citizen === "no"}
                  onChange={handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                No
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 leading-relaxed">
              Will you be at least 18 years of age on or before Election Day? *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                <input
                  required
                  type="radio"
                  name="is_at_least_18"
                  value="yes"
                  checked={formData.is_at_least_18 === "yes"}
                  onChange={handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                Yes
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                <input
                  required
                  type="radio"
                  name="is_at_least_18"
                  value="no"
                  checked={formData.is_at_least_18 === "no"}
                  onChange={handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                No
              </label>
            </div>
          </div>
        </div>

        {isIneligible && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-xs uppercase tracking-wider text-rose-800 font-bold mb-0.5">
                Ineligible to Register:
              </strong>
              <p className="text-xs leading-relaxed">
                If you are not a United States citizen and a resident of
                Pennsylvania at least 30 days before the next election, you{" "}
                <strong>cannot</strong> register to vote on this platform.
              </p>
            </div>
          </div>
        )}
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
              First Name *
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
              Suffix
            </label>
            <select
              name="suffix"
              value={formData.suffix}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select suffix...</option>
              <option value="JR">JR</option>
              <option value="SR">SR</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Last Name *
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
              Birthdate *
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Gender / Sex
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Gender...</option>
              <option value="Female (F)">Female (F)</option>
              <option value="Male (M)">Male (M)</option>
              <option value="Non-Binary / Other (X)">
                Non-Binary / Other (X)
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Race / Ethnic Group (Optional)
            </label>
            <select
              name="race"
              value={formData.race}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select race...</option>
              <option value="WHITE">WHITE</option>
              <option value="BLACK OR AFRICAN AMERICAN">
                BLACK OR AFRICAN AMERICAN
              </option>
              <option value="HISPANIC OR LATINO">HISPANIC OR LATINO</option>
              <option value="ASIAN">ASIAN</option>
              <option value="NATIVE AMERICAN OR ALASKAN NATIVE">
                NATIVE AMERICAN OR ALASKAN NATIVE
              </option>
              <option value="NATIVE HAWAIIAN OR OTHER PACIFIC ISLANDER">
                NATIVE HAWAIIAN OR OTHER PACIFIC ISLANDER
              </option>
              <option value="TWO OR MORE RACES">TWO OR MORE RACES</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
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
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
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
      </div>

      {/* SECTION 1.5: Identification Proof (New Researched Section) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield className="h-4.5 w-4.5 text-blue-600" />
          Section 1.5: Identification Proof *
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Which ID proof can you provide? *
            </label>
            <select
              required
              name="id_type"
              value={formData.id_type}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select ID Type...</option>
              <option value="dl">
                PA Driver&apos;s License or PennDOT ID Card Number
              </option>
              <option value="ssn">
                Social Security Number (Last 4 Digits)
              </option>
              <option value="none">I do not have a PennDOT ID or SSN</option>
            </select>
          </div>

          {formData.id_type === "dl" && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                PA Driver&apos;s License / PennDOT ID Number *
              </label>
              <input
                required
                type="text"
                name="id_dl_number"
                placeholder="Ex. 12345678"
                value={formData.id_dl_number}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          )}

          {formData.id_type === "ssn" && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Social Security Number (Last 4 digits only) *
              </label>
              <input
                required
                type="text"
                name="id_ssn_last4"
                placeholder="Ex. 9876"
                maxLength={4}
                value={formData.id_ssn_last4}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          )}

          {formData.id_type === "none" && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex gap-2">
              <HelpCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="leading-relaxed">
                You declare you have never been issued a Pennsylvania
                Driver&apos;s License/PennDOT ID or an SSN. You can still
                register, but must show proof of identification at your polling
                place when voting for the first time.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Registered Voting Address */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Home className="h-4.5 w-4.5 text-blue-600" />
          Section 2: Registered Voting Address
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Street Address (Not P.O. Box) *
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
              Unit Type
            </label>
            <select
              name="unit_type"
              value={formData.unit_type}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select unit type...</option>
              <option value="APARTMENT">APARTMENT</option>
              <option value="SUITE">SUITE</option>
              <option value="ROOM">ROOM</option>
              <option value="STUDENT MAILING CENTER">
                STUDENT MAILING CENTER
              </option>
              <option value="BASEMENT">BASEMENT</option>
              <option value="FLOOR">FLOOR</option>
              <option value="BUILDING">BUILDING</option>
              <option value="UNIT">UNIT</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Unit/Suite #
            </label>
            <input
              type="text"
              name="suite_number"
              placeholder="e.g. 304B"
              value={formData.suite_number}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              City *
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
              disabled
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-400 font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ZIP Code *
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
              Municipality (City, Boro, or Twp) *
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
              County *
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

      {/* DYNAMIC SECTION 3: Previous Registration Info (Section 8) */}
      <div
        className={`bg-white border rounded-2xl p-6 shadow-sm space-y-4 transition-all ${
          isPreviousRegistrationRequired
            ? "border-blue-300 ring-2 ring-blue-100 bg-blue-50/5"
            : "border-slate-200"
        }`}
      >
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <RotateCcw className="h-4.5 w-4.5 text-blue-600" />
          Section 3: Previous Registration Details
          {isPreviousRegistrationRequired && (
            <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-bold ml-auto animate-pulse">
              ⚠️ Required for Name/Address Change
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Previous Registered Name (if name changed)
            </label>
            <input
              type="text"
              name="prev_name"
              value={formData.prev_name || ""}
              onChange={handleChange}
              required={
                isPreviousRegistrationRequired &&
                applicationReason === "name-change"
              }
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Previous Registered Street Address
            </label>
            <input
              type="text"
              name="prev_address"
              value={formData.prev_address || ""}
              onChange={handleChange}
              required={
                isPreviousRegistrationRequired &&
                applicationReason === "address-change"
              }
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Previous City
            </label>
            <input
              type="text"
              name="prev_city"
              value={formData.prev_city || ""}
              onChange={handleChange}
              required={
                isPreviousRegistrationRequired &&
                applicationReason === "address-change"
              }
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Previous State
            </label>
            <input
              type="text"
              name="prev_state"
              value={formData.prev_state || ""}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Previous ZIP
            </label>
            <input
              type="text"
              name="prev_zip"
              value={formData.prev_zip || ""}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* NEW SECTION 3.5: Political Party Choice (Researched Section) */}
      {!isMailIn && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Flag className="h-4.5 w-4.5 text-blue-600" />
            Section 3.5: Political Party Choice
          </h3>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            Note: To vote in a primary in Pennsylvania, you must register as a
            member of either the <strong>Democratic</strong> or{" "}
            <strong>Republican</strong> party.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Political Party Choice
              </label>
              <select
                name="party_choice"
                value={formData.party_choice}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-semibold text-slate-800"
              >
                <option value="">Select party affiliation...</option>
                <option value="Democratic">Democratic</option>
                <option value="Republican">Republican</option>
                <option value="Green">Green</option>
                <option value="Libertarian">Libertarian</option>
                <option value="None">None (No Affiliation)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {formData.party_choice === "Other" && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Specify Other Party Name *
                </label>
                <input
                  required
                  type="text"
                  name="party_choice_other"
                  placeholder="e.g. Constitutional"
                  value={formData.party_choice_other}
                  onChange={handleChange}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW SECTION 3.8: Voting Assistance (Researched Section) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <HelpCircle className="h-4.5 w-4.5 text-blue-600" />
          Section 3.8: Voting Assistance (Optional)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Do you require help to vote at your polling place?
            </label>
            <select
              name="requires_assistance"
              value={formData.requires_assistance}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select answer...</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {formData.requires_assistance === "yes" && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Specify assistance needed *
              </label>
              <input
                required
                type="text"
                name="assistance_reason"
                placeholder="e.g. Visual/wheelchair help, or language"
                value={formData.assistance_reason}
                onChange={handleChange}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: Mailing Address */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MapPin className="h-4.5 w-4.5 text-blue-600" />
            Section 4: Mailing Address
          </h3>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useSameMailing}
              onChange={(e) => setUseSameMailing(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 h-4 w-4"
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

      {/* SECTION 5: Mail-In Toggle (ONLY visible for mail-in intent) */}
      {applicationReason === "mail-in-voting" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-3.5 animate-fadeIn">
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
              Checking this box completes the Annual Mail-In request section,
              registering the resident to automatically receive a ballot for all
              elections this calendar year.
            </p>
          </label>
        </div>
      )}

      {/* Submit bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl px-4 py-2.5 text-xs font-medium max-w-md">
          <Shield className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
          <span>
            Secure Zero-Server processing. This data never leaves your browser
            window.
          </span>
        </div>

        <button
          onClick={generateSinglePDF}
          disabled={isGenerating || isIneligible}
          type="button"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all shadow-md focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
        >
          {isGenerating ? "Generating Document..." : "Generate & Download PDF"}
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
