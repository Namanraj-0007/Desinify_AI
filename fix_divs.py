#!/usr/bin/env python3
"""Fix unbalanced div tags in DashboardPage.tsx by tracking a div stack."""

import re

with open('frontend/src/pages/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We'll track div openings inside the JSX return block
# Strategy: whenever we see </SpotlightCard> and div depth > 0, insert missing </div> tags

# But the issue is simpler - let me just manually find and fix each known missing </div>

content = ''.join(lines)

# Known issues from the earlier debug output:
# 1. Line 150 area: stats card glass div - <div class="glass rounded-xl p-3 text-center"> not closed
# 2. Line 160 area: Figma Integration glass div
# 3. Line 215 area: Create Project glass div  
# 4. Line 227 area: Projects list glass div (depth=2 - needs 2 closings)
# 5. Line 245 area: min-w-0 div
# 6. Line 263 area: bottom stats card glass div

fixes = [
    # Fix 1: Stats card top - add </div> before </SpotlightCard>
    ('<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                </SpotlightCard>',
     '<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                  </div>\n                </SpotlightCard>'),
    
    # Fix 2: Figma Integration - add </div> (close space-y-3 div and glass div) before </SpotlightCard>
    ('                </div>\n            </SpotlightCard>\n\n            {figmaProjects.length > 0 && (',
     '                </div>\n              </div>\n            </SpotlightCard>\n\n            {figmaProjects.length > 0 && ('),
    
    # Fix 3: Create Project - add </div> before </SpotlightCard>
    ('                  <Button onClick={createProject} disabled={creating || !newName.trim()} variant="gradient">{creating ? \'Creating...\' : \'Create project\'}</Button>\n                </div>\n            </SpotlightCard>\n\n            {error && (',
     '                  <Button onClick={createProject} disabled={creating || !newName.trim()} variant="gradient">{creating ? \'Creating...\' : \'Create project\'}</Button>\n                </div>\n              </div>\n            </SpotlightCard>\n\n            {error && ('),

    # Fix 4: Projects list - add </div> before </SpotlightCard>
    ('                  )}\n                </div>\n            </SpotlightCard>\n\n            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">',
     '                  )}\n                </div>\n              </div>\n            </SpotlightCard>\n\n            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">'),

    # Fix 5: Stats card bottom - add </div> before </SpotlightCard>
    ('<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                </SpotlightCard>\n              ))}\n            </div>\n        </div>',
     '<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                  </div>\n                </SpotlightCard>\n              ))}\n            </div>\n        </div>'),

    # Fix 6: min-w-0 div - the <div className="min-w-0"> at the project items needs a closing </div>
    ('<div className="min-w-0">\n                            <div className="font-medium text-sm truncate">{p.name}</div>\n                            <div className="text-xs text-muted-foreground">Created {new Date(p.created_at).toLocaleDateString()}</div>\n                        </div>',
     '<div className="min-w-0">\n                            <div className="font-medium text-sm truncate">{p.name}</div>\n                            <div className="text-xs text-muted-foreground">Created {new Date(p.created_at).toLocaleDateString()}</div>\n                          </div>\n                        </div>'),
]

for old, new in fixes:
    if old in content:
        content = content.replace(old, new, 1)  # Only first occurrence
        print(f"Fix applied: {old[:50]}...")
    else:
        print(f"Fix NOT FOUND: {old[:50]}...")

with open('frontend/src/pages/DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

oD = len(re.findall(r'<div[ >]', content))
cD = content.count('</div>')
oSC = content.count('<SpotlightCard')
cSC = content.count('</SpotlightCard>')
print(f'\nDivs: {oD}:{cD} => {"OK" if oD == cD else "FAIL (diff=" + str(oD-cD) + ")"}')
print(f'SpotlightCards: {oSC}:{cSC} => {"OK" if oSC == cSC else "FAIL"}')
