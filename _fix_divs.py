import re

with open('frontend/src/pages/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

fixes = 0

# Fix 1: Close the header badge div (line 117) - after </Badge>
old = '</Badge>\n          </div>\n        '
new = '</Badge>\n            </div>\n          </div>\n        '
if old in content:
    content = content.replace(old, new)
    fixes += 1
    print('Fix 1: Closed header badge div')

# Fix 2: Close stats glass div - before </SpotlightCard>
old = '<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                </SpotlightCard>'
new = '<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                  </div>\n                </SpotlightCard>'
if old in content:
    content = content.replace(old, new)
    fixes += 1
    print('Fix 2: Closed stats glass div (top)')

# Fix 3: Same pattern for bottom stats 
old = '<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                </SpotlightCard>\n              ))}\n            </div>'
new = '<div className="text-[10px] text-muted-foreground">{stat.label}</div>\n                  </div>\n                </SpotlightCard>\n              ))}\n            </div>'
if old in content:
    content = content.replace(old, new)
    fixes += 1
    print('Fix 3: Closed stats glass div (bottom)')

# Fix 4: Close the space-y-3 div and glass div in Figma Integration before </SpotlightCard>
old = '                  </Button>\n                </div>\n            </SpotlightCard>\n\n            {/* Figma Projects */}'
new = '                  </Button>\n                </div>\n              </div>\n            </SpotlightCard>\n\n            {/* Figma Projects */}'
if old in content:
    content = content.replace(old, new)
    fixes += 1
    print('Fix 4: Closed Figma Integration space-y-3 and glass divs')

# Fix 5: Close space-y-2 div and glass div in Figma Projects before </SpotlightCard>
old = '                    ))}\n                  </div>\n              </SpotlightCard>\n            )}\n          </aside>'
new = '                    ))}\n                  </div>\n                </div>\n              </SpotlightCard>\n            )}\n          </aside>'
if old in content:
    content = content.replace(old, new)
    fixes += 1
    print('Fix 5: Closed Figma Projects space-y-2 and glass divs')

# Fix 6: Create project - close flex div and glass div before next
old = '                  </Button>\n                </div>\n            </SpotlightCard>\n\n            {/* Error */}'
new = '                  </Button>\n                </div>\n              </div>\n            </SpotlightCard>\n\n            {/* Error */}'
if old in content:
    content = content.replace(old, new)
    fixes += 1
    print('Fix 6: Closed create project flex and glass divs')

# Fix 7: Projects list - close glass div before </SpotlightCard>
old = '                  )}\n                </div>\n            </SpotlightCard>\n\n            {/* Bottom stats */}'
new = '                  )}\n                </div>\n              </div>\n            </SpotlightCard>\n\n            {/* Bottom stats */}'
if old in content:
    content = content.replace(old, new)
    fixes += 1
    print('Fix 7: Closed projects list glass div')

# Fix 8: Main content div - close before main grid closing
old = '            </div>\n        </div>\n      </section>'
new = '            </div>\n          </div>\n        </div>\n      </section>'
if old in content:
    content = content.replace(old, new)
    fixes += 1
    print('Fix 8: Closed main content space-y-6 div')

print(f'\nTotal fixes applied: {fixes}')

# Count divs
oD = len(re.findall(r'<div[^>]*>', content))
cD = content.count('</div>')
oSC = content.count('<SpotlightCard')
cSC = content.count('</SpotlightCard>')
print(f'Divs: {oD} open, {cD} close, diff={oD-cD}')
print(f'SpotlightCards: {oSC}:{cSC}')

with open('frontend/src/pages/DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('File saved!')
