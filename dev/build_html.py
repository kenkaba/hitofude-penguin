# テンプレート + core.js から配布用HTMLを作る:  python3 dev/build_html.py
import re, os
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
full = open(os.path.join(here, 'template.html'), encoding='utf-8').read().replace('/*CORE*/', open(os.path.join(here, 'core.js'), encoding='utf-8').read())
open(os.path.join(root, 'web', 'index.html'), 'w', encoding='utf-8').write(full)
pwa = re.sub(r'<link rel="apple-touch-icon"[^>]*>', '<link rel="apple-touch-icon" sizes="180x180" href="icons/icon-180.png">', full)
pwa = re.sub(r'<link rel="icon" type="image/png"[^>]*>', '<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">', pwa)
pwa = re.sub(r'<link rel="manifest"[^>]*>', '<link rel="manifest" href="manifest.webmanifest">', pwa)
pwa = pwa.replace('</body>', "<script>\nif ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/claude\\.ai|claudeusercontent/.test(location.hostname)) {\n  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));\n}\n</script>\n</body>")
open(os.path.join(root, 'pwa', 'index.html'), 'w', encoding='utf-8').write(pwa)

# app/ : Capacitor (iOS/Android) 用。フォントを同梱してオフライン起動でも同じ見た目に。service worker は使わない
import shutil
app_dir = os.path.join(root, 'app')
shutil.rmtree(app_dir, ignore_errors=True); os.makedirs(os.path.join(app_dir, 'fonts'))
fonts_css = open(os.path.join(here, 'fonts', 'fonts.css'), encoding='utf-8').read()
app = re.sub(r'<link rel="preconnect"[^>]*>\n?', '', full)
app = re.sub(r'<link href="https://fonts.googleapis.com[^>]*>', '<style>\n' + fonts_css + '</style>', app)
assert 'fonts.googleapis' not in app
open(os.path.join(app_dir, 'index.html'), 'w', encoding='utf-8').write(app)
for f in os.listdir(os.path.join(here, 'fonts')):
    if f.endswith('.woff2'): shutil.copy(os.path.join(here, 'fonts', f), os.path.join(app_dir, 'fonts', f))
print('built web/index.html, pwa/index.html and app/')
