import re

with open('frontend/src/pages/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The grid div at line 162 needs closing.
# Pattern: </div>  (closing space-y-6) \n        </div> (closing section content) \n      </section>
# We need: </div> (closing grid) \n          </div> (closing space-y-6) \n        </div> \n      </section>

old = '            </div>\n          </div>\n        </div>\n      </section>'
new = '          </div>\n            </div>\n          </div>\n        </div>\n      </section>'

if old in content:
    content = content.replace(old, new)
    print('Fix applied: Added grid closing div')
else:
    print('Pattern not found. Checking exact ending...')
    # Find the section closing
    idx = content.find('</section>')
    print(f'Section close at index {idx}')
    print(content[idx-200:idx+20])

# Count divs
oD = len(re.findall(r'<div[\s>]', content))
cD = content.count('</div>')
print(f'Divs: {oD} open, {cD} close, diff={oD-cD}')
oSC = content.count('<SpotlightCard')
cSC = content.count('</SpotlightCard>')
print(f'SpotlightCards: {oSC}:{cSC}')

with open('frontend/src/pages/DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Saved!')
