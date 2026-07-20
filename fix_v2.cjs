const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/DashboardPage.tsx', 'utf-8');
let lines = c.split('\n');

// Track which lines to modify
const fixes = [];

// Scan for missing </div> before </SpotlightCard>
// Pattern: a line with glass rounded-xl or glass rounded-2xl opens a div
// then later </SpotlightCard> appears without a matching </div> right before it
let insideFigmaIntegration = false;
let figmaIntEndLine = -1;
let insideFigmaDesigns = false;
let figmaDsgnEndLine = -1;
let createProjEndLine = -1;
let projectsEndLine = -1;
let minw0EndLine = -1;

for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  
  // Track Figma Integration card
  if (l.includes('glass rounded-2xl p-5 space-y-4') && l.includes('Figma') === false) {
    insideFigmaIntegration = true;
    continue;
  }
  if (insideFigmaIntegration && l.includes('</SpotlightCard>')) {
    figmaIntEndLine = i;
    insideFigmaIntegration = false;
  }
  
  // Track Figma Designs card
  if (l.includes('Figma Designs')) {
    insideFigmaDesigns = true;
  }
  if (insideFigmaDesigns && l.includes('</SpotlightCard>')) {
    figmaDsgnEndLine = i;
    insideFigmaDesigns = false;
  }
  
  // Track Create project SpotlightCard
  if (l.includes('glass rounded-2xl p-5') && lines[i+1] && lines[i+1].includes('flex flex-col')) {
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].includes('</SpotlightCard>')) {
        createProjEndLine = j;
        break;
      }
    }
  }
  
  // Track Projects list SpotlightCard
  if (l.includes('glass rounded-2xl overflow-hidden')) {
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].includes('</SpotlightCard>')) {
        projectsEndLine = j;
        break;
      }
    }
  }
  
  // Find min-w-0 div with missing </div> before Button
  if (l.includes('className="min-w-0"') && !l.includes('flex')) {
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      if (lines[j].includes('<Button')) {
        minw0EndLine = j;
        break;
      }
    }
  }
}

// Apply fixes in reverse order (to keep line numbers valid)
console.log('Figma Integration end:', figmaIntEndLine);
console.log('Figma Designs end:', figmaDsgnEndLine);
console.log('Create Project end:', createProjEndLine);
console.log('Projects end:', projectsEndLine);
console.log('minw-0 end:', minw0EndLine);
