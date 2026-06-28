# Pennsylvania Ballot Application Suite — Strategy & Specs

This document outlines the strategic roadmap, priority matrix, and technical design for the Pennsylvania Ballot Application Suite (`mib-pdf-maker`).

---

## 1. Executive Summary & Core Architecture

The goal is to develop a highly secure, lightweight React web application built with **Vite** and hosted on **Firebase Hosting**. The utility allows county election organizers to upload spreadsheet registers of voter applications or manually pre-fill single applications, and instantly download standardized, perfectly aligned PDFs.

The primary user action revolves around bulk CSV uploading and batch printing. To streamline this workflow, the sidebar acts as a **voter action workspace portal**—promoting the 6 primary Application Purposes directly to the main menu bar.

### 🛡️ PII Security-First Architecture (Zero-Server Storage)
Because these files contain highly sensitive Personally Identifiable Information (PII) including full names, birth dates, phone numbers, and addresses:
* **No Server-Side Storing or Processing**: All CSV parsing and PDF generation are performed **entirely in the user's browser** (client-side) using `papaparse` and `pdf-lib`.
* **Zero Data Transmission**: No voter data is uploaded to Firebase or any external database. Once the browser window is closed, all session data is permanently purged from memory.
* **Denial of Service Guardrails**: Files are limited to **5MB** and **500 rows** to protect browser memory performance and prevent local Denial of Service (DoS).

---

## 2. Priority Matrix & Implementation Status

To deliver the suite rapidly while maintaining a robust and extensible codebase, we have structured work into priorities:

### 🔴 High Priority (Completed)
1. **Dynamic Workspace Portal sidebar Navigation**: Restructured the main menu bar to host the 6 Application Purposes (intents) natively as independent workspaces.
2. **Dynamic PDF Template Routing**: Dynamically fetches the 1-page **`PADOS_MailInApplication.pdf`** (for Mail-In) or the 2-page **`PADOS_Registration_Application.pdf`** (for the other 5 registration reasons) on the fly.
3. **Multi-Page Compilation Engine**: Extended `pdf-lib` merges to read document page sizes dynamically, compiling multi-page registration applications into a consolidated download.
4. **Flexible Schema Validation**: Enforces only the 20 actually required CSV column headers. Optional columns are skipped safely and default to fallbacks.
5. **Wet signature & Alignment Help Guide**: An interactive, lightweight Markdown previewer displaying standard double-sided layouts, scaling parameters, and assembly tutorials.

### 🟡 Medium Priority (Completed)
1. **Coordinate Page Indices Mapping**: Support coordinate properties like `pageIndex` so previous registration details (Section 8) print exactly on Page 2 of the Registration PDF.
2. **Context-Driven Manual Forms**: Built an integrated "Single Manual Entry" tab inside each workspace. Shows/hides Section 8 Previous Registration inputs based on selected intent to reduce operator screen noise.
3. **Sensitive Data Privacy Toggles**: Enforces a privacy toggle checkbox, allowing operators to easily exclude voter Date of Birth or Phone Number from pre-filled forms.
4. **Party Initials Abbreviation Parser**: Standardized a custom R/D/I/G/L/NF mapping engine for walk list copying.
5. **Independent LocalStorage Routing**: Coordinations modified via the Advanced Tuner are saved independently for the 1-page form vs the 2-page form.

### 🟢 Low Priority (Roadmap)
1. **Firebase Authentication (User Login)**: Secure the portal so only registered administrators or organizations can access the tool.
2. **History Log / Batch Metadata**: Record the date, time, and batch count of generated PDFs for administrative reporting (without saving the actual voter PII).

---

## 3. Current Project Architecture

The layout maps each application purpose directly to its respective file template and coordinate routing rules:

```mermaid
graph TD
    A[Layout Frame Sidebar] --> B[Mail-In Ballots]
    A --> C[New Voter Registration]
    A --> D[Change of Address]
    A --> E[Change of Name]
    A --> F[Change of Party]
    A --> G[Federal/Military Move]
    A --> H[County Routing Address]
    A --> I[Help Guide]

    B -->|Loads 1-Page Form| J[PADOS_MailInApplication.pdf]
    C & D & E & F & G -->|Loads 2-Page Form| K[PADOS_Registration_Application.pdf]
```

---

## 4. Required CSV Schema & Database Mapping

To ensure successful parsing, the CSV must include the **20 required column headers** listed below. Optional headers can be omitted without causing errors:

```csv
First_Name,Middle_Name,Last_Name,Suffix,Date_Of_Birth,House__,StreetNameComplete,Apt__,City,State,Zip_Code,MAddress_Line_1,MAddress_Line_2,MCity,MState,MZip_Code,PollingPlaceDescript,Ward,RNCfiles.PrimaryPhone,Voter_Status
```

### Coordinates Mapping (612 x 792 PDF points):

| CSV Column Name | Internal Key | Page Index | Coordinate (X, Y) | Target Field Section |
| :--- | :--- | :---: | :--- | :--- |
| `Last_Name` | `last_name` | 0 | (248, 698) | Section 1: Last Name |
| `First_Name` | `first_name` | 0 | (248, 676) | Section 1: First Name |
| `Middle_Name` | `middle_name` | 0 | (504, 676) | Section 1: Middle Name |
| `Suffix` (JR, SR, III, IV) | `suffix` | 0 | Checked Coordinates | Section 1: Suffix Checkbox Bubbles |
| `Date_Of_Birth` | `birthdate` | 0 | (272, 568) | Section 2: Date of Birth |
| `RNCfiles.PrimaryPhone` | `phone` | 0 | (230, 550) | Section 2: Phone number |
| `House__` + `StreetNameComplete` | `address` | 0 | (280, 504) | Section 3: Street Address |
| `Apt__` | `suite_number` | 0 | (544, 504) | Section 3: Apt/Suite |
| `City` | `city` | 0 | (242, 486) | Section 3: Registered City |
| `Zip_Code` | `zip_code` | 0 | (432, 486) | Section 3: ZIP Code |
| `Ward` | `ward` | 0 | (390, 436) | Section 3: Ward |
| `MAddress_Line_1` + `MAddress_Line_2` | `mailing_address` | 0 | (356, 422) | Section 4: Alternative Mailing Address |
| `MCity` | `mailing_city` | 0 | (234, 402) | Section 4: Mailing City |
| `MState` | `mailing_state` | 0 | (480, 402) | Section 4: Mailing State |
| `MZip_Code` | `mailing_zip` | 0 | (528, 402) | Section 4: Mailing ZIP |
| `Prev_Name` | `prev_name` | 1 | (248, 312) | Section 8: Previous Registered Name (Page 2) |
| `Prev_Address` | `prev_address` | 1 | (248, 268) | Section 8: Previous Street Address (Page 2) |
| `Prev_City` | `prev_city` | 1 | (242, 224) | Section 8: Previous City (Page 2) |
| `Prev_State` | `prev_state` | 1 | (390, 224) | Section 8: Previous State (Page 2) |
| `Prev_Zip` | `prev_zip` | 1 | (432, 224) | Section 8: Previous ZIP (Page 2) |
| `Prev_County` | `prev_county` | 1 | (524, 224) | Section 8: Previous County (Page 2) |
| `VBM.AppType` | `annual_request` | 0 | (189, 206) | Section 7: Annual Request (Mail-In Only) |

*Note: The Pennsylvania state pre-fill `'PA'` is printed statically by the official template. The PreFiller bypasses stamping duplicate `state` values to maintain pristine document legibility.*
