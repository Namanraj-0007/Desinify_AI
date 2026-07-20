const fs = require('fs');
let lines = fs.readFileSync('frontend/src/pages/DashboardPage.tsx', 'utf-8').split('\n');

// Fix 1: Line 150 - stats card, add </div> at line 154 (before </SpotlightCard>)
// The glass div at line 150 needs closing before the </SpotlightCard>
// Line 153 has the closing stat.label div, line 154 is </SpotlightCard>
// Need to insert:                   </div>
// So the glass div closes properly
if (lines[153].includes('</SpotlightCard>')) {
  lines.splice(154, 0, '                  </div>');
  console.log('Fix 1: added </div> before line 154 (was 154, now 155)');
}

// Fix 2: Line 160 - Figma Integration, add </div> (inner) and the outer glass needs closing
// After the inner space-y-3 div closes, we need to close the glass div
// Currently: line 193 has </SpotlightCard>, line 192 has </div>
// We need to insert </div> before line 193
// But line 192 already has </div> (closing the space-y-3 inner div)
// The glass div at line 160 needs its own </div> too
// So we need: </div> (close glass) then </SpotlightCard>
for (let i = 160; i < lines.length; i++) {
  if (lines[i].includes('</SpotlightCard>')) {
    // Check if the line before has </div> but there's still a gap
    if (!lines[i-1].trim().includes('</div>')) {
      lines.splice(i, 0, '              </div>');
      console.log('Fix 2: added </div> before line ' + (i+1));
    }
    break;
  }
}

// Fix 3: Line 215 - Create project, add </div> before </SpotlightCard>
for (let i = 215; i < lines.length; i++) {
  if (lines[i].includes('</SpotlightCard>')) {
    if (!lines[i-1].trim().includes('</div>')) {
      lines.splice(i, 0, '              </div>');
      console.log('Fix 3: added </div> before line ' + (i+1));
    }
    break;
  }
}

// Fix 4: Line 227 - Projects list card, depth=2, needs 2 </div>s before </SpotlightCard>
for (let i = 227; i < lines.length; i++) {
  if (lines[i].includes('</SpotlightCard>')) {
    // Depth was 2, meaning 2 missing </div>
    // Check what's currently before
    if (!lines[i-1].trim().includes('</div>')) {
      lines.splice(i, 0, '              </div>');
      console.log('Fix 4a: added 1st </div> before line ' + (i+1));
      // After adding, the index shifts by 1
    }
    break;
  }
}
// Run again because fix 4a shifted indices
for (let i = 227; i < lines.length; i++) {
  if (lines[i].includes('</SpotlightCard>')) {
    if (!lines[i-1].trim().includes('</div>')) {
      lines.splice(i, 0, '              </div>');
      console.log('Fix 4b: added 2nd </div> before line ' + (i+1));
    }
    break;
  }
}

// Fix 5: Line 245 - min-w-0 div without closing </div>
// The <div className="min-w-0"> at line 245 is not closed
// It currently opens a div but the next closing </div> closes the parent
// Need to add </div> after line 247 (the Created ... div)
// Then line 248 currently has </div> which closes the parent
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '</div>' && i > 245 && i < 260) {
    // This closes the parent div, we need to close min-w-0 first
    let parentCloseIdx = i;
    // Actually, the structure should be:
    // <div className="min-w-0"> (line 245)
    //   ... children ...
    // </div> (NEW)
    // </div> (existing - closes the parent)
    // Let me just replace the first </div> after line 245 with </div>
    if (!lines[i-1].trim().includes('</div>')) {
      lines[i] = lines[i].replace('</div>', '</div>\n                          </div>');
      console.log('Fix 5: fixed min-w-0 at line ' + (i+1));
    }
    break;
  }
}

fs.writeFileSync('frontend/src/pages/DashboardPage.tsx', lines.join('\n'), 'utf-8');

// Verify
content = fs.readFileSync('frontend/src/pages/DashboardPage.tsx', 'utf-8');
const oD = (content.match(/<div[ >]/g) || []).length;
const cD = (content.match(/<\/div>/g) || []).length;
console.log('Divs: ' + oD + ':' + cD + ' => ' + (oD === cD ? 'OK!' : 'FAIL (' + (oD - cD) + ' more needed)'));
