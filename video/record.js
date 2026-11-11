/*
 * Grava o Reel (1080x1920) em MP4.
 * Requer: servidor principal rodando em :3000 (npm start) e as ferramentas em TOOLS.
 * Uso: node video/record.js <pasta-das-ferramentas> [reel|reel2]
 */
const path = require('path');
const fs = require('fs');
const express = require('express');
const { execFileSync } = require('child_process');

const TOOLS = process.argv[2];
const REEL = process.argv[3] || 'reel'; // reel.html, reel2.html...
const NAME = REEL === 'reel' ? 'reel-minipizzajunior' : REEL === 'reel2' ? 'reel-clikko-pizzaria' : 'reel-' + REEL;
const { chromium } = require(path.join(TOOLS, 'node_modules', 'playwright-core'));
const FFMPEG = require(path.join(TOOLS, 'node_modules', 'ffmpeg-static'));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, 'out');
const BROWSER = process.env.REEL_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 3100;

const pass = (fs.readFileSync(path.join(ROOT, '.env'), 'utf8').match(/^ADMIN_PASSWORD=(.*)$/m) || [])[1];

(async () => {
  // servidor local: site + reel no mesmo endereço, API repassada para :3000
  const app = express();
  app.use('/api', express.raw({ type: '*/*' }), async (req, res) => {
    const r = await fetch('http://localhost:3000' + req.originalUrl, {
      method: req.method,
      headers: { 'content-type': req.headers['content-type'] || 'application/json', cookie: req.headers.cookie || '' },
      body: ['GET', 'HEAD', 'DELETE'].includes(req.method) ? undefined : req.body,
    });
    res.status(r.status);
    const sc = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
    if (sc.length) res.setHeader('set-cookie', sc);
    res.setHeader('content-type', r.headers.get('content-type') || 'application/json');
    res.send(Buffer.from(await r.arrayBuffer()));
  });
  app.use('/reel', express.static(__dirname));
  app.use(express.static(path.join(ROOT, 'public'), { extensions: ['html'] }));
  app.get('/admin', (req, res) => res.sendFile(path.join(ROOT, 'public', 'admin', 'index.html')));
  const server = app.listen(PORT);

  const browser = await chromium.launch({ executablePath: BROWSER, headless: false, args: ['--headless=new', '--force-color-profile=srgb', '--hide-scrollbars'] });
  const context = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const login = await context.request.post(`http://localhost:${PORT}/api/login`, { data: { password: pass } });
  console.log('login painel:', login.status());

  const page = await context.newPage();
  page.on('pageerror', e => console.log('erro na página:', e.message));
  await page.goto(`http://localhost:${PORT}/reel/${REEL}.html?rec=1`);
  await page.waitForFunction(() => window.reelReady);
  await page.waitForTimeout(800);

  const cdp = await context.newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', f => {
    frames.push({ data: f.data, t: f.metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
  await page.waitForTimeout(150);
  const meta = await page.evaluate(() => ({ starts: window.SCENE_STARTS, cuts: window.AUDIO_CUTS, wall: Date.now() / 1000 }));
  const dur = await page.evaluate(() => window.startReel());
  console.log('duração do reel:', dur.toFixed(1), 's — gravando...');
  await page.waitForFunction(() => window.reelDone, null, { timeout: (dur + 30) * 1000 });
  await page.waitForTimeout(300);
  await cdp.send('Page.stopScreencast');
  await browser.close(); server.close();

  // quadros -> mp4 (30 fps), respeitando o tempo real de cada quadro
  fs.rmSync(path.join(OUT, 'frames'), { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true });
  let list = '';
  frames.forEach((f, i) => {
    const name = `f${String(i).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(OUT, 'frames', name), Buffer.from(f.data, 'base64'));
    const d = i < frames.length - 1 ? frames[i + 1].t - f.t : 1 / 30;
    list += `file 'frames/${name}'\nduration ${Math.max(d, 0.001).toFixed(4)}\n`;
  });
  list += `file 'frames/f${String(frames.length - 1).padStart(5, '0')}.jpg'\n`;
  fs.writeFileSync(path.join(OUT, 'list.txt'), list);
  const span = frames.at(-1).t - frames[0].t;
  console.log(`${frames.length} quadros em ${span.toFixed(1)} s (~${(frames.length / span).toFixed(1)} fps capturados)`);
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'list.txt',
    '-vf', 'fps=30,scale=1080:1920:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
    '-movflags', '+faststart', NAME + '.mp4'], { cwd: OUT, stdio: 'inherit' });
  console.log('✅', path.join(OUT, NAME + '.mp4'));

  // narração: cada trecho do MP3 começa junto com a sua cena
  const VOZ = path.join(__dirname, 'audio', REEL === 'reel' ? 'narracao.mp3' : REEL + '.mp3');
  if (fs.existsSync(VOZ) && meta.cuts) {
    const t0 = Math.max(0, meta.wall - frames[0].t) + 0.12; // início do reel dentro do vídeo
    const n = meta.cuts.length;
    let fc = '';
    for (let i = 0; i < n; i++) {
      const a = meta.cuts[i], b = i < n - 1 ? `:end=${meta.cuts[i + 1]}` : '';
      const ms = Math.round((t0 + meta.starts[i]) * 1000);
      fc += `[1:a]atrim=start=${a}${b},asetpts=PTS-STARTPTS,adelay=${ms}|${ms}[a${i}];`;
    }
    fc += meta.cuts.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${n}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,apad[aout]`;
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', NAME + '.mp4', '-i', VOZ, '-filter_complex', fc,
      '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest',
      '-movflags', '+faststart', NAME + '-voz.mp4'], { cwd: OUT, stdio: 'inherit' });
    console.log('✅ com voz:', path.join(OUT, NAME + '-voz.mp4'));
  }
})().catch(e => { console.error(e); process.exit(1); });
