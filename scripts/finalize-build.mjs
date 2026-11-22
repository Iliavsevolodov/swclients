import { existsSync, mkdirSync, renameSync, rmSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
const source=join('dist','app','index.html')
const target=join('dist','index.html')
if (!existsSync(source)) throw new Error('Build missing app/index.html')
renameSync(source,target)
try { rmSync(join('dist','app'),{recursive:true,force:true}) } catch {}
const html=readFileSync(target,'utf8')
if (!html.includes('/swclients/docs/assets/')) throw new Error('Bundled JS/CSS not linked with /swclients/docs/assets/')
if (html.includes('src/main.jsx')) throw new Error('Uncompiled React entry found in built HTML')
console.log('PASS: compiled entry is at dist/index.html with correct GitHub Pages asset paths')
