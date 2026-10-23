import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const W = 1440, H = 900;
const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' }, args:['--ignore-certificate-errors'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.route('**/wheff.local.js*', r => r.fulfill({ contentType:'text/javascript', body:'window.WHEFF_LOCAL_CONFIG={AI_PROVIDER:"groq"};' }));
await page.goto('http://localhost:8765/app_wheff_v33.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const CSS = `#demo-faixa,#demo-entrar,.demo-cartao,#toast,.toast,[class*=toast]{display:none!important}
#zzrec-cur{position:fixed;left:0;top:0;width:26px;height:26px;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px);transition:transform .05s linear}
#zzrec-cur svg{filter:drop-shadow(0 3px 6px rgba(0,0,0,.5))}
#zzrec-cur.clk::after{content:'';position:absolute;left:-14px;top:-14px;width:28px;height:28px;border-radius:50%;border:3px solid #eff12e;animation:zzrecr .45s ease-out forwards}
#zzrec-cap{position:fixed;left:calc(50% + 137px);bottom:26px;transform:translateX(-50%) translateY(16px);opacity:0;z-index:2147483646;pointer-events:none;display:flex;align-items:center;gap:10px;padding:11px 20px 11px 14px;border-radius:999px;background:rgba(10,10,7,.92);border:1px solid rgba(239,241,46,.55);color:#fcf8ec;font:500 16px/1.2 var(--font-b,system-ui);box-shadow:0 14px 40px rgba(0,0,0,.45);transition:opacity .35s,transform .35s;white-space:nowrap}
#zzrec-cap.on{opacity:1;transform:translateX(-50%) translateY(0)}
#zzrec-cap b{background:#eff12e;color:#0a0a07;border-radius:999px;padding:4px 10px;font-weight:700;font-size:13px;letter-spacing:.04em;text-transform:uppercase}
@keyframes zzrecr{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}}`;
const inject = () => page.evaluate(css => {
  if (!document.getElementById('zzrec-css')) { const s=document.createElement('style'); s.id='zzrec-css'; s.textContent=css; document.head.appendChild(s); }
  if (!document.getElementById('zzrec-cur')) { const c=document.createElement('div'); c.id='zzrec-cur';
    c.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2l16 9.5-7 1.6-3.6 6.4z" fill="#fff" stroke="#0a0a07" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    document.body.appendChild(c); }
}, CSS);
await inject();

let cx = W*0.6, cy = H*0.7;
const setCur = (x,y) => page.evaluate(([x,y]) => { const c=document.getElementById('zzrec-cur'); if(c) c.style.transform=`translate(${x-4}px,${y-2}px)`; }, [x,y]);
const ease = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
async function move(x, y, ms = 650) {
  const n = Math.max(8, Math.round(ms/40)), x0=cx, y0=cy;
  for (let i=1;i<=n;i++){ const t=ease(i/n); cx=x0+(x-x0)*t; cy=y0+(y-y0)*t; await setCur(cx,cy); await page.waitForTimeout(ms/n); }
}
async function click() { await page.evaluate(()=>{const c=document.getElementById('zzrec-cur'); c.classList.remove('clk'); void c.offsetWidth; c.classList.add('clk');}); await page.waitForTimeout(180); }
async function moveTo(sel, ms) { const b = await page.locator(sel).first().boundingBox(); if (!b) { console.log('nobox', sel); return; } await move(b.x+b.width*0.45, b.y+b.height*0.5, ms); }
async function scroll(dy, ms = 1400) {
  const n = Math.round(ms/40);
  for (let i=0;i<n;i++){ await page.mouse.wheel(0, dy/n); await page.waitForTimeout(40); }
}
async function go(mod, grupo) {
  if (grupo) await moveTo(`.nv-item[data-grupo="${grupo}"]`, 700);
  else await moveTo(`.nv-item[data-mod="${mod}"]`, 700);
  await click();
  await page.evaluate(m => Nav.ir(m), mod);
  await page.waitForTimeout(400); await inject();
}

// ── screencast ──
const cdp = await page.context().newCDPSession(page);
const frames = [];
cdp.on('Page.screencastFrame', async f => { frames.push({ t: f.metadata.timestamp, d: f.data }); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(()=>{}); });
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
async function cap(tag, txt) {
  await page.evaluate(([tag, txt]) => { let c=document.getElementById('zzrec-cap'); if(!c){c=document.createElement('div'); c.id='zzrec-cap'; document.body.appendChild(c);} 
    c.classList.remove('on'); setTimeout(()=>{ c.innerHTML = tag ? `<b>${tag}</b><span>${txt}</span>` : ''; if (tag) c.classList.add('on'); }, 250); }, [tag, txt]);
}
const hold = ms => page.waitForTimeout(ms);
const mark = [];
const scene = name => mark.push({ name, t: Date.now()/1000 });

scene('gate');
await setCur(cx, cy); await hold(1500);
await moveTo("text=ENTRAR COMO", 900); await hold(250); await click();
await page.evaluate(() => WheffDemo.entrar()); await hold(400); await inject();
await page.evaluate(() => document.getElementById('demo-faixa')?.remove());
scene('painel'); await cap('Painel geral', 'A operação inteira numa tela, com o funil ao vivo'); await hold(1800);
await move(700, 300, 700); await hold(400);
await page.mouse.move(800, 600); await scroll(650, 1400); await hold(1000); await scroll(-650, 700);
scene('lanc'); await cap('', ''); await go('lancamentos', 'estrategia'); await cap('Lançamentos', 'Meta, realizado, leads e vendas de cada ciclo'); await hold(1800);
await move(860, 590, 700); await hold(700);
scene('dash'); await cap('', ''); await go('dashboard', 'resultados'); await cap('Dashboard', 'Faturamento, ROAS, CAC e conversão em tempo real'); await hold(1800);
await page.mouse.move(900, 600); await scroll(560, 1300); await hold(1200);
scene('cal'); await cap('', ''); await go('calendar', 'producao'); await cap('Calendário editorial', 'O que sai, quando e em qual canal'); await hold(1800);
await move(980, 760, 700); await hold(800);
scene('agentes'); await cap('', ''); await go('agentes', 'conhecimento'); await cap('12 agentes de IA', 'Diretores virtuais que leem os dados reais da empresa'); await hold(1300);
await move(480, 820, 700); await hold(1000);
scene('fin'); await cap('', ''); await go('financeiro', 'resultados'); await cap('Financeiro', 'Receitas, despesas, DRE e margem'); await hold(2000);
await move(900, 460, 700); await hold(900);
scene('end');

await cdp.send('Page.stopScreencast'); await hold(300);
console.log('frames', frames.length);
const t0 = frames[0].t; const list = [];
frames.forEach((f, i) => { const p = `frames/f${String(i).padStart(5,'0')}.jpg`; fs.writeFileSync(p, Buffer.from(f.d, 'base64')); list.push({ p, t: f.t - t0 }); });
fs.writeFileSync('frames/list.json', JSON.stringify({ list, mark: mark.map(m => ({...m, t: m.t - t0})) }));
await browser.close();
