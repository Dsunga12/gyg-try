/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PenaltyData {
  kds: number;
  sc: number;
  missing: number;
  fouls: number;
}

export interface RestaurantData {
  name: string;
  zone: string;
  weeklyTotals: number[]; // [Week 1, Week 2, Week 3, Week 4]
  wowChanges: number[]; // [Week 2%, Week 3%, Week 4%]
  weeklySales: number[];
  wowSalesChanges: number[];
  weeklyPenalties: PenaltyData[]; // [Week 1, Week 2, ...]
}

export const ZONES: Record<string, string[]> = {
  Aguila: ['OFC', 'OGW', 'SV', 'TPC', 'DUN'],
  Triunfo: ['FNN', 'ION', 'NOV', 'NP', 'SRN', 'PSR'],
  Fuego: ['OTH', 'WWP', 'GWC', 'JWL'],
  Impetu: ['i12', 'NEX', 'VVC', 'STC'],
  Dominio: ['HLV', 'RML', 'WGT', 'MBC'],
};

export const RESTAURANT_TO_ZONE: Record<string, string> = Object.entries(ZONES).reduce(
  (acc, [zone, restaurants]) => {
    restaurants.forEach((o) => (acc[o] = zone));
    return acc;
  },
  {} as Record<string, string>
);

export function getWeekLabels(numWeeks: number) {
  const baseDate = new Date(2026, 2, 2); // March 2, 2026
  return Array.from({ length: Math.max(numWeeks, 1) }, (_, i) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i * 7);
    return {
      label: `Week ${10 + i}`,
      date: date.toLocaleString('en-US', { month: 'long', day: 'numeric' })
    };
  });
}

/**
 * Parses a CSV line correctly, handling quoted values with commas.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const RESTAURANT_NAMES = [
  'FNN', 'GWC', 'HLV', 'i12', 'ION', 'MBC', 'NEX', 'NOV', 'NP', 'OFC',
  'OGW', 'OTH', 'PSR', 'RML', 'SRN', 'SV', 'TPC', 'VVC', 'WGT',
  'WWP', 'JWL', 'STC', 'DUN'
];

/**
 * Processes CSV data for transactions or sales.
 * Formula: Weekly Total = Sum of (Lunch + Dinner) for each day (Monday to Friday) per outlet.
 * Excludes data from the current week (the week containing 'today').
 */
/**
 * Processes CSV data and returns a map of values by restaurant and week (Monday timestamp).
 * Structure:
 * Row 1: Outlet Names
 * Row 2: L and D labels
 * Row 3+: Data (Date in first column)
 * Aggregation: Sum of (L + D) for Monday to Friday only.
 */
