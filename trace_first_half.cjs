const fs = require('fs');

const code = fs.readFileSync('src/components/CsvBatchPrinter.tsx', 'utf8');
const lines = code.split('\n');

let braceDepth = 1; // Base depth is 1 for the CsvBatchPrinter component

for (let lineIdx = 640; lineIdx < 1140; lineIdx++) {
  const line = lines[lineIdx];
  const prevBrace = braceDepth;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '{') braceDepth++;
    else if (char === '}') braceDepth--;
  }

  if (braceDepth <= 0 && prevBrace > 0) {
    console.log(`Error: Braces reached 0/negative on line ${lineIdx + 1}: ${line.trim()}`);
  }
}
console.log("Scan complete.");
