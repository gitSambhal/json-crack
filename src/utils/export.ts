/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

export function downloadFile(filename: string, content: string, mimeType: string = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  return Promise.resolve();
}

export function jsonToCsv(data: any): string | null {
  let arrayData: any[] = [];
  if (Array.isArray(data)) {
    arrayData = data;
  } else if (typeof data === 'object' && data !== null) {
    // If object contains an array property, pick the first array
    const firstArray = Object.values(data).find((val) => Array.isArray(val));
    if (firstArray && Array.isArray(firstArray)) {
      arrayData = firstArray;
    } else {
      arrayData = [data];
    }
  }

  if (arrayData.length === 0) return null;

  // Extract all unique headers across elements
  const headersSet = new Set<string>();
  arrayData.forEach((row) => {
    if (typeof row === 'object' && row !== null) {
      Object.keys(row).forEach((key) => headersSet.add(key));
    }
  });

  const headers = Array.from(headersSet);
  if (headers.length === 0) return null;

  const csvRows: string[] = [];
  csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

  arrayData.forEach((row) => {
    if (typeof row !== 'object' || row === null) {
      csvRows.push(`"${String(row).replace(/"/g, '""')}"`);
    } else {
      const values = headers.map((h) => {
        const val = row[h];
        if (val === undefined || val === null) return '""';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
  });

  return csvRows.join('\n');
}