function getValuesByWeek(csv: string): { values: Record<string, Record<number, number>>, mondays: number[] } {
  const lines = csv.trim().split('\n').map(l => l.trim()).filter(l => l !== '');
  if (lines.length < 3) return { values: {}, mondays: [] };

  // 1. Identify header rows and data start
  const firstDataRowIdx = lines.findIndex(l => /\d+[\/\-]\d+[\/\-]\d+/.test(l.split(',')[0]));
  if (firstDataRowIdx === -1) return { values: {}, mondays: [] };

  const outletRow = parseCSVLine(lines[0]);
  
  const columnMap: Record<string, { l: number, d: number }> = {};
  RESTAURANT_NAMES.forEach(name => {
    // Look for exact match or match where the cell starts with the name followed by space/underscore
    const idx = outletRow.findIndex(cell => {
      const c = cell.trim().toUpperCase();
      const n = name.toUpperCase();
      return c === n || c.startsWith(n + ' ') || c.startsWith(n + '_');
    });
    
    if (idx !== -1) {
      // Per user: "If ION is in column M, then the L and D is Column M and N"
      columnMap[name] = { l: idx, d: idx + 1 };
    }
  });

  const dataLines = lines.slice(firstDataRowIdx);
  
  // 3. Process data rows
  const rowsWithDates = dataLines.map(line => {
    const parts = parseCSVLine(line);
    const dateStr = parts[0];
    const dateParts = dateStr.split(/[\/\-]/).map(Number);
    if (dateParts.length < 3) return null;

    // Per user: "The data format in the CSVs will always be M/d/YYYY. Please stick to this."
    const [monthNum, dayNum, yearNum] = dateParts;
    
    const year = yearNum < 100 ? 2000 + yearNum : yearNum;
    const date = new Date(year, monthNum - 1, dayNum);
    
    if (isNaN(date.getTime())) return null;

    const dayOfWeek = date.getDay();
    const isMonToFri = dayOfWeek >= 1 && dayOfWeek <= 5;
    
    // Find Monday of that week
    const monday = new Date(date);
    const diff = date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    
    return { monday: monday.getTime(), parts, isMonToFri };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  // 4. Filter out current week and non-weekdays
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeekNow = today.getDay();
  const diffToMonday = today.getDate() - (dayOfWeekNow === 0 ? 6 : dayOfWeekNow - 1);
  const currentMonday = new Date(today.getFullYear(), today.getMonth(), diffToMonday).getTime();

  const filteredRows = rowsWithDates.filter(r => r.monday < currentMonday && r.isMonToFri);
  const uniqueMondays = Array.from(new Set(filteredRows.map(r => r.monday))).sort((a, b) => a - b);
  
  const values: Record<string, Record<number, number>> = {};
  RESTAURANT_NAMES.forEach(name => values[name] = {});

  filteredRows.forEach((row) => {
    RESTAURANT_NAMES.forEach((name) => {
      const mapping = columnMap[name];
      if (!mapping) return;

      const lVal = parseFloat(row.parts[mapping.l]?.replace(/[^0-9.]/g, '')) || 0;
      const dVal = parseFloat(row.parts[mapping.d]?.replace(/[^0-9.]/g, '')) || 0;
      
      if (!values[name][row.monday]) values[name][row.monday] = 0;
      values[name][row.monday] += (lVal + dVal);
    });
  });

  return { values, mondays: uniqueMondays };
}

function getPenaltiesByWeek(csv: string): { values: Record<string, Record<number, PenaltyData>>, mondays: number[] } {
  const lines = csv.trim().split('\n').map(l => l.trim()).filter(l => l !== '');
  if (lines.length < 2) return { values: {}, mondays: [] };

  const headers = parseCSVLine(lines[0]).map(h => h.toUpperCase());
  const outletIdx = headers.findIndex(h => h.includes('OUTLET') || h.includes('RESTAURANT'));
  const dateIdx = headers.findIndex(h => h.includes('DATE'));
  const kdsIdx = headers.findIndex(h => h.includes('KDS'));
  const scIdx = headers.findIndex(h => h.includes('SC'));
  const missingIdx = headers.findIndex(h => h.includes('MISSING'));
  const foulIdx = headers.findIndex(h => h.includes('FOUL'));

  if (dateIdx === -1 || outletIdx === -1) return { values: {}, mondays: [] };

  const values: Record<string, Record<number, PenaltyData>> = {};
  RESTAURANT_NAMES.forEach(name => values[name] = {});

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeekNow = today.getDay();
  const diffToMonday = today.getDate() - (dayOfWeekNow === 0 ? 6 : dayOfWeekNow - 1);
  const currentMonday = new Date(today.getFullYear(), today.getMonth(), diffToMonday).getTime();

  for (let i = 1; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i]);
    const dateStr = parts[dateIdx];
    const outletStr = parts[outletIdx]?.toUpperCase() || '';
    
    // Find matching restaurant name
    const restaurantName = RESTAURANT_NAMES.find(n => outletStr.includes(n));
    if (!restaurantName) continue;

    const dateParts = dateStr.split(/[\/\-]/).map(Number);
    if (dateParts.length < 3) continue;
    
    // Assume M/D/YYYY
    const [m, d, y] = dateParts;
    const year = y < 100 ? 2000 + y : y;
    const date = new Date(year, m - 1, d);
    if (isNaN(date.getTime())) continue;

    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    const diff = date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    const mondayTime = monday.getTime();

    if (mondayTime >= currentMonday) continue;

    if (!values[restaurantName][mondayTime]) {
      values[restaurantName][mondayTime] = { kds: 0, sc: 0, missing: 0, fouls: 0 };
    }

    if (kdsIdx !== -1) values[restaurantName][mondayTime].kds += parseFloat(parts[kdsIdx]) || 0;
    if (scIdx !== -1) values[restaurantName][mondayTime].sc += parseFloat(parts[scIdx]) || 0;
    if (missingIdx !== -1) values[restaurantName][mondayTime].missing += parseFloat(parts[missingIdx]) || 0;
    if (foulIdx !== -1) values[restaurantName][mondayTime].fouls += parseFloat(parts[foulIdx]) || 0;
  }

  const allMondays = Array.from(new Set(Object.values(values).flatMap(v => Object.keys(v).map(Number)))).sort((a, b) => a - b);

  return { values, mondays: allMondays };
}

export function combineCSVData(trxCsv: string, salesCsv: string, penaltyCsv?: string): RestaurantData[] {
  const trxData = getValuesByWeek(trxCsv);
  const salesData = getValuesByWeek(salesCsv);
  const penaltyData = penaltyCsv ? getPenaltiesByWeek(penaltyCsv) : { values: {}, mondays: [] };

  // Get union of all mondays
  const allMondays = Array.from(new Set([...trxData.mondays, ...salesData.mondays, ...penaltyData.mondays])).sort((a, b) => a - b);
  
  return RESTAURANT_NAMES.map(name => {
    const weeklyTotals = allMondays.map(m => trxData.values[name]?.[m] || 0);
    const weeklySales = allMondays.map(m => salesData.values[name]?.[m] || 0);
    const weeklyPenalties = allMondays.map(m => penaltyData.values[name]?.[m] || { kds: 0, sc: 0, missing: 0, fouls: 0 });

    const wowChanges = weeklyTotals.slice(1).map((val, i) => {
      const prev = weeklyTotals[i];
      return prev === 0 ? 0 : ((val - prev) / prev) * 100;
    });

    const wowSalesChanges = weeklySales.slice(1).map((val, i) => {
      const prev = weeklySales[i];
      return prev === 0 ? 0 : ((val - prev) / prev) * 100;
    });

    return {
      name,
      zone: RESTAURANT_TO_ZONE[name] || 'Unknown',
      weeklyTotals,
      wowChanges,
      weeklySales,
      wowSalesChanges,
      weeklyPenalties
    };
  });
}

// Initial default data with proper structure for parser
export const INITIAL_CSV = `Outlet,FNN,,GWC,,HLV,,i12,,ION,,MBC,,NEX,,NOV,,NP,,OFC,,OGW,,OTH,,PSR,,RML,,SRN,,SV,,TPC,,VVC,,WGT,,WWP,,JWL,,STC,,DUN,
Date,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D,L,D
3/2/2026,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10
3/3/2026,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10
`;

export const PROCESSED_DATA = combineCSVData(INITIAL_CSV, INITIAL_CSV);
