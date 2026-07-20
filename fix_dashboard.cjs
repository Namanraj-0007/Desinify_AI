const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/DashboardPage.tsx', 'utf-8');

// 6 missing </div> tags to fix

// Fix 1: Stats cards section (line ~155 area) - missing </div> before </SpotlightCard>
c = c.replace(
  '<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                </SpotlightCard>\n              ))}\n            </div>',
  '<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                  </div>\n                </SpotlightCard>\n              ))}\n            </div>'
);

// Fix 2: Figma Integration section - missing </div> before </SpotlightCard>
c = c.replace(
  ">{figmaBusy && figmaStep ? figmaStep : 'Import'}</Button>\n                </div>\n            </SpotlightCard>\n\n            {figmaProjects",
  ">{figmaBusy && figmaStep ? figmaStep : 'Import'}</Button>\n                </div>\n              </div>\n            </SpotlightCard>\n\n            {figmaProjects"
);

// Fix 3: Figma Designs section - missing </div> before </SpotlightCard>
c = c.replace(
  '                  </div>\n              </SpotlightCard>\n            )}\n          </aside>',
  '                  </div>\n                </div>\n              </SpotlightCard>\n            )}\n          </aside>'
);

// Fix 4: Create project - missing </div> before </SpotlightCard>
c = c.replace(
  "}</Button>\n                </div>\n            </SpotlightCard>\n\n            {error",
  "}</Button>\n                </div>\n              </div>\n            </SpotlightCard>\n\n            {error"
);

// Fix 5: Projects list - missing </div> before </SpotlightCard>
c = c.replace(
  '                </div>\n            </SpotlightCard>\n\n            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">',
  '                </div>\n              </div>\n            </SpotlightCard>\n\n            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">'
);

// Fix 6: Bottom stats section - missing </div> before </SpotlightCard>
c = c.replace(
  '<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                </SpotlightCard>\n              ))}\n            </div>\n        </div>',
  '<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                  </div>\n                </SpotlightCard>\n              ))}\n            </div>\n          </div>\n        </div>'
);

fs.writeFileSync('frontend/src/pages/DashboardPage.tsx', c, 'utf-8');

// Verify
const oD = (c.match(/<div[ >]/g) || []).length;
const cD = (c.match(/<\/div>/g) || []).length;
const oSC = (c.match(/<SpotlightCard/g) || []).length;
const cSC = (c.match(/<\/SpotlightCard>/g) || []).length;
console.log('Divs: ' + oD + ' open, ' + cD + ' close');
console.log('SpotlightCards: ' + oSC + ' open, ' + cSC + ' close');
console.log('Balanced: ' + (oD === cD && oSC === cSC));
