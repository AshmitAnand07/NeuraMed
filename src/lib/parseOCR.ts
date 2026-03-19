export interface ParsedMedicineData {
  medicineName?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  mrp?: string;
}

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;

  const match = dateStr.match(/(\d{1,2})[\/.-](\d{2,4})/);
  if (!match) return null;

  let month = match[1];
  let year = match[2];

  if (month.length === 1) month = "0" + month;
  if (year.length === 2) year = "20" + year;

  return `${year}-${month}-01`;
}

export function parseMedicineOCR(text: string): ParsedMedicineData {
  const result: ParsedMedicineData = {
    medicineName: "",
    manufacturingDate: "",
    expiryDate: "",
    mrp: ""
  };

  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const excludeKeywords = [
    "ltd", "pvt", "private", "wellness", "pharma", "laboratories",
    "road", "street", "school", "temple", "ahmedabad", "india",
    "visit", "email", "website", "address", "manufactured",
    "marketed", "distributed", "licence", "batch", "who",
    "gmp", "certified", "lic.", "b.no", "copyright",
    "registered", "trademark", "keep out of reach"
  ];

  const shortFragments = ["ip", "bp", "usp", "rx", "®"];

  const mrpRegex = /(?:MRP|₹|Rs\.?)\s*[:.-]?\s*(\d+(?:\.\d+)?)/i;
  const expiryRegex =
    /(?:EXP|Expiry(?: Date)?|Use Before|Best Before)\s*[:.-]?\s*(\d{1,2}[\/.-]\d{2,4})/i;
  const mfgRegex =
    /(?:MFD|Mfg(?: Date)?|Manufactured)\s*[:.-]?\s*(\d{1,2}[\/.-]\d{2,4})/i;

  let medicineCandidate = "";
  let bestScore = -1;

  const detectedDates: string[] = [];

  lines.forEach((line, index) => {
    const lower = line.toLowerCase();

    // MRP
    if (!result.mrp) {
      const m = line.match(mrpRegex);
      if (m) result.mrp = m[1];
    }

    // Expiry
    if (!result.expiryDate) {
      const exp = line.match(expiryRegex);
      if (exp) {
        const parsed = parseDate(exp[1]);
        if (parsed) result.expiryDate = parsed;
      }
    }

    // Manufacturing
    if (!result.manufacturingDate) {
      const mfg = line.match(mfgRegex);
      if (mfg) {
        const parsed = parseDate(mfg[1]);
        if (parsed) result.manufacturingDate = parsed;
      }
    }

    // collect all date-like values
    const fallback = line.match(/\b\d{1,2}[\/.-]\d{2,4}\b/g);
    if (fallback) detectedDates.push(...fallback);

    // Medicine name detection
    const words = line.split(/\s+/);
    const isExcluded = excludeKeywords.some(k => lower.includes(k));
    const isShort = shortFragments.includes(lower);

    const mostlyLetters =
      (line.match(/[a-zA-Z]/g) || []).length / line.length > 0.5;

    const hasLongNumbers = /\d{4,}/.test(line);

    if (!isExcluded && !isShort && mostlyLetters && !hasLongNumbers && words.length >= 3) {
      let score = 0;

      if (index < 5) score += 50;
      else if (index < 10) score += 30;

      score += words.length * 5;

      if (score > bestScore) {
        bestScore = score;
        medicineCandidate = line;
      }
    }
  });

  result.medicineName = medicineCandidate;

  // fallback date detection
  if ((!result.manufacturingDate || !result.expiryDate) && detectedDates.length >= 2) {
    const parsedDates = detectedDates
      .map(d => parseDate(d))
      .filter(Boolean) as string[];

    parsedDates.sort();

    if (!result.manufacturingDate) {
      result.manufacturingDate = parsedDates[0];
    }

    if (!result.expiryDate) {
      result.expiryDate = parsedDates[parsedDates.length - 1];
    }
  }

  return result;
}