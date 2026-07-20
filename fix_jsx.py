import re

with open('frontend/src/pages/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Count before
oD = len(re.findall(r'<div[\s>]', content))
cD = content.count('</div>')
print(f'Before: <div={oD}, </div>={cD}, diff={oD-cD}')

# The problem: fix_grid.py added an extra </div> inside the projects list section,
# and the grid close div was added in wrong spot.
# The file has been sequentially corrupted. 
# Best approach: restore from the fix_onview.py version + proper grid fix.

# Let's just find and fix the core issue:
# Line 361 area - extra </div> needs to be removed
# And grid close div inserted at correct position

# Strategy: Count nesting level of grid section
# Grid opens at line 162, closes before </section>
# Currently the structure is:
# </div> -> closes bottom stats grid
# </div> -> closes space-y-6
# </div> -> closes <div> (this is the one that should close grid, but it's in wrong spot)
# </div> -> closes something else 
# </section>

# Lines around 374-377:
#           </div>    <- bottom stats grid close (correct)
#             </div>  <- space-y-6 close (correct)  
#           </div>    <- THIS IS EXTRANEOUS? Or is it grid close in wrong place?
#         </div>      <- extra?
#       </section>

# Simple fix: Remove the duplicate from fix_grid.py's bad insert
# Find the pattern where fix_grid.py added its div

# The fix_grid.py change added: '          </div>' at line 361 (0-indexed 360)
# But it was already there, causing duplicate.

# Let me check exactly what's going on by looking at indentation patterns
lines = content.split('\n')

# Find all div closes near bottom
print("\n--- Lines 370-380 ---")
for i in range(max(0, len(lines)-20), len(lines)):
    print(f"{i+1}: {lines[i]}")

# Count indentation of each div close
print("\n--- Closes near bottom ---")
for i in range(len(lines)-25, len(lines)):
    if '</div>' in lines[i]:
        indent = len(lines[i]) - len(lines[i].lstrip())
        print(f"{i+1}: indent={indent}: {lines[i]}")

print("\n--- All opens/close near bottom 368-382 ---")
for i in range(367, min(len(lines), 385)):
    opens = re.findall(r'<div[\s>]', lines[i])
    closes = lines[i].count('</div>')
    markers = []
    for o in opens:
        markers.append(f'+{o}')
    for _ in range(closes):
        markers.append('-')
    if opens or closes:
        print(f"{i+1}: {' '.join(markers)}  {lines[i].strip()[:60]}")
