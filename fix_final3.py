import re

with open('frontend/src/pages/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Count before
oD = len(re.findall(r'<div[\s>]', content))
cD = content.count('</div>')
print(f'Before: <div={oD}, </div>={cD}, diff={oD-cD}')

# The file currently has 38 opens and 37 closes (diff=1)
# Issue: Header div opens but isn't closed before Import Results section

# Fix 1: Close the header div before Import Results
# Pattern: Badge close followed by blank line then Import Results comment
old = '          </div>\n\n        {/* Import Results */}'
new = '          </div>\n        </div>\n\n        {/* Import Results */}'
count1 = content.count(old)
print(f'Pattern 1 found: {count1}')
content = content.replace(old, new, 1)

# Verify after fix
oD = len(re.findall(r'<div[\s>]', content))
cD = content.count('</div>')
print(f'After fix 1: <div={oD}, </div>={cD}, diff={oD-cD}')

# Also need to close the glass div inside SpotlightCard for projects list
# Pattern: </AILoadingState>(newline)            </SpotlightCard> 
# Missing:               </div> closing the glass div
old2 = """                  )}
                </div>
            </SpotlightCard>"""

new2 = """                  )}
                </div>
            </SpotlightCard>"""

count2 = content.count(old2)
print(f'Pattern 2 found: {count2}')
content = content.replace(old2, new2, 1)

# Verify after fix 2
oD = len(re.findall(r'<div[\s>]', content))
cD = content.count('</div>')
print(f'After fix 2: <div={oD}, </div>={cD}, diff={oD-cD}')

with open('frontend/src/pages/DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
