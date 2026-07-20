const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/DashboardPage.tsx', 'utf-8');

// Fix 1: Add missing </div> in stats cards section (3 occurances may exist - find first one)
// The stats cards inside sidebar have <SpotlightCard> > <div> but no </div> before </SpotlightCard>
const statsPattern = '<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                </SpotlightCard>';
const statsFix = '<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                  </div>\n                </SpotlightCard>';

// Only fix the FIRST occurrence (statsCards.slice(0,2) section)
let count = 0;
c = c.replace(statsPattern, (match) => {
  count++;
  return count <= 2 ? statsFix : match;
});

fs.writeFileSync('frontend/src/pages/DashboardPage.tsx', c, 'utf-8');

const oD = (c.match(/<div[ >]/g) || []).length;
const cD = (c.match(/<\/div>/g) || []).length;
const oSC = (c.match(/<SpotlightCard/g) || []).length;
const cSC = (c.match(/<\/SpotlightCard>/g) || []).length;
console.log('Divs: ' + oD + ':' + cD + ' => ' + (oD === cD ? 'OK' : 'FAIL'));
console.log('SpotlightCards: ' + oSC + ':' + cSC + ' => ' + (oSC === cSC ? 'OK' : 'FAIL'));
