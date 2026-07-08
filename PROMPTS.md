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

## 📂 4. Master CSV Database Ingestion Schema
Spreadsheet imports must adhere exactly to the **25 optional/required columns list**:
```csv
Precinct,First_Name,Middle_Name,Last_Name,Suffix,Date_Of_Birth,House__,StreetNameComplete,Apt__,City,State,Zip_Code,MAddress_Line_1,MAddress_Line_2,MCity,MState,MZip_Code,Ward,RNCfiles.PrimaryPhone,Voter_Status,RNCfiles.OfficialParty,RNCfiles.Age,Sex,VBM.AppType,County
```

### Programmatic Mapping Overrides:
1. `Last_Name` $\rightarrow$ `last_name`
2. `First_Name` $\rightarrow$ `first_name`
3. `Middle_Name` $\rightarrow$ `middle_name`
4. `Date_Of_Birth` $\rightarrow$ `birthdate`
5. `RNCfiles.PrimaryPhone` $\rightarrow$ `phone`
6. `Apt__` $\rightarrow$ `suite_number`
7. `City` $\rightarrow$ `city`
8. `State` $\rightarrow$ `state`
9. `Zip_Code` $\rightarrow$ `zip_code`
10. `Ward` $\rightarrow$ `ward`
11. `MCity` $\rightarrow$ `mailing_city`
12. `MState` $\rightarrow$ `mailing_state`
13. `MZip_Code` $\rightarrow$ `mailing_zip`
14. **Composite Address:** `House__` + `StreetNameComplete` $\rightarrow$ `address`
15. **Composite Mailing Address:** `MAddress_Line_1` + `MAddress_Line_2` $\rightarrow$ `mailing_address`
16. **Dynamic Municipalities:** Resolve by looking up `Precinct` number in `src/utils/precincts.json`.

---

## 📝 5. Commit Message Template
Strictly adhere to the user's personal `AGENTS.md` directive. Ensure commits are in the imperative mood, capitalized, under 50 characters, and have blank lines dividing headers and bodies.
