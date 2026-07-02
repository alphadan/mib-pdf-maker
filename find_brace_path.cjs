const fs = require('fs');

const code = fs.readFileSync('src/components/CsvBatchPrinter.tsx', 'utf8');
const lines = code.split('\n');

const stack = [];

for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
  const line = lines[lineIdx];
  for (let colIdx = 0; colIdx < line.length; colIdx++) {
    const char = line[colIdx];
    if (char === '{') {
      stack.push({ line: lineIdx + 1, col: colIdx + 1, text: line.trim().substring(0, 40) });
    } else if (char === '}') {
      if (stack.length === 0) {
        console.log(`Error: Extra close brace } on line ${lineIdx + 1}, col ${colIdx + 1}: ${line.trim()}`);
      } else {
        const open = stack.pop();
        // If we are closing the main function too early, print it!
        if (stack.length === 0 && lineIdx < lines.length - 1) {
          console.log(`ALERT: Main function closed on line ${lineIdx + 1} by } matching { on line ${open.line}: ${open.text}`);
        }
      }
    }
  }
}

if (stack.length > 0) {
  console.log("\nUnclosed braces:");
  stack.forEach(b => console.log(`Unclosed { on line ${b.line}, col ${b.col}: ${b.text}`));
} else {
  console.log("\nAll braces matched successfully.");
}
