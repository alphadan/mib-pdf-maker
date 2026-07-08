# PA Ballot PreFiller — Prompt Engineering & Context Standards (`PROMPTS.md`)

This document is a semantic context resource. It stores our strict system rules, styling standards, and data shapes.

---

## 🛡️ 1. System Profile & Rules of Engagement
When responding to or writing code for this project, you must strictly follow these rules:
* **Compile and Validate:** Always run `npm run build` after editing files to verify TypeScript compilation and Vite bundling succeed without any errors. Never declare victory until the build passes.
* **Surgical Precision:** Do not overwrite entire files if a granular replace works. Keep edits minimal, clean, and styled consistently with the surrounding codebase.
* **No Redundant Selectors:** Never mix `flex` and `block` display properties on the same component tags to prevent compilation warnings.
* **Robust Font kit Parsing:** Always register the `@pdf-lib/fontkit` engine on loaded `PDFDocument` objects before embedding custom TrueType/OpenType files.

---

## 🤖 2. Semantic Memory Sync Trigger
* **The Suffix Phrase:** The user will append the exact phrase below to the end of their prompts:
  > **`"Look at PROMPTS.md and STRATEGY.md to see our mappings."`**
* **Required AI Action:** When you detect this trigger phrase, you **MUST** immediately invoke the `read_file` tool to load and read both `PROMPTS.md` and `STRATEGY.md`. This synchronizes your short-term memory with the exact database schemas, coordinates, alignments, and roadmap status of this isolated project before proposing any answers or writing any code.

---

## 🎨 3. Coding & Typography Style Guidelines
* **Custom Typography:** Always load custom TrueType fonts locally from `/public/Inter-Medium.ttf`.
* **Fontkit Engine:** Always import and register `@pdf-lib/fontkit` on PDFDocument loaders before calling `.embedFont()` with custom assets:
  ```typescript
  import fontkit from "@pdf-lib/fontkit";
  // ...
  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);
  ```
* **Bilingual/State Safety:** Do not duplicate `'PA'` text draws. State codes are static.

---

## 📂 4. Dynamic Context-Aware CSV Ingestion Schema

The spreadsheet ingestion engine (`src/utils/csvSchema.ts`) validates uploaded voter tables dynamically depending on the current active tab. It splits files into three logical checking tiers:

1. **Universal Keys (Mandatory on All Tabs):**
   * `First_Name`, `Last_Name`, `Date_Of_Birth`, `House__`, `StreetNameComplete`, `City`, `State`, `Zip_Code`.
2. **Contextual Action Keys (Validated Dynamically):**
   * `RNCfiles.OfficialParty` (Requires on `new-registration` & `party-change`)
   * `Prev_Address`, `Prev_City`, `Prev_State`, `Prev_Zip` (Requires on `address-change` & `new-movers`)
   * `Prev_Name` (Requires on `name-change`)
3. **Optional Helper Keys (Always Optional):**
   * `Middle_Name`, `Suffix`, `Apt__`, `MAddress_Line_1`, `MAddress_Line_2`, `MCity`, `MState`, `MZip_Code`, `Ward`, `Precinct`, `County`, `RNCfiles.PrimaryPhone`, `Sex`, `VBM.AppType`, `Voter_Status`.

### Programmatic Mapping Overrides & Case Fallbacks:
The importer maps raw CSV record values to unified schema-wide attributes using dual lowercase/uppercase fallback logic:
1. `last_name` $\leftarrow$ `Last_Name` or `last_name`
2. `first_name` $\leftarrow$ `First_Name` or `first_name`
3. `middle_name` $\leftarrow$ `Middle_Name` or `middle_name`
4. `birthdate` $\leftarrow$ `Date_Of_Birth` or `birthdate` or `Date_of_Birth`
5. `phone` $\leftarrow$ `RNCfiles.PrimaryPhone` or `phone` or `PrimaryPhone`
6. `suite_number` $\leftarrow$ `Apt__` or `suite_number` or `Apt` or `Apt_No`
7. `city` $\leftarrow$ `City` or `city`
8. `state` $\leftarrow$ `State` or `state`
9. `zip_code` $\leftarrow$ `Zip_Code` or `zip_code` or `Zip`
10. `ward` $\leftarrow$ `Ward` or `ward`
11. `mailing_city` $\leftarrow$ `MCity` or `mailing_city`
12. `mailing_state` $\leftarrow$ `MState` or `mailing_state`
13. `mailing_zip` $\leftarrow$ `MZip_Code` or `mailing_zip`
14. **Composite Home Address:** Combining `House__` + `StreetNameComplete` into `address`
15. **Composite Mailing Address:** Combining `MAddress_Line_1` + `MAddress_Line_2` into `mailing_address`
16. **Annual Request Toggle:** For tab `new-movers` (always hardcoded to `"yes"`). For other tabs, checks if `VBM.AppType` or `annual_request` contains `"annual"` or `"yes"`.
17. **Previous Registration Overrides:** Maps `prev_name` from `Prev_Name` / `prev_name`, and maps `prev_address` / `prev_city` / `prev_state` / `prev_zip` from both upper/lowercase variants.
18. **Dynamic Municipalities:** Automatically derived by looking up numerical `Precinct` inside `src/utils/precincts.json`. (Omit manual municipality inputs).

---

## 📝 5. Commit Message Template
Strictly adhere to the user's personal `AGENTS.md` directive. Ensure commits are in the imperative mood, capitalized, under 50 characters, and have blank lines dividing headers and bodies.
