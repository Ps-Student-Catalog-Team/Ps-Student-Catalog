from pathlib import Path
files = {
    'd:/website/index.html',
    'd:/website/public/pages/clock.html',
    'd:/website/public/pages/clock2.html',
    'd:/website/public/pages/about_us.html',
    'd:/website/public/pages/student_catalog.html',
    'd:/website/public/pages/user-center.html',
    'd:/website/public/pages/comment.html',
    'd:/website/public/pages/login.html',
    'd:/website/public/password/newest.html',
    'd:/website/public/css/demo.css',
    'd:/website/public/css/component.css',
}
replacements = {
    # root index
    '../public/css/font-awesome.min.css': 'public/css/font-awesome.min.css',
    'href="pages/readme.html"': 'href="public/pages/readme.html"',
    'href="pages\\about_us.html"': 'href="public/pages/about_us.html"',
    '../public/password/newest.html': 'public/password/newest.html',
    '../public/pages/clock.html': 'public/pages/clock.html',
    '../public/pages/clock2.html': 'public/pages/clock2.html',
    '../public/pages/comment.html': 'public/pages/comment.html',
    '../public/pages/user-center.html': 'public/pages/user-center.html',
    # pages folder common fixes
    '../public/css/': '../css/',
    '../public/js/': '../js/',
    '../public/img/': '../img/',
    '../public/fonts/': '../fonts/',
    '../public/php/': '../php/',
    '../public/password/': '../password/',
    # student_catalog specific
    '../public/pages/readme.html': 'readme.html',
    '../public/pages/about_us.html': 'about_us.html',
    # clock2 scripts
    'script src="js/': 'script src="../js/',
    "script src='js/": "script src='../js/",
    # password file
    '.\\password\\copy-script.js': './copy-script.js',
    # css files
    "url('../public/fonts/": "url('../fonts/",
    "url('../public/img/": "url('../img/",
    'url(../public/img/deco.svg)': 'url(../img/deco.svg)',
    # login/comment old php
    "../public/php/login.php": "../php/login.php",
    "../public/php/register.php": "../php/register.php",
    "../public/php/add-comment.php": "../php/add-comment.php",
    "../public/php/get-comments.php": "../php/get-comments.php",
}
for path in files:
    p = Path(path)
    if not p.exists():
        print('MISSING', p)
        continue
    text = p.read_text(encoding='utf-8', errors='ignore')
    orig = text
    for old, new in replacements.items():
        text = text.replace(old, new)
    if text != orig:
        p.write_text(text, encoding='utf-8')
        print('UPDATED', p)
    else:
        print('UNCHANGED', p)
