import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { Operation } from './types';

/**
 * Flexible header matching — banking exports use various column names.
 * We try multiple French/English variants.
 */
const HEADER_MAP: Record<keyof Operation, string[]> = {
  date: ['date', 'date_operation', 'date opération', 'jour'],
  agence: ['agence', 'branch', 'bureau', 'site'],
  canal: ['canal', 'channel', 'mode', 'voie'],
  type: ['type', 'type_operation', 'type opération', 'nature'],
  montant: ['montant', 'amount', 'somme', 'valeur'],
  statut: ['statut', 'status', 'état', 'etat'],
  duree_traitement: ['duree', 'durée', 'duration', 'temps_traitement', 'duree_traitement'],
  client_id: ['client_id', 'client', 'id_client', 'customer_id'],
};

function findColumn(headers: string[], candidates: string[]): string | null {
  const normalized = headers.map(h => h.toLowerCase().trim());
  for (const candidate of candidates) {
    const idx = normalized.indexOf(candidate.toLowerCase());
    if (idx !== -1) return headers[idx];
  }
  return null;
}

function parseRow(row: Record<string, any>, columnMap: Record<string, string>): Operation | null {
  try {
    const dateStr = row[columnMap.date];
    let date: Date;
    if (dateStr instanceof Date) {
      date = dateStr;
    } else if (typeof dateStr === 'number') {
      // Excel serial date
      date = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
    } else {
      date = new Date(dateStr);
    }
    if (isNaN(date.getTime())) return null;

    const montantRaw = row[columnMap.montant];
    const montant = typeof montantRaw === 'number' 
      ? montantRaw 
      : parseFloat(String(montantRaw).replace(/[^\d.,-]/g, '').replace(',', '.'));
    if (isNaN(montant)) return null;

    return {
      date,
      agence: String(row[columnMap.agence] ?? 'N/A'),
      canal: (row[columnMap.canal] ?? 'Guichet') as Operation['canal'],
      type: (row[columnMap.type] ?? 'Virement') as Operation['type'],
      montant,
      statut: (row[columnMap.statut] ?? 'Validée') as Operation['statut'],
      duree_traitement: Number(row[columnMap.duree_traitement] ?? 0),
      client_id: String(row[columnMap.client_id] ?? ''),
    };
  } catch {
    return null;
  }
}

function buildColumnMap(headers: string[]): Record<string, string> | null {
  const map: Record<string, string> = {};
  for (const [field, candidates] of Object.entries(HEADER_MAP)) {
    const col = findColumn(headers, candidates);
    if (!col) {
      console.warn(`Column not found for field: ${field}`);
      // Permissive: keep going, parseRow will fallback
    } else {
      map[field] = col;
    }
  }
  return map;
}

export async function parseCSV(file: File): Promise<Operation[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const headers = results.meta.fields ?? [];
        const colMap = buildColumnMap(headers);
        if (!colMap) return reject(new Error('Format CSV invalide'));
        const ops = (results.data as Record<string, any>[])
          .map(r => parseRow(r, colMap))
          .filter((o): o is Operation => o !== null);
        resolve(ops);
      },
      error: reject,
    });
  });
}

export async function parseXLSX(file: File): Promise<Operation[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null });
  if (rows.length === 0) return [];
  const headers = Object.keys(rows[0]);
  const colMap = buildColumnMap(headers);
  if (!colMap) throw new Error('Format XLSX invalide');
  return rows
    .map(r => parseRow(r, colMap))
    .filter((o): o is Operation => o !== null);
}

export async function parseFile(file: File): Promise<Operation[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return parseCSV(file);
  if (ext === 'xlsx' || ext === 'xls') return parseXLSX(file);
  throw new Error(`Format non supporté: ${ext}`);
}
