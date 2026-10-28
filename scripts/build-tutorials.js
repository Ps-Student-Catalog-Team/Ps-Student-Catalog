/**
 * 将 public/tutorial 下的 Markdown 教程预渲染为纯静态 HTML（左侧目录 + 右侧内容）。
 * 生成的页面不依赖 JS / PHP 即可显示内容，兼容旧浏览器 / IE。
 *
 * 用法：node scripts/build-tutorials.js
 */
const fs = require('fs');
const path = require('path');
const marked = require(path.join(__dirname, '..', 'public', 'js', 'marked.min.js'));

const TUTORIAL_DIR = path.join(__dirname, '..', 'public', 'tutorial');

marked.setOptions({ gfm: true, breaks: false });

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function extractTitle(md, fallback) {
    const m = /^#\s+(.+)$/m.exec(md);
    return m ? m[1].trim() : fallback;
}

/**
 * 给 h1/h2/h3 加 id，并生成目录数据。
 * 返回 { html, toc: [{ level, id, text }] }
 */
function buildToc(html) {
    const toc = [];
    let counter = 0;
    const out = html.replace(/<h([1-3])>([\s\S]*?)<\/h\1>/g, (match, level, inner) => {
        counter += 1;
        const id = 'sec-' + counter;
        const text = inner.replace(/<[^>]+>/g, '').trim();
        toc.push({ level: Number(level), id, text });
        return `<h${level} id="${id}">${inner}</h${level}>`;
    });
    return { html: out, toc };
}

function tocHtml(toc) {
    if (!toc.length) return '';
    const items = toc
        .map((t) => {
            const cls = 'toc-h' + t.level;
            return `        <li><a class="${cls}" href="#${t.id}">${escapeHtml(t.text)}</a></li>`;
        })
        .join('\n');
    return `    <ul class="toc-list">\n${items}\n    </ul>`;
}

