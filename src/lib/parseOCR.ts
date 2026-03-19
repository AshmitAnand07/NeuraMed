export interface ParsedMedicineData {
  medicineName?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  mrp?: string;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try MM/YYYY or MM-YYYY
  const matchMMYYYY = dateStr.match(/(\d{2})[/.-](\d{2,4})/);
  if (matchMMYYYY) {
    let month = parseInt(matchMMYYYY[1], 10);
    let year = parseInt(matchMMYYYY[2], 10);
    if (matchMMYYYY[2].length === 2) year += 2000;
    return new Date(year, month - 1, 1);
  }

  // Handle formats like "OCT 2025" or "OCT 25"
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  const matchTextDate = dateStr.match(/([A-Za-z]{3})\w*\s*[/.-]?\s*(\d{2,4})/);
  if (matchTextDate) {
    const month = months[matchTextDate[1].toLowerCase()];
    if (month !== undefined) {
      let year = parseInt(matchTextDate[2], 10);
      if (matchTextDate[2].length === 2) year += 2000;
      return new Date(year, month, 1);
    }
  }

  return null;
}

function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

export function parseMedicineOCR(text: string): ParsedMedicineData {
  const result: ParsedMedicineData = {};
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. MRP Regex
  const mrpRegex = /(?:MRP|₹|Rs\.?)\s*[:.-]?\s*(\d+(?:\.\d+)?)/i;
  // 2. Expiry Regex
  const expiryRegex = /(?:EXP|Expiry(?: Date)?)\s*[:.-]?\s*([A-Za-z0-9/.-]+(?:\s+\d{2,4})?)/i;
  // 3. Mfg Regex
  const mfgRegex = /(?:MFD|Mfg(?: Date)?|Manufactured)\s*[:.-]?\s*([A-Za-z0-9/.-]+(?:\s+\d{2,4})?)/i;

  const foundDates: { date: Date; type?: 'mfg' | 'exp' }[] = [];

  const addressKeywords = ['road', 'street', 'school', 'temple', 'ahmedabad', 'india', 'gujarat', 'visit', 'email', 'website', 'villas', 'vasna', 'sanand', 'nagar'];
  const companyKeywords = ['ltd', 'pvt', 'private', 'pharma', 'wellness', 'laboratories', 'manufactured', 'marketed', 'distributed', 'pharmaceuticals'];
  const metadataKeywords = ['batch', 'licence', 'lic', 'who', 'gmp', 'certified', 'b.no', 'copyright', 'registered', 'trademark', 'keep out of reach'];
  const medicineSuffixes = ['hydrochloride', 'sodium', 'tablets', 'capsules', 'syrup', 'suspension', 'injection', 'lp', 'ip', 'usp', 'bp', 'montelukast', 'levocetirizine', 'paracetamol', 'dolo'];

  let possibleNames: { line: string; score: number }[] = [];

  lines.forEach((line, index) => {
    const lower = line.toLowerCase();

    // --- MRP Detection ---
    if (!result.mrp) {
      const match = line.match(mrpRegex);
      if (match) result.mrp = match[1];
    }

    // --- Date Detection (Labeled) ---
    const mfgMatch = line.match(mfgRegex);
    if (mfgMatch) {
      const d = parseDate(mfgMatch[1]);
      if (d) foundDates.push({ date: d, type: 'mfg' });
    }

    const expMatch = line.match(expiryRegex);
    if (expMatch) {
      const d = parseDate(expMatch[1]);
      if (d) foundDates.push({ date: d, type: 'exp' });
    }

    // --- Unlabeled Date Detection (if needed) ---
    if (!mfgMatch && !expMatch) {
      const dateOnlyMatch = line.match(/(\d{2}[/.-]\d{2,4}|[A-Za-z]{3}\s*\d{2,4})/);
      if (dateOnlyMatch) {
        const d = parseDate(dateOnlyMatch[1]);
        if (d) foundDates.push({ date: d });
      }
    }

    // --- Medicine Name Logic ---
    const isExcluded = [...addressKeywords, ...companyKeywords, ...metadataKeywords].some(kw => lower.includes(kw));
    const hasMedicineSuffix = medicineSuffixes.some(sh => lower.includes(sh));
    
    // Heuristic Score
    let score = 0;
    if (hasMedicineSuffix) score += 50;
    if (!isExcluded) score += 20;
    if (index < 10) score += (10 - index); // Prioritize top lines
    if (line.length > 5 && line.length < 50) score += 10;
    if (/^[A-Z& ]+$/.test(line)) score += 15; // UPPERCASE names are common

    if (!isExcluded || hasMedicineSuffix) {
      possibleNames.push({ line, score });
    }
  });

  // Handle Dates
  const mfg = foundDates.find(d => d.type === 'mfg')?.date || foundDates.sort((a, b) => a.date.getTime() - b.date.getTime())[0]?.date;
  const exp = foundDates.find(d => d.type === 'exp')?.date || foundDates.sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.date;

  if (mfg) result.manufacturingDate = formatDateForInput(mfg);
  if (exp && exp !== mfg) result.expiryDate = formatDateForInput(exp);
  else if (foundDates.length > 1) {
    // If only one date is found, we can't be sure, but usually we want expiry
    const sorted = foundDates.map(f => f.date).sort((a, b) => a.getTime() - b.getTime());
    result.manufacturingDate = formatDateForInput(sorted[0]);
    result.expiryDate = formatDateForInput(sorted[sorted.length - 1]);
  }

  // Set Medicine Name
  if (possibleNames.length > 0) {
    possibleNames.sort((a, b) => b.score - a.score);
    result.medicineName = possibleNames[0].line;
  }

  return result;
}
