const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/DashboardPage.tsx', 'utf-8');

const countOD = () => (content.match(/<div /g) || []).length + (content.match(/<div>/g) || []).length + (content.match(/<div class/g) || []).length;
const countCD = () => (content.match(/<\/div>/g) || []).length;

console.log('Before: <div: ' + countOD() + ', </div>: ' + countCD() + ', diff: ' + (countOD() - countCD()));

// Fix 1: min-w-0 div - add missing closing </div>
const old1 = '<div className="min-w-0">\n                            <div className="font-medium text-sm truncate">{p.name}</div>\n                            <div className="text-xs text-muted-foreground">Created {new Date(p.created_at).toLocaleDateString()}</div>\n                        </div>';
const new1 = '<div className="min-w-0">\n                            <div className="font-medium text-sm truncate">{p.name}</div>\n                            <div className="text-xs text-muted-foreground">Created {new Date(p.created_at).toLocaleDateString()}</div>\n                          </div>\n                        </div>';
if (content.includes(old1)) {
  content = content.replace(old1, new1);
  console.log('Fix 1 applied: min-w-0 div');
} else {
  console.log('Fix 1 NOT FOUND (might already be fixed)');
}

// Fix 2: close the outer div after projects list and before last SpotlightCard
const old2 = '                        </Button>\n                      </div>\n                    ))\n                  )}\n                </div>';
const new2 = '                        </Button>\n                      </div>\n                    ))\n                  )}\n                </div>\n              </div>';
if (content.includes(old2)) {
  content = content.replace(old2, new2);
  console.log('Fix 2 applied: outer div after projects');
} else {
  console.log('Fix 2 NOT FOUND');
}

// Debug - show what's around "))" near the end
const idx = content.lastIndexOf('                  )}');
if (idx > 0) {
  console.log('\\nLast occurrence of "                  )}":');
  console.log(content.substring(Math.max(0, idx - 100), idx + 200));
}

console.log('\\nAfter: <div: ' + countOD() + ', </div>: ' + countCD() + ', diff: ' + (countOD() - countCD()));

fs.writeFileSync('frontend/src/pages/DashboardPage.tsx', content, 'utf-8');