function pageTemplate(title, bodyHtml, tocListHtml) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--[if lt IE 9]>
<script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
<![endif]-->
<title>${escapeHtml(title)}</title>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    body {
        background-color: #2a2a2a;
        color: #e0e0e0;
        font-family: "Microsoft YaHei", "PingFang SC", "Segoe UI", Arial, sans-serif;
        font-size: 16px;
        line-height: 1.8;
        letter-spacing: 0.5px;
        padding-bottom: 40px;
    }

    /* ===== 顶部工具条 ===== */
    .toolbar {
        max-width: 1800px;
        margin: 0 auto;
        padding: 14px 30px 0;
        overflow: hidden;
    }
    .toolbar a {
        float: left;
        margin-right: 10px;
        padding: 8px 22px;
        border: 2px solid #00ff9d;
        border-radius: 22px;
        color: #00ff9d;
        text-decoration: none;
        font-size: 15px;
        line-height: 1.2;
    }
    .toolbar a.back { border-color: #00ab6a; color: #00ab6a; }
    .toolbar a:hover { background: rgba(0, 255, 157, 0.15); }

    /* ===== 双栏布局：旧浏览器用 float，现代浏览器用 flex ===== */
    .page-layout {
        max-width: 1800px;
        margin: 0 auto;
        padding: 30px;
        *zoom: 1;
    }
    .page-layout:after { content: ""; display: table; clear: both; }

    .toc-sidebar {
        float: left;
        width: 280px;
        margin-right: 30px;
        background: #232323;
        border: 1px solid rgba(0, 255, 157, 0.2);
        border-radius: 12px;
        padding: 20px;
    }
    .markdown-container {
        margin-left: 310px;
        min-height: 60vh;
        overflow-x: hidden;
        word-wrap: break-word;
    }

    @supports (display: flex) {
        .page-layout { display: flex; align-items: flex-start; gap: 30px; }
        .toc-sidebar {
            float: none;
            margin-right: 0;
            flex-shrink: 0;
            position: -webkit-sticky;
            position: sticky;
            top: 20px;
            height: -webkit-fit-content;
            height: fit-content;
            max-height: calc(100vh - 40px);
            overflow-y: auto;
        }
        .markdown-container { margin-left: 0; flex: 1; min-width: 0; }
    }

    /* ===== 目录 ===== */
    .toc-title {
        font-size: 1.2em;
        font-weight: bold;
        color: #00ff9d;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 2px solid rgba(0, 255, 157, 0.3);
    }
    .toc-title:before { content: "📑 "; }
    .toc-list { list-style: none; padding: 0; margin: 0; }
    .toc-list li { margin: 0; padding: 0; }
    .toc-list a {
        display: block;
        padding: 8px 12px;
        color: #ccc;
        text-decoration: none;
        border-radius: 6px;
        font-size: 0.95em;
        line-height: 1.4;
        border-left: 3px solid transparent;
    }
    .toc-list a:hover {
        background: rgba(0, 255, 157, 0.1);
        color: #00ff9d;
        padding-left: 15px;
    }
    .toc-list .toc-h1 { font-weight: 600; font-size: 1em; }
    .toc-list .toc-h2 { padding-left: 20px; font-size: 0.9em; }
    .toc-list .toc-h3 { padding-left: 35px; font-size: 0.85em; color: #aaa; }
    .toc-list .toc-h3:hover { color: #00ff9d; }

    /* ===== Markdown 内容 ===== */
    .markdown-container h1, .markdown-container h2, .markdown-container h3,
    .markdown-container h4, .markdown-container h5, .markdown-container h6 {
        margin: 1.4em 0 0.6em;
        font-weight: bold;
        line-height: 1.4;
    }
    .markdown-container h1 { font-size: 2em; color: #00ff9d; border-bottom: 1px solid rgba(0,255,157,0.25); padding-bottom: 8px; }
    .markdown-container h2 { font-size: 1.6em; color: #00ff9d; }
    .markdown-container h3 { font-size: 1.3em; color: #7dffce; }
    .markdown-container h4 { font-size: 1.1em; color: #7dffce; }
    .markdown-container p, .markdown-container li { line-height: 1.75; }
    .markdown-container p { margin: 0.8em 0; }
    .markdown-container ul, .markdown-container ol { margin: 0.8em 0 0.8em 2em; }
    .markdown-container li { margin: 0.3em 0; }
    .markdown-container a { color: #00d0ff; text-decoration: underline; }
    .markdown-container strong { color: #ffffff; }
    .markdown-container code {
        background: #1c1c1c;
        color: #ffd479;
        padding: 1px 5px;
        border-radius: 3px;
        font-family: Consolas, "Courier New", monospace;
        font-size: 0.92em;
    }
    .markdown-container pre {
        background: #1c1c1c;
        color: #e8f0ff;
        border: 1px solid #3a3a3a;
        border-left: 4px solid #00ff9d;
        padding: 14px 16px;
        margin: 1em 0;
        overflow: auto;
        border-radius: 6px;
        line-height: 1.6;
    }
    .markdown-container pre code {
        background: none;
        color: inherit;
        padding: 0;
        font-size: 0.9em;
        white-space: pre;
    }
    .markdown-container blockquote {
        border-left: 5px solid #00ff9d;
        background: #232323;
        padding: 8px 14px;
        margin: 1em 0;
        color: #b9b9b9;
    }
    .markdown-container table { width: 100%; border-collapse: collapse; margin: 1em 0; }
    .markdown-container th, .markdown-container td {
        border: 1px solid #444;
        padding: 8px 10px;
        text-align: left;
    }
    .markdown-container th { background: #333; color: #00ff9d; }
    .markdown-container tr:nth-child(even) td { background: #2f2f2f; }
    .markdown-container img {
        max-width: 90%;
        height: auto;
        display: block;
        margin: 1.5em auto;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 255, 157, 0.2);
    }
    .markdown-container hr { border: 0; border-top: 1px solid #444; margin: 2em 0; }

    /* ===== 窄屏：目录放到内容上方 ===== */
    @media (max-width: 900px) {
        .toolbar { padding: 10px 12px 0; }
        .page-layout { padding: 12px; }
        .toc-sidebar {
            float: none;
            width: auto;
            margin: 0 0 20px;
            position: static;
        }
        .markdown-container { margin-left: 0; }
        .markdown-container img { max-width: 100%; }
    }
</style>
</head>
<body>
<div class="toolbar">
    <a href="/index.html">返回首页</a>
    <a class="back" href="javascript:history.back()">返回</a>
</div>
<div class="page-layout">
    <div class="toc-sidebar">
        <div class="toc-title">目录</div>
${tocListHtml}
    </div>
    <div class="markdown-container">
${bodyHtml}
    </div>
</div>
<script>
/* 目录吸顶兜底：仅当浏览器不支持 position:sticky 时启用（旧内核/IE） */
(function () {
    var sidebar = document.querySelector('.toc-sidebar');
    if (!sidebar) return;
    var probe = document.createElement('div').style;
    probe.position = 'sticky';
    if (probe.position === 'sticky') return;

    var offset = 20;
    var baseTop = 0;
    var baseLeft = 0;
    var fixed = false;

    function pageY() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }
    function pageX() {
        return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    }
    function measure() {
        var rect = sidebar.getBoundingClientRect();
        baseTop = rect.top + pageY();
        baseLeft = rect.left + pageX();
        sidebar.style.width = rect.width + 'px';
    }
    function stick() {
        var y = pageY();
        if (y > baseTop - offset) {
            if (!fixed) {
                fixed = true;
                sidebar.style.position = 'fixed';
                sidebar.style.top = offset + 'px';
                sidebar.style.left = baseLeft + 'px';
                sidebar.style.marginTop = '0';
            }
        } else if (fixed) {
            fixed = false;
            sidebar.style.position = '';
            sidebar.style.top = '';
            sidebar.style.left = '';
        }
    }
    measure();
    stick();
    if (window.addEventListener) {
        window.addEventListener('scroll', stick, false);
        window.addEventListener('resize', function () { measure(); stick(); }, false);
    } else if (window.attachEvent) {
        window.attachEvent('onscroll', stick);
        window.attachEvent('onresize', function () { measure(); stick(); });
    }
})();
</script>
</body>
</html>
`;
}

function build() {
    const files = fs.readdirSync(TUTORIAL_DIR).filter((f) => /\.md$/i.test(f));
    let count = 0;
    files.forEach((file) => {
        const mdPath = path.join(TUTORIAL_DIR, file);
        const md = fs.readFileSync(mdPath, 'utf8');
        const base = file.replace(/\.md$/i, '');
        const title = extractTitle(md, base);
        const rendered = marked.parse(md);
        const { html, toc } = buildToc(rendered);
        const page = pageTemplate(title, html, tocHtml(toc));
        fs.writeFileSync(path.join(TUTORIAL_DIR, base + '.html'), page, 'utf8');
        count++;
        console.log(`generated: public/tutorial/${base}.html  (${title})  目录项: ${toc.length}`);
    });
    console.log(`\nDone. ${count} file(s) generated.`);
}

build();
