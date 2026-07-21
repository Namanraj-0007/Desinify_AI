import pathlib

# Fix 1: CodePreview.tsx
f = pathlib.Path(r'c:\Users\harsh\OneDrive\Desktop\DesinifyAI\frontend\src\components\codegen\CodePreview.tsx')
c = f.read_text(encoding='utf-8')

# Add </div> to close the flex-1 container div before the error section
c = c.replace(
    '          </div>\n        {err && (\n          <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">',
    '          </div>\n        </div>\n        {err && (\n          <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">'
)
f.write_text(c, encoding='utf-8')
print('CodePreview:', c.count('<div'), 'div opens,', c.count('</div>'), 'div closes')

# Fix 2: OptimizationPanel.tsx
f2 = pathlib.Path(r'c:\Users\harsh\OneDrive\Desktop\DesinifyAI\frontend\src\components\codegen\OptimizationPanel.tsx')
c2 = f2.read_text(encoding='utf-8')

# Add missing </div> closing the min-w-0 div
c2 = c2.replace(
    '{imp.description}</div>\n          <span className="text-xs text-indigo-400 ml-auto shrink-0 mt-1">',
    '{imp.description}</div>\n          </div>\n          <span className="text-xs text-indigo-400 ml-auto shrink-0 mt-1">'
)
f2.write_text(c2, encoding='utf-8')
print('OptimizationPanel:', c2.count('<div'), 'div opens,', c2.count('</div>'), 'div closes')

# Fix 3: VersionHistory.tsx
f3 = pathlib.Path(r'c:\Users\harsh\OneDrive\Desktop\DesinifyAI\frontend\src\components\codegen\VersionHistory.tsx')
c3 = f3.read_text(encoding='utf-8')

# Add missing </div> to close the outer card div and the expanded content div
c3 = c3.replace(
    '                    </div>\n                </div>\n            )}\n          </div>\n        )\n      })}',
    '                    </div>\n                </div>\n                </div>\n              </div>\n            )}\n          </div>\n        )\n      })}'
)
f3.write_text(c3, encoding='utf-8')
print('VersionHistory:', c3.count('<div'), 'div opens,', c3.count('</div>'), 'div closes')
