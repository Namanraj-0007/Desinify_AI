#!/usr/bin/env python3
"""Read DashboardPage.tsx and fix unbalanced div tags by inserting missing </div> before </SpotlightCard>."""

import re

with open('frontend/src/pages/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We'll track div depth per glass section
# Strategy: find each <SpotlightCard> section, count the div balance inside,
# and insert missing </div> tags right before </SpotlightCard>

result = []
i = 0
while i < len(lines):
    line = lines[i]
    
    if '</SpotlightCard>' in line and i > 0:
        # Check how many open divs we have
        # Count backwards from the last .. let's just check if previous line
        # is NOT a </div> close
        prev_line = lines[i-1].strip()
        if not prev_line.startswith('</div>') and not prev_line.startswith('{') and not prev_line.startswith(')}') and not prev_line.startswith(')'):
            # We need to figure out the depth
            # Scan backwards from here to find the opening <div> that is the inner glass card
            depth = 0
            for j in range(i-1, max(i-50, -1), -1):
                depth += lines[j].count('<div') - lines[j].count('</div>')
                if depth > 0:
                    # We've gone up past the opening divs
                    break
            
            # Before we add closing tags, check if there's a direct parent
            # Let's count from the last opening glass div
            for back in range(i-1, max(i-30, -1), -1):
                if 'glass rounded-2xl' in lines[back] or 'glass rounded-xl' in lines[back]:
                    # Found the glass div - count how deep we are from there
                    d = 0
                    for k in range(back, i):
                        d += lines[k].count('<div') - lines[k].count('</div>')
                    if d > 0:
                        # Insert d closing divs before this line
                        indent = ' ' * (len(lines[i]) - len(lines[i].lstrip()))
                        for _ in range(d):
                            result.append(f'{indent}</div>\n')
                            print(f"  Inserted </div> before line {i+1}")
                    break
            
        result.append(line)
    else:
        result.append(line)
    
    i += 1

with open('frontend/src/pages/DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.writelines(result)

# Verify
with open('frontend/src/pages/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

oD = len(re.findall(r'<div[ >]', c))
cD = c.count('</div>')
oSC = c.count('<SpotlightCard')
cSC = c.count('</SpotlightCard>')
print(f'Divs: {oD}:{cD} => {"OK" if oD == cD else "FAIL"}')
print(f'SpotlightCards: {oSC}:{cSC} => {"OK" if oSC == cSC else "FAIL"}')
