const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/DashboardPage.tsx', 'utf-8');

// Find every instance of glass rounded-xl pattern that's missing </div>
// The pattern: a div with glass class, then 3 inner divs, then directly </SpotlightCard>
const pattern = `<div className="glass rounded-xl p-3 text-center">
                    <div className="text-lg">{stat.icon}</div>
                    <div className="text-lg font-semibold font-display mt-1">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </SpotlightCard>`;

const replacement = `<div className="glass rounded-xl p-3 text-center">
                    <div className="text-lg">{stat.icon}</div>
                    <div className="text-lg font-semibold font-display mt-1">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </SpotlightCard>`;

if (c.includes(pattern)) {
  c = c.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
  fs.writeFileSync('frontend/src/pages/DashboardPage.tsx', c, 'utf-8');
  const oD = (c.match(/<div[ >]/g) || []).length;
  const cD = (c.match(/<\/div>/g) || []).length;
  console.log('Fixed! Divs: ' + oD + ':' + cD + ' => ' + (oD === cD ? 'OK' : 'FAIL'));
} else {
  console.log('Pattern NOT found');
  // Let's find all </SpotlightCard>
  let idx = -1;
  for (let i = 0; i < 7; i++) {
    idx = c.indexOf('</SpotlightCard>', idx + 1);
    console.log('\n--- </SpotlightCard> #' + (i+1) + ' at ' + idx + ' ---');
    console.log(c.substring(Math.max(0, idx - 350), idx + 50));
  }
}
