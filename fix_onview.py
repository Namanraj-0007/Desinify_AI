import re

with open('frontend/src/pages/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: onView -> onClick
content = content.replace('onView={() =>', 'onClick={() =>')

with open('frontend/src/pages/DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed onView to onClick")
