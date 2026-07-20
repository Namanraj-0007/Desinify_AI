import re

with open('frontend/src/pages/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Count before
oD = len(re.findall(r'<div[\s>]', content))
cD = content.count('</div>')
print(f'Before: <div={oD}, </div>={cD}, diff={oD-cD}')

# We know the grid at L162 (indent=8) is unclosed.
# Currently the bottom closes are:
#   L374: </div> indent=10 (bottom stats grid)
#   L375: </div> indent=12 (space-y-6 main content)
#   L376: </div> indent=10 (??? extra or grid close with wrong indent)
#   L377: </div> indent=8  (section close?)
#   L378: </section> indent=6
#
# The grid at L162 needs indent=8 close.
# L377 indent=8 should be it, but it's used for section's div.
# Actually: <section> at line 110 is indent=6.
# There is no section-level div wrapper - section is the div.
# 
# Let me check: What opens at indent=8 besides grid?
# Grid at L162 is indent=8.
# After grid, the main content div opens at indent=10 (space-y-6 inside main content).
# After that, bottom stats grid opens at indent=10.
# 
# So closing structure:
#   </div> indent=10 (bottom stats grid)  
#   </div> indent=12 (space-y-6 main content)
# BUT: What opens at indent=12 that needs closing? Let me check.
# The space-y-6 inside main content might open at indent=12 or indent=10.
# Also what opens at indent=10 besides bottom stats grid? Main content thing.
#
# Actually the issue is the grid opens at indent=8 and there's nothing closing at indent=8.
# L377 indent=8 closes... what? Let me check if section has a wrapping div.

# Let me look at lines 110-118
lines = content.split('\n')
print('\n--- Lines 110-120 ---')
for i in range(109, 120):
    print(f'{i+1}: [{len(lines[i])-len(lines[i].lstrip())}]: {lines[i]}')

print('\n--- Lines 155-165 ---')
for i in range(154, 166):
    print(f'{i+1}: [{len(lines[i])-len(lines[i].lstrip())}]: {lines[i]}')

# Strategy: Just add one more </div> at indent=8 before </section>
# Find the last occurrence of '</section>' and add before it
section_close = content.rfind('</section>')
before_section = content[:section_close]
after_section = content[section_close:]

# Check the last few lines before section
print('\n--- Last lines before section close ---')
parts = before_section.rsplit('\n', 5)
for p in parts[-5:]:
    print(f'  [{len(p)-len(p.lstrip())}]: {p.strip()}')

# We need to add indent=8 </div> right before </section> line
last_newline_before_section = before_section.rstrip('\n').rfind('\n')
if last_newline_before_section >= 0:
    new_content = content[:last_newline_before_section+1] + '        </div>\n' + content[last_newline_before_section+1:]
    
    oD2 = len(re.findall(r'<div[\s>]', new_content))
    cD2 = new_content.count('</div>')
    print(f'\nAfter: <div={oD2}, </div>={cD2}, diff={oD2-cD2}', end=' ')
    print('OK' if oD2 == cD2 else 'FAIL')
    
    with open('frontend/src/pages/DashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Saved!')
else:
    print('Could not find insertion point')
