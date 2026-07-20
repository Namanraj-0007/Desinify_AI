const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/DashboardPage.tsx', 'utf-8');

// All fixes applied sequentially
let fixes = 0;

// Fix 1: Stats card top - missing </div> before </SpotlightCard>
let old1 = `<div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </SpotlightCard>
              ))}
            </div>`;
let new1 = `<div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </SpotlightCard>
              ))}
            </div>`;
if (content.includes(old1)) { content = content.replace(old1, new1); fixes++; }

// Fix 2: Figma Integration - missing </div> for glass div before </SpotlightCard>
let old2 = `                </div>
            </SpotlightCard>

            {figmaProjects.length > 0 && (`;
let new2 = `                </div>
            </SpotlightCard>

            {figmaProjects.length > 0 && (`;
if (content.includes(old2)) { content = content.replace(old2, new2); fixes++; }

// Fix 3: Figma Designs card - missing </div> before </SpotlightCard>
let old3 = `                  </div>
              </SpotlightCard>
            )}`;
let new3 = `                  </div>
              </SpotlightCard>
            )}`;
if (content.includes(old3)) { content = content.replace(old3, new3); fixes++; }

// Fix 4: Create project - missing </div> before </SpotlightCard>
let old4 = `                  <Button onClick={createProject} disabled={creating || !newName.trim()} variant="gradient">{creating ? 'Creating...' : 'Create project'}</Button>
                </div>
            </SpotlightCard>

            {error && (`;
let new4 = `                  <Button onClick={createProject} disabled={creating || !newName.trim()} variant="gradient">{creating ? 'Creating...' : 'Create project'}</Button>
                </div>
            </SpotlightCard>

            {error && (`;
if (content.includes(old4)) { content = content.replace(old4, new4); fixes++; }

// Fix 5: Projects list - missing </div> before </SpotlightCard>
let old5 = `                  )}
                </div>
            </SpotlightCard>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">`;
let new5 = `                  )}
                </div>
            </SpotlightCard>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">`;
if (content.includes(old5)) { content = content.replace(old5, new5); fixes++; }

// Fix 6: Stats card bottom - missing </div> before </SpotlightCard>
let old6 = `<div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </SpotlightCard>
              ))}
            </div>`;
let new6 = `<div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </SpotlightCard>
              ))}
            </div>`;
if (content.includes(old6)) { content = content.replace(old6, new6); fixes++; }

// Fix 7: min-w-0 div missing </div> before </div> (the flex parent's closing)
let old7 = `<div className="min-w-0">
                            <div className="font-medium text-sm truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground">Created {new Date(p.created_at).toLocaleDateString()}</div>`;
let new7 = `<div className="min-w-0">
                            <div className="font-medium text-sm truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground">Created {new Date(p.created_at).toLocaleDateString()}</div>
                        </div>`;
if (content.includes(old7)) { content = content.replace(old7, new7); fixes++; }

fs.writeFileSync('frontend/src/pages/DashboardPage.tsx', content, 'utf-8');

const oD = (content.match(/<div[ >]/g) || []).length;
const cD = (content.match(/<\/div>/g) || []).length;
const oSC = (content.match(/<SpotlightCard/g) || []).length;
const cSC = (content.match(/<\/SpotlightCard>/g) || []).length;
const oM = (content.match(/<motion\.div/g) || []).length;
const cM = (content.match(/<\/motion\.div>/g) || []).length;

console.log(`Fixes applied: ${fixes}`);
console.log(`Divs: ${oD}:${cD} => ${oD === cD ? 'OK' : 'FAIL'}`);
console.log(`SpotlightCards: ${oSC}:${cSC} => ${oSC === cSC ? 'OK' : 'FAIL'}`);
console.log(`motion.div: ${oM}:${cM} => ${oM === cM ? 'OK' : 'FAIL'}`);
