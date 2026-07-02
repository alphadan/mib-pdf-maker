const fs = require("fs");

const code = fs.readFileSync("src/components/CsvBatchPrinter.tsx", "utf8");
const lines = code.split("\n");

let braceDepth = 0;
let parenDepth = 0;

for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
  const line = lines[lineIdx];

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === "{") braceDepth++;
    else if (char === "}") braceDepth--;
    else if (char === "(") parenDepth++;
    else if (char === ")") parenDepth--;

    if (braceDepth < 0) {
      console.log(
        `Error: Extra closing brace } on line ${lineIdx + 1} at col ${i + 1}: ${line.trim()}`,
      );
      braceDepth = 0;
    }
    if (parenDepth < 0) {
      console.log(
        `Error: Extra closing paren ) on line ${lineIdx + 1} at col ${i + 1}: ${line.trim()}`,
      );
      parenDepth = 0;
    }
  }
}

console.log("Scan complete.");
