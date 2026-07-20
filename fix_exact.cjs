const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/DashboardPage.tsx', 'utf-8');
let lines = c.split('\n');

// Fix 1: Line 150 - add </div> before line 154 </SpotlightCard> (stats card)
if (lines[149].includes('glass rounded-xl p-3 text-center') && lines[153].includes('</SpotlightCard>')) {
  lines.splice(154, 0, '                  </div>');
  console.log('Fix 1 applied: added </div> at line 154');
}

// Fix 2: Line 159 - add </div> before line 193 </SpotlightCard> (Figma Integration)
if (lines[158].includes('glass rounded-2xl p-5 space-y-4')) {
  // Find the </SpotlightCard> that closes this
  for (let i = 159; i < lines.length; i++) {
    if (lines[i].includes('</SpotlightCard>')) {
      lines.splice(i, 0, '              </div>');
      console.log('Fix 2 applied: added </div> before line ' + (i + 1));
      break;
    }
  }
}

// Fix 3: Line 214 - add </div> before line 219 </SpotlightCard> (Create Project)
if (lines[213].includes('glass rounded-2xl p-5')) {
  for (let i = 214; i < lines.length; i++) {
    if (lines[i].includes('</SpotlightCard>')) {
      lines.splice(i, 0, '              </div>');
      console.log('Fix 3 applied: added </div> before line ' + (i + 1));
      break;
    }
  }
}

// Fix 4: Lines 226-257 - add </div> for glass div in Projects list
if (lines[225].includes('glass rounded-2xl overflow-hidden')) {
  for (let i = 226; i < lines.length; i++) {
    if (lines[i].includes('</SpotlightCard>')) {
      lines.splice(i, 0, '              </div>');
      console.log('Fix 4 applied: added </div> before line ' + (i + 1));
      break;
    }
  }
}

// Fix 5: Line 244 - min-w-0 div missing closing </div>
if (lines[243].includes('min-w-0') && !lines[243].includes('flex')) {
  // Check that the next lines don't have a closing </div> for this
  // The div structure is:
  // <div className="min-w-0"> (line 243)
  //   <div className="font-medium ...">...</div> (line 244)
  //   <div className="text-xs ...">...</div> (line 245)
  // Then line 246 starts <Button ...>
  // We need to insert </div> before the Button
  for (let i = 244; i < lines.length; i++) {
    if (lines[i].includes('<Button')) {
      lines.splice(i, 0, '                          </div>');
      console.log('Fix 5 applied: added </div> before line ' + (i + 1));
      break;
    }
  }
}

// Fix 6: Line 262 (stats bottom) - same as fix 1
// Need to find it after the projects section
let statsBottomIdx = -1;
for (let i = 260; i < lines.length; i++) {
  if (lines[i] && lines[i].includes('glass rounded-xl p-3 text-center')) {
    statsBottomIdx = i;
    break;
  }
}
if (statsBottomIdx >= 0) {
  for (let i = statsBottomIdx + 1; i < lines.length; i++) {
    if (lines[i] && lines[i].includes('</SpotlightCard>')) {
      lines.splice(i, 0, '                  </div>');
      console.log('Fix 6 applied: added </div> before line ' + (i + 1));
      break;
    }
  }
}

c = lines.join('\n');
fs.writeFileSync('frontend/src/pages/DashboardPage.tsx', c, 'utf-8');

const oD = (c.match(/<div[ >]/g) || []).length;
const cD = (c.match(/<\/div>/g) || []).length;
console.log('Divs: ' + oD + ':' + cD + ' => ' + (oD === cD ? 'OK! Build should pass' : 'FAIL (' + (oD - cD) + ' more needed)'));
