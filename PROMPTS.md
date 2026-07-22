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

The spreadsheet ingestion engine (`src/utils/csvSchema.ts`) validates uploaded voter tables dynamically depending on the current active tab. It splits files into three color-coded checking tiers:

1. **🟢 Universal Core (Green Columns - Mandatory on ALL Tabs):**
   * `First_Name`, `Middle_Name`, `Last_Name`, `Suffix`, `House__`, `StreetNameComplete`, `City`, `Zip_Code`, `RNCfiles.HouseholdParty`, `Precinct`, `RNCfiles.Age`, `Sex`.
2. **🔵 Optional Helpers (Blue Columns - Always Optional, Never Throw Errors):**
   * `Phone`, `RNCfiles.PrimaryPhone`, `Email`, `Municipality`, `Ward`, `Lived_Since`, `MAddress`, `MCity`, `MState`, `MZip`, `Date_Of_Birth`, `County`.
3. **🟡 Reason-Specific Context (Yellow Columns - Validated Dynamically):**
   * **Mail-In Ballot (`mail-in-voting`)**: `Mib_Address`, `Mib_City`, `Mib_State`, `Mib_Zip`
   * **Voter Registration Purposes**: `Citizen`, `RNCfiles.OfficialParty`
   * **Change of Name (`name-change`)**: `Citizen`, `RNCfiles.OfficialParty`, `Prev_Name`
   * **Change of Address & New Movers**: `Citizen`, `RNCfiles.OfficialParty`, `Prev_Address`

### Programmatic Mapping Overrides & Case Fallbacks:
The importer maps raw CSV record values to unified schema-wide attributes using dual lowercase/uppercase fallback logic:
1. `last_name` $\leftarrow$ `Last_Name` or `last_name`
2. `first_name` $\leftarrow$ `First_Name` or `first_name`
3. `middle_name` $\leftarrow$ `Middle_Name` or `middle_name`
4. `birthdate` $\leftarrow$ `Birth_Date` or `Date_Of_Birth` or `birthdate`
5. `phone` $\leftarrow$ `Phone` or `RNCfiles.PrimaryPhone` or `phone`
6. `email` $\leftarrow$ `Email` or `email`
7. `sex`/`gender` $\leftarrow$ `Gender` or `Sex` or `sex`
8. `suite_number` $\leftarrow$ `Apt` or `Apt__` or `suite_number`
9. `city` $\leftarrow$ `City` or `city`
10. `state` $\leftarrow$ `State` or `state`
11. `zip_code` $\leftarrow$ `Zip_Code` or `zip_code` or `Zip`
12. `precinct` $\leftarrow$ `Precinct` or `precinct`
13. `ward` $\leftarrow$ `Ward` or `ward`
14. `lived_since` $\leftarrow$ `Lived_Since` or `lived_since`
15. `county` $\leftarrow$ `County` or `county` (resolves programmatically to PA full text)
16. `municipality` $\leftarrow$ `Municipality` or `municipality` (if empty, resolves from Precinct number)
17. **Composite Home Address:** Combining `House` (or `House__`) + `Street` (or `StreetNameComplete`) into `address`
18. **Composite Mailing Address:** 
    * If Mail-In: uses `Mib_Address`, `Mib_City`, `Mib_State`, `Mib_Zip` (ballot papers destination)
    * If General Registration: uses `MAddress` (or `MAddress_Line_1`) + `MAddress_Line_2` into `mailing_address`
19. **Annual Request Toggle:** For tab `new-movers` (always hardcoded to `"yes"`). For other tabs, checks if `VBM.AppType` or `annual_request` contains `"annual"` or `"yes"`.
20. **Previous Registration Overrides:** Maps `prev_name` from `Prev_Name` / `prev_name`, and maps `prev_address` / `prev_city` / `prev_state` / `prev_zip` from both upper/lowercase variants.
21. **Dynamic Municipalities:** Automatically derived by looking up numerical `Precinct` inside `src/utils/precincts.json`. (Omit manual municipality inputs if Precinct is supplied).
22. **Silent Excel Parser:** Integrates SheetJS (`xlsx`) to automatically parse and extract `.xlsx`/`.xls` binary spreadsheets in browser memory. It targets index `0` (the first leftmost worksheet tab) of any workbook, ignoring other sheets and sheet text names, and compiles a CSV text string dynamically for the ingestion pipeline.

---

## 📝 5. Commit Message Template
Strictly adhere to the user's personal `AGENTS.md` directive. Ensure commits are in the imperative mood, capitalized, under 50 characters, and have blank lines dividing headers and bodies.
