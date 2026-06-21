# Pennsylvania Ballot Application Suite — Strategy & Specs

This document outlines the strategic roadmap, priority matrix, and technical design for the Pennsylvania Ballot Application Suite (`mib-pdf-maker`).

---

## 1. Executive Summary & Core Architecture

The goal is to develop a highly secure, lightweight React web application built with **Vite** and hosted on **Firebase Hosting**. The utility allows county election organizers to upload spreadsheet registers of voter applications or manually pre-fill single applications, and instantly download standardized, perfectly aligned PDFs.

### 🛡️ PII Security-First Architecture (Zero-Server Storage)
Because these files contain highly sensitive Personally Identifiable Information (PII) including full names, birth dates, phone numbers, and addresses:
* **No Server-Side Storing or Processing**: All CSV parsing and PDF generation are performed **entirely in the user's browser** (client-side) using `papaparse` and `pdf-lib`.
* **Zero Data Transmission**: No voter data is uploaded to Firebase or any external database. Once the browser window is closed, all session data is permanently purged from memory.
* **Compliance**: This client-side-only architecture guarantees complete compliance with data privacy standards and eliminates server-side liability for PII storage breaches.

---

## 2. Priority Matrix & Implementation Status

To deliver the suite rapidly while maintaining a robust and extensible codebase, we have structured work into priorities:

### 🔴 High Priority (Completed)
1. **Client-side PDF Text Rendering**: Implement `pdf-lib` to overlay custom text fields on official templates with X, Y precision.
2. **Consolidated Batch Generation**: Merge multiple filled application pages into a single, multi-page, printable PDF document.
3. **CSV Validation and Processing**: Rigid checking of column headers and a 25-record batch safety limit.
4. **County Mailing Address Page**: Pre-fill the official envelope cover sheet (`PADOS_address_page.pdf`) based on selected county (Berks, Chester, Delaware, Montgomery) with standard window envelope positioning.
5. **Interactive Sidebar Navigation Layout**: Beautiful dashboard with modular component tabs.

### 🟡 Medium Priority (Completed)
1. **Modern Typography Integration**: Loads clean **Inter Medium (weight 500)** font from jsDelivr CDN for highly crisp, legible printed text.
2. **Individual manual pre-filler**: Manual entry form for new residents that fills the official **`PADOS_Registration_Application.pdf`** template.
3. **Advanced Envelope Tuners**: Built-in coordinate editors to "nudge" positions in real-time.
4. **Mobile Browser Compliance**: Refactored inputs into native `<label>`-associated elements so files can be uploaded flawlessly from Android/iOS.

### 🟢 Low Priority (Roadmap)
1. **Firebase Authentication (User Login)**: Secure the portal so only registered administrators or organizations can access the tool.
2. **History Log / Batch Metadata**: Record the date, time, and batch count of generated PDFs for administrative reporting (without saving the actual voter PII).
3. **Local Storage Persistence**: Save fine-tuned coordinate offsets automatically across sessions.

---

## 3. Current Project Architecture

```mermaid
graph TD
    A[Layout Frame] --> B[CSV Batch Printer]
    A --> C[County Address Printer]
    A --> D[Individual Pre-Filler]
    A --> E[Help & Scale Guide]
```

---

## 4. Required CSV Schema & Database Mapping

To ensure successful parsing, the CSV must include the following headers (even if values are empty). Coordinates are centered around standard Letter dimensions (`612 x 792 points`):

| Header Column Name | Description | PDF Target Section | Default PDF Coordinate (X, Y) in Points |
| :--- | :--- | :--- | :--- |
| `last_name` | Voter's last name | 1 (Last name) | (255, 698) |
| `suffix` | Jr, Sr, II, III, etc. | 1 (Suffix box) | (425, 698) |
| `first_name` | Voter's first name | 1 (First name) | (255, 681) |
| `middle_name` | Middle name/initial | 1 (Middle name) | (425, 681) |
| `birthdate` | Date of birth (MM/DD/YYYY)| 2 (Birth date) | (255, 648) |
| `phone` | Phone number (optional)| 2 (Phone) | (370, 648) |
| `email` | Email address (optional)| 2 (Email) | (255, 631) |
| `address` | Street Address (no P.O. Box)| 3 (Address) | (255, 596) |
| `suite_number` | Apt/Suite number | 3 (Apt. number) | (430, 596) |
| `city` | Registered City/Town | 3 (City/Town) | (255, 579) |
| `state` | Registered State (default PA)| 3 (State) | (355, 579) |
| `zip_code` | 5-digit ZIP code | 3 (ZIP Code) | (390, 579) |
| `municipality` | Local Municipality | 3 (Municipality) | (255, 558) |
| `county` | County of Registration | 3 (County) | (370, 558) |
| `precinct` | Voting precinct / district | 3 (Voting district) | (255, 534) |
| `ward` | Voting ward | 3 (Ward) | (370, 534) |
| `mailing_address` | Alt Mail Address (if different)| 4 (Address/P.O. Box)| (320, 468) |
| `mailing_city` | Alt Mail City | 4 (City/Town) | (255, 451) |
| `mailing_state` | Alt Mail State | 4 (State) | (370, 451) |
| `mailing_zip` | Alt Mail ZIP | 4 (Zip) | (405, 451) |
| `annual_request` | Set to `true` or `yes` to request | 7 (Annual mail-in) | (262, 273) [draws an 'X'] |

*Note: Origin (0,0) is at the bottom-left of the standard Letter size page. Font size defaults to `12` with Inter Medium weight.*
