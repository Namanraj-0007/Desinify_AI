import re

with open('frontend/src/pages/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix: Close the header div and grid div
# The pattern is </Badge>\n          </div>\n\n        {/* Import Results */}
# Need: </Badge>\n          </div>\n        </div>\n\n        {/* Import Results */}

old = '</Badge>\n          </div>\n\n        {/* Import Results */}'
new = '</Badge>\n          </div>\n        </div>\n\n        {/* Import Results */}'

if old in content:
    content = content.replace(old, new)
    print('Fix 1: Closed header flex div')
else:
    print('Fix 1: Pattern not found. Searching...')
    # Find the import results section
    idx = content.find('{/* Import Results */}')
    if idx > 0:
        print(f'Found Import Results at index {idx}')
        print(content[idx-100:idx+50])

with open('frontend/src/pages/DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Count divs
oD = len(re.findall(r'<div[\s>]', content))
cD = content.count('</div>')
print(f'Divs: {oD} open, {cD} close, diff={oD-cD}')
