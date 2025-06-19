import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export type AllowedFileExtension = 'txt' | 'csv' | 'xes' | 'json' | 'xlsx';

export interface FileMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  lastModified: number;
}

export interface PreviewData {
  headers?: string[];
  rows?: string[][];
  totalRows?: number;
  events?: any[]; // For XES or XES-like structures
  totalEvents?: number;
  sheetName?: string; // For XLSX
}

export interface ParsedData {
  type: AllowedFileExtension | 'unknown';
  content: string;
  metadata?: FileMetadata;
  preview?: PreviewData;
}

export const parseFile = (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase() as AllowedFileExtension;

    const metadata: FileMetadata = {
      fileName,
      fileSize: file.size,
      fileType: file.type,
      lastModified: file.lastModified,
    };

    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        let parsedData: ParsedData = { type: 'unknown', content, metadata, preview: {} };

        switch (fileExtension) {
          case 'txt':
            parsedData.type = 'txt';
            break;
          case 'csv':
            parsedData.type = 'csv';
            const csvResult = Papa.parse(content, { header: true, skipEmptyLines: true });
            parsedData.preview = {
              headers: csvResult.meta.fields,
              rows: csvResult.data.map((row: any) => csvResult.meta.fields?.map(field => row[field]) || []),
              totalRows: csvResult.data.length,
            };
            // For CSV, content can remain as is, or be the stringified version of parsed data if needed elsewhere
            break;
          case 'xes':
            // Basic XES handling: treat as text, try to parse for preview
            // A more robust XES parser would be needed for full functionality
            parsedData.type = 'xes';
            try {
              // This is a placeholder for actual XES parsing.
              // For now, we'll just count lines or look for common tags for a rough event count.
              const eventMatches = content.match(/<event>/g);
              parsedData.preview = {
                totalEvents: eventMatches ? eventMatches.length : 0,
                // A real XES parser would extract actual events for preview
                events: [{ concept_name: 'Sample Event (XES Preview Placeholder)', case_id: '1' }] 
              };
            } catch (e) {
              console.warn('Could not parse XES for preview:', e);
            }
            break;
          case 'json':
            parsedData.type = 'json';
            try {
              const jsonObj = JSON.parse(content);
              // For preview, we might want to show if it's an array, object, etc.
              // For simplicity, content remains the raw string.
              // If it's an array of objects, we could count items for 'totalRows' like concept
              if (Array.isArray(jsonObj)) {
                parsedData.preview = { totalRows: jsonObj.length };
              }
            } catch (e) {
              reject(new Error('Invalid JSON file.'));
              return;
            }
            break;
          case 'xlsx':
            parsedData.type = 'xlsx';
            const workbook = XLSX.read(content, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
            
            parsedData.preview = {
              headers: jsonData[0] || [],
              rows: jsonData.slice(1),
              totalRows: jsonData.length -1,
              sheetName: firstSheetName,
            };
            // For content, we can convert the first sheet to CSV string for consistency
            parsedData.content = XLSX.utils.sheet_to_csv(worksheet);
            break;
          default:
            parsedData.type = 'unknown';
            reject(new Error('Unsupported file type.'));
            return;
        }
        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);

    if (fileExtension === 'xlsx') reader.readAsBinaryString(file);
    else reader.readAsText(file);
  });
};