const fs = require('fs');

function getForms(inf) {
  let wir = inf;
  let sie = inf;
  let ihr = "";
  
  const stem = inf.endsWith('en') ? inf.slice(0, -2) : inf.slice(0, -1);
  
  if (inf === 'sein') { wir = 'sind'; ihr = 'seid'; sie = 'sind'; }
  else if (inf === 'haben') { ihr = 'habt'; }
  else if (inf === 'werden') { ihr = 'werdet'; }
  else if (inf === 'wissen') { ihr = 'wisst'; }
  else if (inf === 'tun') { ihr = 'tut'; }
  else {
    if (stem.endsWith('d') || stem.endsWith('t')) {
      ihr = stem + 'et';
    } else {
      ihr = stem + 't';
    }
  }
  
  return { wir, ihr, sie };
}

function processFile(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    if (line.trim().startsWith('{ id:') && line.includes('infinitive:')) {
      const infMatch = line.match(/infinitive:\s*'([^']+)'/);
      if (infMatch) {
        const inf = infMatch[1];
        const forms = getForms(inf);
        
        // Find where to insert. After presentEr
        const insertAfter = /presentEr:\s*'[^']+',\s*/;
        const match = line.match(insertAfter);
        if (match) {
          const insertIdx = match.index + match[0].length;
          const toInsert = `presentWir: '${forms.wir}', presentIhr: '${forms.ihr}', presentSie: '${forms.sie}', `;
          return line.slice(0, insertIdx) + toInsert + line.slice(insertIdx);
        }
      }
    }
    return line;
  });
  
  fs.writeFileSync(file, newLines.join('\n'));
}

processFile('src/data/irregular-verbs-1.ts');
processFile('src/data/irregular-verbs-2.ts');
console.log('Done');
