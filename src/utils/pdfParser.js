import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
} catch (e) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs';
}

/**
 * Extracts plain text from a PDF file client-side.
 * @param {File} file - The uploaded PDF file.
 * @returns {Promise<string>} The extracted text content.
 */
export const extractTextFromPDF = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const typedArray = new Uint8Array(event.target.result);
        const loadingTask = pdfjsLib.getDocument({ data: typedArray });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Sort items by transform coordinates to maintain natural reading order (top to bottom, left to right)
          // transform[4] is X coordinate, transform[5] is Y coordinate
          const items = textContent.items;
          if (items.length === 0) continue;

          // Simple line assembly based on Y coordinate matching
          const lineMap = {};
          
          for (const item of items) {
            if (!item.str.trim()) continue;
            
            // round Y coordinate to group items on roughly the same line
            // Some PDFs have slight variations (e.g., subscript or superscript), round to nearest 3 units
            const y = Math.round(item.transform[5] / 3) * 3;
            
            if (!lineMap[y]) {
              lineMap[y] = [];
            }
            lineMap[y].push(item);
          }
          
          // Sort lines descending (top of the page has higher Y in PDF coordinate space)
          const sortedYs = Object.keys(lineMap).map(Number).sort((a, b) => b - a);
          
          let pageText = '';
          for (const y of sortedYs) {
            // Sort items in the line from left to right (X coordinate ascending)
            const lineItems = lineMap[y].sort((a, b) => a.transform[4] - b.transform[4]);
            const lineStr = lineItems.map(item => item.str).join(' ');
            pageText += lineStr + '\n';
          }
          
          fullText += pageText + '\n';
        }

        if (!fullText.trim()) {
          reject(new Error('This PDF appears to be empty or scanned (image-only). Please upload a text-searchable PDF or copy-paste your resume text.'));
        } else {
          resolve(fullText.trim());
        }
      } catch (error) {
        reject(new Error('Failed to parse PDF. Details: ' + error.message));
      }
    };
    reader.onerror = (error) => {
      reject(new Error('File reading error: ' + error.message));
    };
    reader.readAsArrayBuffer(file);
  });
};
