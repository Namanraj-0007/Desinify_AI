const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/DashboardPage.tsx', 'utf-8');

// Fix: Add missing </div> before first </SpotlightCard> that follows a glass div
// The line is: "<div className=\"text-[10px] text-muted-foreground\">{stat.label}</div>\n                </SpotlightCard>"
// Must become: "...</div>\n                  </div>\n                </SpotlightCard>"

const target = `<div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </SpotlightCard>`;

const replacement = `<div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </SpotlightCard>`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('frontend/src/pages/DashboardPage.tsx', c, 'utf-8');
  const oD = (c.match(/<div[ >]/g) || []).length;
  const cD = (c.match(/<\/div>/g) || []).length;
  const oSC = (c.match(/<SpotlightCard/g) || []).length;
  const cSC = (c.match(/<\/SpotlightCard>/g) || []).length;
  console.log('Divs: ' + oD + ':' + cD + ' => ' + (oD === cD ? 'OK' : 'FAIL, need ' + (oD - cD) + ' more'));
  console.log('SpotlightCards: ' + oSC + ':' + cSC + ' => ' + (oSC === cSC ? 'OK' : 'FAIL'));
} else {
  console.log('Target pattern NOT FOUND');
  // Find the first </SpotlightCard>
  const idx = c.indexOf('</SpotlightCard>');
  console.log('Context around first </SpotlightCard>:');
  console.log(c.substring(Math.max(0, idx - 300), idx + 50));
}
