import Papa from 'papaparse';

export interface ParsedData {
  type: 'csv' | 'xes' | 'text';
  content: string;
  preview?: {
    headers?: string[];
    rows?: string[][];
    totalRows?: number;
    events?: XESEvent[];
    totalEvents?: number;
  };
  metadata?: {
    fileSize: number;
    fileName: string;
  };
}

export interface XESEvent {
  concept_name?: string;
  lifecycle_transition?: string;
  timestamp?: string;
  resource?: string;
  case_id?: string;
  [key: string]: any;
}

export interface XESTrace {
  case_id: string;
  events: XESEvent[];
}

export const parseFile = async (file: File): Promise<ParsedData> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  const baseData: ParsedData = {
    type: 'text',
    content: '',
    metadata: {
      fileSize: file.size,
      fileName: file.name
    }
  };

  if (fileExtension === 'csv') {
    return parseCSV(file, baseData);
  } else if (fileExtension === 'xes') {
    return parseXES(file, baseData);
  } else {
    // Default text parsing
    const text = await file.text();
    return {
      ...baseData,
      content: text,
      type: 'text'
    };
  }
};

const parseCSV = async (file: File, baseData: ParsedData): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as any[];
        
        // Create a text representation for processing
        const csvText = Papa.unparse(results.data, { header: true });
        
        resolve({
          ...baseData,
          type: 'csv',
          content: csvText,
          preview: {
            headers,
            rows: rows.slice(0, 10).map(row => headers.map(header => row[header] || '')),
            totalRows: rows.length
          }
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
};

const parseXES = async (file: File, baseData: ParsedData): Promise<ParsedData> => {
  try {
    const text = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid XES XML format');
    }

    const traces = xmlDoc.querySelectorAll('trace');
    const events: XESEvent[] = [];
    let totalEvents = 0;

    traces.forEach((trace, traceIndex) => {
      const caseId = getXESAttributeValue(trace, 'concept:name') || `case_${traceIndex}`;
      const traceEvents = trace.querySelectorAll('event');
      
      traceEvents.forEach(event => {
        const eventData: XESEvent = {
          case_id: caseId,
          concept_name: getXESAttributeValue(event, 'concept:name'),
          lifecycle_transition: getXESAttributeValue(event, 'lifecycle:transition'),
          timestamp: getXESAttributeValue(event, 'time:timestamp'),
          resource: getXESAttributeValue(event, 'org:resource')
        };

        // Add any additional attributes
        const attributes = event.querySelectorAll('string, date, int, float, boolean');
        attributes.forEach(attr => {
          const key = attr.getAttribute('key');
          const value = attr.getAttribute('value') || attr.textContent;
          if (key && !eventData[key]) {
            eventData[key] = value;
          }
        });

        events.push(eventData);
        totalEvents++;
      });
    });

    // Create a text representation for processing
    const xesText = createXESTextRepresentation(events);

    return {
      ...baseData,
      type: 'xes',
      content: xesText,
      preview: {
        events: events.slice(0, 20),
        totalEvents
      }
    };
  } catch (error) {
    throw new Error(`XES parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const getXESAttributeValue = (element: Element, key: string): string | undefined => {
  const attr = element.querySelector(`string[key="${key}"], date[key="${key}"], int[key="${key}"], float[key="${key}"], boolean[key="${key}"]`);
  return attr?.getAttribute('value') || attr?.textContent || undefined;
};

const createXESTextRepresentation = (events: XESEvent[]): string => {
  const lines = ['Process Mining Event Log Summary:'];
  
  // Group events by case
  const caseGroups = events.reduce((acc, event) => {
    const caseId = event.case_id || 'unknown';
    if (!acc[caseId]) acc[caseId] = [];
    acc[caseId].push(event);
    return acc;
  }, {} as Record<string, XESEvent[]>);

  lines.push(`Total Cases: ${Object.keys(caseGroups).length}`);
  lines.push(`Total Events: ${events.length}`);
  lines.push('');

  // Add sample traces
  Object.entries(caseGroups).slice(0, 5).forEach(([caseId, caseEvents]) => {
    lines.push(`Case: ${caseId}`);
    caseEvents.forEach(event => {
      const activity = event.concept_name || 'Unknown Activity';
      const timestamp = event.timestamp ? new Date(event.timestamp).toLocaleString() : 'No timestamp';
      const resource = event.resource ? ` (${event.resource})` : '';
      lines.push(`  - ${activity} at ${timestamp}${resource}`);
    });
    lines.push('');
  });

  return lines.join('\n');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};