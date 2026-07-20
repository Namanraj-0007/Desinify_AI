const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/DashboardPage.tsx', 'utf-8');

// Fix the missing </div> closing the outer flex div in project items
// Current nesting issue: <div flex...> > <div flex...gap-3> > <div h-9...> </div> <div min-w-0> ... </div> <Button> </Button>
// Missing: </div> to close the <div flex...gap-3> before <Button>
const target1 = '<div className="text-xs text-muted-foreground">Created {new Date(p.created_at).toLocaleDateString()}</div>';
const target2 = '</div>';
const target3 = '<Button size="sm" variant="ghost"';

// Find the exact occurrence at the project item section
const idx1 = c.indexOf(target1);
if (idx1 >= 0) {
  const segment = c.substring(idx1);
  const idx2 = segment.indexOf(target2);
  const idx3 = segment.indexOf(target3);
  
  if (idx2 >= 0 && idx3 >= 0) {
    const beforeClose = segment.substring(0, idx2 + target2.length);
    const afterClose = segment.substring(idx2 + target2.length);
    
    // Rebuild with an extra </div>
    const fixed = beforeClose + '\n                      </div>' + afterClose;
    c = c.substring(0, idx1) + fixed;
    
    fs.writeFileSync('frontend/src/pages/DashboardPage.tsx', c, 'utf-8');
    
    const oD = (c.match(/<div[ >]/g) || []).length;
    const cD = (c.match(/<\/div>/g) || []).length;
    console.log('Fix applied. Divs: ' + oD + ':' + cD + ' => ' + (oD === cD ? 'OK' : 'STILL NEEDS ' + (oD - cD) + ' more'));
  } else {
    console.log('Could not find target2/target3 markers');
    console.log('idx2=' + idx2 + ' idx3=' + idx3);
    console.log('Segment after idx1: ' + segment.substring(0, 200));
  }
} else {
  console.log('target1 not found in file');
}
