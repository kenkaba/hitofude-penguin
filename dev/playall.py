import asyncio,json
from playwright.async_api import async_playwright
SOL=json.load(open('solR.json'))
async def one(b,li,res):
    pg=await b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    import os
    await pg.goto('file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','web','index.html')));await pg.wait_for_timeout(300)
    await pg.click('#btnPlay');await pg.wait_for_timeout(150)
    await pg.evaluate(f"document.querySelectorAll('.tile')[{li}].disabled=false;document.querySelectorAll('.tile')[{li}].click()");await pg.wait_for_timeout(400)
    v=await pg.evaluate('window.__pgView')
    for stroke in SOL[li]:
        pts=[]
        for i in range(len(stroke)-1):
            a,c=stroke[i],stroke[i+1]
            n=max(1,int(((c[0]-a[0])**2+(c[1]-a[1])**2)**.5/8))
            for k in range(n): pts.append((a[0]+(c[0]-a[0])*k/n,a[1]+(c[1]-a[1])*k/n))
        pts.append(tuple(stroke[-1]))
        sc=[(v['ox']+x*v['s'], v['oy']+y*v['s']) for x,y in pts]
        await pg.mouse.move(*sc[0]); await pg.mouse.down()
        for q in sc[1:]: await pg.mouse.move(*q)
        await pg.mouse.up()
    await pg.evaluate("document.getElementById('btnGo').click()")
    for _ in range(30):
        await pg.wait_for_timeout(500)
        vis=await pg.evaluate("!document.getElementById('result').classList.contains('hidden')")
        if vis: break
    res[li]=(await pg.evaluate("document.getElementById('resTitle').textContent"),errs)
    await pg.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();res={}
        import sys
        idx=[int(x) for x in sys.argv[1].split(',')] if len(sys.argv)>1 else list(range(50))
        for li in idx:
            await one(b,li,res)
        await b.close()
        bad=[(li,res[li]) for li in idx if not ('ゴール' in res[li][0] or 'パーフェクト' in res[li][0])]
        print('OK',len(idx)-len(bad),'/',len(idx));print(bad)
asyncio.run(main())
