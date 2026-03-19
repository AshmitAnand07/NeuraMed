export interface ParsedMedicineData {
  medicineName?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  mrp?: string;
}

// ---------------------------------------------------------------------------
// Date parsing helpers
// ---------------------------------------------------------------------------

/**
 * Normalise a raw date token into "YYYY-MM-01".
 *
 * Handles:
 *   MM/YYYY  MM/YY  MM-YYYY  MM-YY
 *   DD/MM/YYYY  DD-MM-YYYY
 *
 * Returns null when the token cannot be reliably parsed.
 */
function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;

  // Try DD/MM/YYYY  (3 numeric groups)
  const threePartMatch = dateStr.match(
    /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/
  );
  if (threePartMatch) {
    let day = threePartMatch[1];
    let month = threePartMatch[2];
    let year = threePartMatch[3];
    if (year.length === 2) year = "20" + year;
    if (month.length === 1) month = "0" + month;
    return `${year}-${month}-01`;
  }

  // Try MM/YYYY or MM/YY  (2 numeric groups)
  const twoPartMatch = dateStr.match(/^(\d{1,2})[\/.\-](\d{2,4})$/);
  if (twoPartMatch) {
    let month = twoPartMatch[1];
    let year = twoPartMatch[2];
    if (month.length === 1) month = "0" + month;
    if (year.length === 2) year = "20" + year;
    // Sanity: month must be 01–12
    if (parseInt(month, 10) < 1 || parseInt(month, 10) > 12) return null;
    return `${year}-${month}-01`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Regex patterns
// ---------------------------------------------------------------------------

/**
 * Match a date token: MM/YYYY, MM/YY, DD/MM/YYYY (separators: / - .)
 * We use a named group so we can pluck it easily.
 */
const DATE_TOKEN_RE =
  /\b(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}|\d{1,2}[\/.\-]\d{2,4})\b/g;

/**
 * Expiry keyword variants found on Indian medicine strips, including
 * OCR artefacts like extra spaces, dots, colons, and spaced-out letters.
 *
 * Covers: EXP / EXP. / Expiry / Expiry Date / Expiry Date: / Use Before / Best Before
 */
const EXPIRY_KEYWORD_RE =
  /(?:exp(?:iry)?(?:\s*\.?\s*date)?|use\s+before|best\s+before)\s*[:.\/\-]?\s*/i;

/**
 * Manufacturing keyword variants.
 * Covers: MFD / MFD. / Mfg / Mfg. / Mfg Date / Manufactured
 */
const MFG_KEYWORD_RE =
  /(?:mf[gd]\.?(?:\s*\.?\s*date)?|manufactured(?:\s+date)?)\s*[:.\/\-]?\s*/i;

/** MRP variants: MRP / ₹ / Rs / Rs. */
const MRP_RE = /(?:m\.?r\.?p\.?|₹|rs\.?)\s*[:.\/\-]?\s*(\d+(?:\.\d{1,2})?)/i;

// ---------------------------------------------------------------------------
// Main keyword-aware date extractor
// ---------------------------------------------------------------------------

/**
 * Search `fullText` (the entire OCR dump, not just one line) for a keyword
 * followed – on the same or immediately next line – by a date token.
 */
function extractKeywordDate(
  fullText: string,
  keywordRe: RegExp
): string | null {
  // We look for: <keyword> <optional non-digit noise up to 20 chars> <date>
  const combined = new RegExp(
    keywordRe.source + "[^\\d]{0,20}?" + DATE_TOKEN_RE.source,
    "i"
  );
  DATE_TOKEN_RE.lastIndex = 0; // reset global regex state

  const m = fullText.match(combined);
  if (m) {
    // The date is in the last capture group
    const dateToken = m[m.length - 1];
    return parseDate(dateToken);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Fallback: gather all date tokens from text, sort, assign min/max
// ---------------------------------------------------------------------------

function extractAllDates(text: string): string[] {
  DATE_TOKEN_RE.lastIndex = 0;
  const raw: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = DATE_TOKEN_RE.exec(text)) !== null) {
    raw.push(m[1]);
  }

  // Deduplicate then parse
  const unique = [...new Set(raw)];
  const parsed = unique.map(d => parseDate(d)).filter(Boolean) as string[];
  return [...new Set(parsed)].sort(); // ISO sort = chronological
}

// ---------------------------------------------------------------------------
// Medicine name detection
// ---------------------------------------------------------------------------

