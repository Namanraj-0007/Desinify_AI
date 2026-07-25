with open('frontend/src/pages/ContactPage.tsx', 'r') as f:
    content = f.read()

# Fix 1: Add closing </div> for the grid div after the email field
old1 = '<input name="email" type="email" required placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" />\n                    </div>\n                  <div>\n                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subject</label>'
new1 = '<input name="email" type="email" required placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20" />\n                    </div>\n                  </div>\n                  <div>\n                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subject</label>'
if old1 in content:
    content = content.replace(old1, new1)
    print("Fix 1 applied")
else:
    print("Fix 1: Pattern not found!")

# Fix 2: Add closing </div> for the outer container div before </section>
old2 = '            </motion.div>\n          </div>\n      </section>'
new2 = '            </motion.div>\n          </div>\n        </div>\n      </section>'
if old2 in content:
    content = content.replace(old2, new2)
    print("Fix 2 applied")
else:
    print("Fix 2: Pattern not found!")

