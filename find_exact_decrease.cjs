const fs = require('fs');

const code = fs.readFileSync('src/components/CsvBatchPrinter.tsx', 'utf8');
const lines = code.split('\n');

let braceDepth = 0; // component level is 1, so inside downloadSampleCSV it should be 2. Let's trace from line 1.

for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
  const line = lines[lineIdx];
  const prevBrace = braceDepth;

  for (let colIdx = 0; colIdx < line.length; colIdx++) {
    const char = line[colIdx];
    if (char === '{') braceDepth++;
    else if (char === '}') braceDepth--;
  }

  if (lineIdx >= 297 && lineIdx <= 845) {
    console.log(`Line ${lineIdx + 1}: ${line.trim().substring(0, 50)}  | Depth: ${braceDepth}`);
  }
}
