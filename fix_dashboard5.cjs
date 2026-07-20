const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/DashboardPage.tsx', 'utf-8');

// Fix all instances where a `<div className="glass...">` is not closed before `</SpotlightCard>`

// Fix 1 & 2: Stats card patterns (slice 0,2 and slice 2)
c = c.replace(
  /<div className="glass rounded-xl p-3 text-center">\n                    <div className="text-lg">\{stat\.icon\}<\/div>\n                    <div className="text-lg font-semibold font-display mt-1">\{stat\.value\}<\/div>\n                    <div className="text-\[10px\] text-muted-foreground">\{stat\.label\}<\/div>\n                <\/SpotlightCard>/g,
  `<div className="glass rounded-xl p-3 text-center">
                    <div className="text-lg">{stat.icon}</div>
                    <div className="text-lg font-semibold font-display mt-1">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </SpotlightCard>`
);

// Fix Figma Integration card
const figmaIntPattern = `              <div className="glass rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="font-display font-semibold text-sm">Figma Integration</h3>
                  <p className="text-xs text-muted-foreground mt-1">Connect your Figma token and import designs.</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Access Token</label>
                    <Input value={figmaToken} onChange={(e) => setFigmaToken(e.target.value)} placeholder="figd_..." className="text-xs h-9" />
                  </div>
                  <Button size="sm" className="w-full" disabled={figmaBusy || !figmaToken.trim()}
                    onClick={async () => {
                      setFigmaBusy(true); setFigmaStep('Validating...'); setError(null);
                      try { await connectFigmaToken(figmaToken.trim()); setFigmaStep('Connected'); await refreshFigmaProjects(); }
                      catch (e: any) { setError(e?.message ?? 'Failed to connect'); setFigmaStep(null); }
                      finally { setFigmaBusy(false); setTimeout(() => setFigmaStep(null), 1500); }
                    }}
                  >{figmaBusy && figmaStep ? figmaStep : 'Connect'}</Button>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">File URL</label>
                    <Input value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)} placeholder="https://www.figma.com/file/..." className="text-xs h-9" />
                  </div>
                  <Button size="sm" variant="outline" className="w-full" disabled={figmaBusy || !figmaUrl.trim()}
                    onClick={async () => {
                      setFigmaBusy(true); setFigmaStep('Importing...'); setError(null); setFigmaResult(null);
                      try {
                        const res = await importFigmaByUrl({ figma_url: figmaUrl.trim(), project_name: 'Figma Import' });
                        setFigmaResult(res); setFigmaStep('Complete'); await refreshFigmaProjects();
                      }
                      catch (e: any) { setError(e?.message ?? 'Import failed'); setFigmaStep(null); }
                      finally { setFigmaBusy(false); setTimeout(() => setFigmaStep(null), 1500); }
                    }}
                  >{figmaBusy && figmaStep ? figmaStep : 'Import'}</Button>
                </div>
            </SpotlightCard>`;

const figmaIntFixed = `              <div className="glass rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="font-display font-semibold text-sm">Figma Integration</h3>
                  <p className="text-xs text-muted-foreground mt-1">Connect your Figma token and import designs.</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Access Token</label>
                    <Input value={figmaToken} onChange={(e) => setFigmaToken(e.target.value)} placeholder="figd_..." className="text-xs h-9" />
                  </div>
                  <Button size="sm" className="w-full" disabled={figmaBusy || !figmaToken.trim()}
                    onClick={async () => {
                      setFigmaBusy(true); setFigmaStep('Validating...'); setError(null);
                      try { await connectFigmaToken(figmaToken.trim()); setFigmaStep('Connected'); await refreshFigmaProjects(); }
                      catch (e: any) { setError(e?.message ?? 'Failed to connect'); setFigmaStep(null); }
                      finally { setFigmaBusy(false); setTimeout(() => setFigmaStep(null), 1500); }
                    }}
                  >{figmaBusy && figmaStep ? figmaStep : 'Connect'}</Button>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">File URL</label>
                    <Input value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)} placeholder="https://www.figma.com/file/..." className="text-xs h-9" />
                  </div>
                  <Button size="sm" variant="outline" className="w-full" disabled={figmaBusy || !figmaUrl.trim()}
                    onClick={async () => {
                      setFigmaBusy(true); setFigmaStep('Importing...'); setError(null); setFigmaResult(null);
                      try {
                        const res = await importFigmaByUrl({ figma_url: figmaUrl.trim(), project_name: 'Figma Import' });
                        setFigmaResult(res); setFigmaStep('Complete'); await refreshFigmaProjects();
                      }
                      catch (e: any) { setError(e?.message ?? 'Import failed'); setFigmaStep(null); }
                      finally { setFigmaBusy(false); setTimeout(() => setFigmaStep(null), 1500); }
                    }}
                  >{figmaBusy && figmaStep ? figmaStep : 'Import'}</Button>
                </div>
            </SpotlightCard>`;

c = c.replace(figmaIntPattern, figmaIntFixed);

// Fix Create project card
const createProjPattern = `            <SpotlightCard className="rounded-2xl">
              <div className="glass rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New project name..." className="flex-1" onKeyDown={(e) => e.key === 'Enter' && createProject()} />
                  <Button onClick={createProject} disabled={creating || !newName.trim()} variant="gradient">{creating ? 'Creating...' : 'Create project'}</Button>
                </div>
            </SpotlightCard>`;

const createProjFixed = `            <SpotlightCard className="rounded-2xl">
              <div className="glass rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New project name..." className="flex-1" onKeyDown={(e) => e.key === 'Enter' && createProject()} />
                  <Button onClick={createProject} disabled={creating || !newName.trim()} variant="gradient">{creating ? 'Creating...' : 'Create project'}</Button>
                </div>
            </SpotlightCard>`;

c = c.replace(createProjPattern, createProjFixed);

// Fix Projects list card
const projectsListPattern = `            <SpotlightCard className="rounded-2xl">
              <div className="glass rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
                  <h3 className="font-display font-semibold">Projects</h3>
                  <span className="text-xs text-muted-foreground">{loading ? 'Loading...' : projects.length + ' total'}</span>
                </div>`;

// Check if there's a missing </div> before </SpotlightCard> in projects list
// The projects list section ends with:
//                </div>
//            </SpotlightCard>
// But needs an extra </div> for the glass inner div
// Let's look for the end of projects list section
const projectsListEnd = `                  )}
                </div>
            </SpotlightCard>`;

const projectsListEndFixed = `                  )}
                </div>
            </SpotlightCard>`;

c = c.replace(projectsListEnd, projectsListEndFixed);

// Fix Figma Designs card
const figmaDesignsEnd = `                  </div>
              </SpotlightCard>
            )}
          </asid`;

// This one actually looks correct already... let's check

// Fix Import Result card (first SpotlightCard)
// The import result section looks correct based on debug output #1

fs.writeFileSync('frontend/src/pages/DashboardPage.tsx', c, 'utf-8');

const oD = (c.match(/<div[ >]/g) || []).length;
const cD = (c.match(/<\/div>/g) || []).length;
const oSC = (c.match(/<SpotlightCard/g) || []).length;
const cSC = (c.match(/<\/SpotlightCard>/g) || []).length;
console.log('Divs: ' + oD + ':' + cD + ' => ' + (oD === cD ? 'OK' : 'FAIL (' + (oD - cD) + ' more needed)'));
console.log('SpotlightCards: ' + oSC + ':' + cSC + ' => ' + (oSC === cSC ? 'OK' : 'FAIL'));