const EXCLUDE_KEYWORDS = [
  "ltd", "pvt", "private", "wellness", "pharma", "laboratories",
  "road", "street", "school", "temple", "ahmedabad", "india",
  "visit", "email", "website", "address", "manufactured",
  "marketed", "distributed", "licence", "batch", "who",
  "gmp", "certified", "lic.", "b.no", "copyright",
  "registered", "trademark", "keep out of reach", "storage",
  "composition", "dosage", "colour", "excipients", "coated",
  "directed", "physician", "protect", "moisture", "temperature",
  "smartway", "hetero", "sun pharma", "cipla",
];

const SHORT_FRAGMENTS = new Set(["ip", "bp", "usp", "rx", "®", "i.p.", "b.p."]);

function detectMedicineName(lines: string[]): string {
  let bestCandidate = "";
  let bestScore = -1;

  lines.forEach((line, index) => {
    const lower = line.toLowerCase().trim();

    if (!lower) return;
    if (SHORT_FRAGMENTS.has(lower)) return;
    if (EXCLUDE_KEYWORDS.some(k => lower.includes(k))) return;

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length < 3) return; // must have ≥ 3 words

    const letterCount = (line.match(/[a-zA-Z]/g) || []).length;
    const mostlyLetters = letterCount / line.length > 0.5;
    if (!mostlyLetters) return;

    // Skip lines that are clearly date/batch lines
    if (/\b(?:mfg|mfd|exp|batch|b\.no)/i.test(line)) return;
    // Skip lines with long number sequences (batch numbers, licence numbers)
    if (/\d{5,}/.test(line)) return;

    let score = 0;
    // Prefer lines near the top of the OCR output
    if (index === 0) score += 80;
    else if (index < 3) score += 60;
    else if (index < 6) score += 40;
    else if (index < 10) score += 20;

    // Reward longer, more word-rich lines
    score += words.length * 6;

    // Reward pharmaceutical suffixes
    if (/\b(?:tablets?|capsules?|syrup|injection|solution|suspension|cream|ointment|gel|drops?)\b/i.test(line)) {
      score += 30;
    }

    if (score > bestScore) {
      bestScore = score;
      bestCandidate = line;
    }
  });

  return bestCandidate;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function parseMedicineOCR(text: string): ParsedMedicineData {
  const result: ParsedMedicineData = {
    medicineName: "",
    manufacturingDate: "",
    expiryDate: "",
    mrp: "",
  };

  // Normalise: collapse multiple spaces but preserve newlines for multi-line search
  const normalised = text.replace(/[ \t]+/g, " ").trim();

  const lines = normalised
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  // ------------------------------------------------------------------
  // 1. MRP  (scan line-by-line; first match wins)
  // ------------------------------------------------------------------
  for (const line of lines) {
    const m = line.match(MRP_RE);
    if (m) {
      result.mrp = m[1];
      break;
    }
  }

  // ------------------------------------------------------------------
  // 2. Expiry & Manufacturing dates
  //    Strategy A: keyword-aware search across the full text blob.
  //    This handles cases where the keyword and date are on different
  //    lines or separated by extra OCR noise.
  // ------------------------------------------------------------------
  result.expiryDate = extractKeywordDate(normalised, EXPIRY_KEYWORD_RE) ?? "";
  result.manufacturingDate = extractKeywordDate(normalised, MFG_KEYWORD_RE) ?? "";

  // ------------------------------------------------------------------
  // 3. Fallback: if either date is still missing, collect all date
  //    tokens from the text and assign min → mfg, max → expiry.
  // ------------------------------------------------------------------
  if (!result.expiryDate || !result.manufacturingDate) {
    const allDates = extractAllDates(normalised);

    if (allDates.length >= 1) {
      if (!result.manufacturingDate) {
        result.manufacturingDate = allDates[0];
      }
      if (!result.expiryDate && allDates.length >= 2) {
        result.expiryDate = allDates[allDates.length - 1];
      }
      // Single date token and no keyword match → probably expiry only
      if (!result.expiryDate && allDates.length === 1 && result.manufacturingDate) {
        // Leave expiryDate empty; we can't guess with one token
      }
    }
  }

  // ------------------------------------------------------------------
  // 4. Medicine name
  // ------------------------------------------------------------------
  result.medicineName = detectMedicineName(lines);

  return result;
}