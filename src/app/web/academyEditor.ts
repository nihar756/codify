/* =========================================================
   Academy Web Editor (TypeScript, React-safe)
   ========================================================= */

type AceEditor = any;
let initialized = false;


/* -------------------- Globals -------------------- */

let edHtml: AceEditor | null = null;
let edCss: AceEditor | null = null;
let edJs: AceEditor | null = null;

let output: HTMLElement | null = null;
let preview: HTMLIFrameElement | null = null;

const STORAGE_KEY = 'academy-codelab-web';

let cleanup: Array<() => void> = [];

/* -------------------- Helpers -------------------- */

const $ = <T extends HTMLElement = HTMLElement>(s: string) =>
  document.querySelector<T>(s);

const $$ = <T extends HTMLElement = HTMLElement>(s: string) =>
  Array.from(document.querySelectorAll<T>(s));

function on<K extends keyof HTMLElementEventMap>(
  el: HTMLElement | null,
  ev: K,
  fn: (e: HTMLElementEventMap[K]) => void
) {
  if (!el) return;
  el.addEventListener(ev, fn);
  cleanup.push(() => el.removeEventListener(ev, fn));
}

function log(msg: string, type: 'info' | 'warn' | 'error' = 'info') {
  if (!output) return;
  const div = document.createElement('div');
  div.textContent = msg;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

/* =========================================================
   PUBLIC API
   ========================================================= */

export function initAcademyEditor() {
  if (initialized) return;     // 🔴 ADD THIS
  if (!window.ace) return;

  initialized = true;          // 🔴 ADD THIS

  output = $('#output');
  preview = $('#preview') as HTMLIFrameElement;

  edHtml = makeEditor('ed_html', 'ace/mode/html');
  edCss  = makeEditor('ed_css',  'ace/mode/css');
  edJs   = makeEditor('ed_js',   'ace/mode/javascript');

  setupTabs();
  setupActions();
  restoreProject();

  log('Ready — Web-only Editor ✨');
}

export function destroyAcademyEditor() {
  cleanup.forEach(fn => fn());
  cleanup = [];

  edHtml?.destroy();
  edCss?.destroy();
  edJs?.destroy();

  edHtml = edCss = edJs = null;
  initialized = false; // 🔴 ADD THIS
}


/* =========================================================
   ACE SETUP
   ========================================================= */

function makeEditor(id: string, mode: string): AceEditor {
  const ed = window.ace.edit(id, {
    theme: 'ace/theme/dracula',
    mode,
    tabSize: 2,
    useSoftTabs: true,
    wrap: true,
    showPrintMargin: false,
  });

  ed.commands.addCommand({
    name: 'run',
    bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
    exec: () => run(false),
  });

  ed.commands.addCommand({
    name: 'save',
    bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
    exec: saveProject,
  });

  return ed;
}

/* =========================================================
   TABS
   ========================================================= */

function setupTabs() {
  const tabs = $$('#webTabs .tab');
  const wraps = $$('#webEditors .editor-wrap');

  on($('#webTabs'), 'click', (e: Event) => {
    const btn = (e.target as HTMLElement).closest('.tab') as HTMLElement;
    if (!btn) return;

    const pane = btn.dataset.pane;
    wraps.forEach(w => (w.hidden = w.dataset.pane !== pane));
    tabs.forEach(t => t.classList.toggle('active', t === btn));

    requestAnimationFrame(() => {
      const ed = pane === 'html' ? edHtml : pane === 'css' ? edCss : edJs;
      ed?.resize(true);
      ed?.focus();
    });
  });
}

/* =========================================================
   ACTIONS / BUTTONS
   ========================================================= */

function setupActions() {
  if (!$('#runWeb')) {
    console.warn("Editor DOM not ready, retrying actions...");
    setTimeout(setupActions, 50);
    return;
  }

  on($('#runWeb'), 'click', () => run(false));
  on($('#runTests'), 'click', () => run(true));
  on($('#clearOut'), 'click', clearOutput);
  on($('#saveBtn'), 'click', saveProject);
  on($('#openPreview'), 'click', openPreview);
  on($('#loadBtn'), 'click', () => $('#openFile')?.click());

  on($('#openFile'), 'change', async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const obj = JSON.parse(await file.text());
      loadProject(obj);
    } catch {
      log('Invalid project file', 'error');
    }
  });
}

/* =========================================================
   PREVIEW
   ========================================================= */

function buildSrcDoc(withTests: boolean): string {
  const tests = ($('#testArea') as HTMLTextAreaElement | null)?.value || '';

  return `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>${edCss?.getValue() || ''}</style>
</head>
<body>
${edHtml?.getValue() || ''}
<script>
try {
${edJs?.getValue() || ''}
${withTests ? tests : ''}
} catch (e) { console.error(e); }
<\/script>
</body>
</html>`;
}

function run(withTests: boolean) {
  if (!preview) return;
  preview.srcdoc = buildSrcDoc(withTests);
  log(withTests ? 'Run with tests.' : 'Preview updated.');
}

function openPreview() {
  const src = buildSrcDoc(false);
  const w = window.open('about:blank');
  if (!w) return;
  w.document.open();
  w.document.write(src);
  w.document.close();
}

/* =========================================================
   STORAGE
   ========================================================= */

interface Project {
  assignment: string;
  test: string;
  html: string;
  css: string;
  js: string;
}

function normalizeProject(raw: any): Project {
  return {
    assignment: raw.assignment ?? '',
    test: raw.test ?? '',
    html: raw.html ?? '',
    css: raw.css ?? '',
    js: raw.js ?? '',
  };
}

function saveProject() {
  const data: Project = {
    assignment: ($('#assignment') as HTMLTextAreaElement | null)?.value || '',
    test: ($('#testArea') as HTMLTextAreaElement | null)?.value || '',
    html: edHtml?.getValue() || '',
    css: edCss?.getValue() || '',
    js: edJs?.getValue() || '',
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'academy-web.json';
  a.click();

  log('Project saved.');
}

function loadProject(raw: any) {
  const p = normalizeProject(raw);

  const a = $('#assignment') as HTMLTextAreaElement | null;
  const t = $('#testArea') as HTMLTextAreaElement | null;

  if (a) a.value = p.assignment;
  if (t) t.value = p.test;

  edHtml?.setValue(p.html, -1);
  edCss?.setValue(p.css, -1);
  edJs?.setValue(p.js, -1);

  log('Project loaded.');
}

function restoreProject() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) loadProject(JSON.parse(cached));
    else setDefaultContent();
  } catch {
    setDefaultContent();
  }
}

/* =========================================================
   DEFAULT CONTENT
   ========================================================= */

function setDefaultContent() {
  edHtml?.setValue(
`<section class="card">
  <h1>Welcome to Codify</h1>
  <button id="btn">Click me</button>
</section>`, -1);

  edCss?.setValue(
`body { font-family: system-ui; }
button { padding: 8px 12px; }`, -1);

  edJs?.setValue(
`document.getElementById('btn')?.addEventListener('click', () => {
  alert('Well done!');
});`, -1);
}

/* =========================================================
   OUTPUT
   ========================================================= */

function clearOutput() {
  if (output) output.innerHTML = '';
}
