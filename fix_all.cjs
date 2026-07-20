const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/DashboardPage.tsx', 'utf-8');
const lines = content.split('\n');

// Fix 1: Line 150 - stats card: the glass div at line 150 is not closed before </SpotlightCard>
// Current: <div class="glass..."> ... <div>text</div> </SpotlightCard>
// Fix: add </div> after the text div
for (let i = 145; i < 160; i++) {
  if (lines[i].includes('glass rounded-xl p-3 text-center')) {
    // Find the </SpotlightCard> that follows
    for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
      if (lines[j].includes('</SpotlightCard>') && !lines[j-1].includes('</div>')) {
        lines.splice(j, 0, '                  </div>');
        console.log('Fix 1 at line', j+1);
        break;
      }
    }
  }
}

// Fix 2: Figma Integration glass div - same pattern
for (let i = 155; i < 200; i++) {
  if (lines[i].includes('glass rounded-2xl p-5 space-y-4')) {
    for (let j = i + 1; j < Math.min(i + 40, lines.length); j++) {
      if (lines[j].includes('</SpotlightCard>') && !lines[j-1].includes('</div>')) {
        lines.splice(j, 0, '              </div>');
        console.log('Fix 2 at line', j+1);
        break;
      }
    }
  }
}

// Fix 3: Create project glass div - same pattern
for (let i = 210; i < 240; i++) {
  if (lines[i] && lines[i].includes('glass rounded-2xl p-5') && 
      !lines[i].includes('space-y-4') && !lines[i].includes('overflow')) {
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      if (lines[j] && lines[j].includes('</SpotlightCard>') && !lines[j-1].includes('</div>')) {
        lines.splice(j, 0, '              </div>');
        console.log('Fix 3 at line', j+1);
        break;
      }
    }
  }
}

// Fix 4: Projects list glass div
for (let i = 220; i < 270; i++) {
  if (lines[i] && lines[i].includes('glass rounded-2xl overflow-hidden')) {
    for (let j = i + 1; j < Math.min(i + 40, lines.length); j++) {
      if (lines[j] && lines[j].includes('</SpotlightCard>') && !lines[j-1].includes('</div>')) {
        lines.splice(j, 0, '              </div>');
        console.log('Fix 4 at line', j+1);
        break;
      }
    }
  }
}

// Fix 5: Stats card bottom - same as Fix 1 but bottom area
for (let i = 340; i < lines.length; i++) {
  if (lines[i] && lines[i].includes('glass rounded-xl p-3 text-center')) {
    for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
      if (lines[j] && lines[j].includes('</SpotlightCard>') && !lines[j-1].includes('</div>')) {
        lines.splice(j, 0, '                  </div>');
        console.log('Fix 5 at line', j+1);
        break;
      }
    }
  }
}

// Fix 6: Figma Designs card
for (let i = 155; i < 220; i++) {
  if (lines[i] && lines[i].includes('glass rounded-2xl p-4') && !lines[i].includes('glass rounded-2xl p-5')) {
    for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
      if (lines[j] && lines[j].includes('</SpotlightCard>') && !lines[j-1].includes('</div>')) {
        lines.splice(j, 0, '                </div>');
        console.log('Fix 6 at line', j+1);
        break;
      }
    }
  }
}

// Write back
const finalContent = lines.join('\n');
fs.writeFileSync('frontend/src/pages/DashboardPage.tsx', finalContent, 'utf-8');

const oD = (finalContent.match(/<div[ >]/g) || []).length;
const cD = (finalContent.match(/<\/div>/g) || []).length;
const oSC = (finalContent.match(/<SpotlightCard/g) || []).length;
const cSC = (finalContent.match(/<\/SpotlightCard>/g) || []).length;
console.log(`\nFinal: Divs ${oD}:${cD} => ${oD === cD ? 'OK' : 'FAIL'}`);
console.log(`SpotlightCards ${oSC}:${cSC} => ${oSC === cSC ? 'OK' : 'FAIL'}`);
