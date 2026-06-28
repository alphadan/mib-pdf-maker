/**
 * Pennsylvania Voter Registration Application (PADOS_Registration_Application.pdf)
 * Represents the structured interface for fields from Sections 1 to 6 and 8 to 13.
 *
 * NOTE: Sections 7 (Mailing Address), 14 (Helper Information), and 15 (Official Use Only)
 * are intentionally excluded per system requirements.
 */
export interface PadosRegistrationFields {
  // === SECTION 1: QUALIFICATIONS ===
  /** Are you a citizen of the United States? (e.g. "yes", "no") */
  isCitizen?: "yes" | "no";
  /** Will you be at least 18 years of age on or before the next election? (e.g. "yes", "no") */
  isAtLeast18?: "yes" | "no";

  // === SECTION 2: APPLICATION REASON ===
  /** Is this a new registration? */
  reasonNewRegistration?: boolean;
  /** Is this a change of address? */
  reasonAddressChange?: boolean;
  /** Is this a change of name? */
  reasonNameChange?: boolean;
  /** Is this a change of political party? */
  reasonPartyChange?: boolean;

  // === SECTION 3: VOTER NAME ===
  /** Voter's first name */
  firstName?: string;
  /** Voter's middle name or middle initial */
  middleName?: string;
  /** Voter's last name */
  lastName?: string;
  /** Voter's suffix (e.g., JR, SR, III, IV) */
  suffix?: string;

  // === SECTION 4: DATE OF BIRTH ===
  /** Voter's date of birth (MM/DD/YYYY) */
  dateOfBirth?: string;

  // === SECTION 5: IDENTIFICATION ===
  /** Pennsylvania Driver's License or PennDOT ID Card Number */
  paDriverLicenseOrId?: string;
  /** Last 4 digits of the voter's Social Security Number (SSN) */
  ssnLastFour?: string;
  /** True if the voter declares they do not have a PA Driver's License/ID or SSN */
  noIdProvided?: boolean;

  // === SECTION 6: REGISTRATION ADDRESS (HOME) ===
  /** Street number, street name complette, apt/suite (not a P.O. Box) */
  streetAddress?: string;
  /** Apartment, room, suite, or floor number */
  apartmentUnit?: string;
  /** City or town of registration */
  cityTown?: string;
  /** State (always "PA" for this application) */
  state?: string;
  /** ZIP code of registration */
  zipCode?: string;
  /** County of registration */
  county?: string;
  /** Municipality where the voter lives (Township, Borough, or City) */
  municipality?: string;

  // === SECTION 7: MAILING ADDRESS ===
  // EXCLUDED per instructions

  // === SECTION 8: PREVIOUS REGISTRATION DETAILS ===
  /** Previous name (if name changed) */
  prevName?: string;
  /** Previous registered street address */
  prevStreetAddress?: string;
  /** Previous registered city or town */
  prevCityTown?: string;
  /** Previous registered county */
  prevCounty?: string;
  /** Previous registered state */
  prevState?: string;
  /** Previous registered ZIP code */
  prevZipCode?: string;

  // === SECTION 9: POLITICAL PARTY CHOICE ===
  /** Political party selection (e.g. "Democratic", "Republican", "Green", "Libertarian", "None", "Other") */
  partyChoice?: string;
  /** If "Other" is chosen, the name of the political party */
  partyChoiceOther?: string;

  // === SECTION 10: RACE / ETHNIC GROUP (OPTIONAL) ===
  /** Voter's race or ethnic choice (e.g. "White", "Black", "Hispanic", "Asian", "Indian", etc.) */
  raceEthnicGroup?: string;

  // === SECTION 11: CONTACT INFORMATION ===
  /** Primary telephone number */
  phoneNumber?: string;
  /** Email address */
  emailAddress?: string;

  // === SECTION 12: VOTING ASSISTANCE ===
  /** Does the voter require assistance to vote at their polling place? */
  requiresVotingAssistance?: boolean;
  /** Specific reason/explanation for requiring voting assistance */
  assistanceReason?: string;

  // === SECTION 13: DECLARATION SIGNATURE DATE ===
  /** Date the voter signed the declaration (MM/DD/YYYY) */
  declarationSignatureDate?: string;

  // === SECTION 14 & 15: HELP WITH FORM / OFFICIAL USE ===
  // EXCLUDED per instructions
}
