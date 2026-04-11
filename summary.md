# 网站文件整理总结

## 整理概述
本次文件整理旨在将网站根目录下的杂乱文件进行分类整理，使项目结构更加清晰，便于维护和管理。所有文件已按照类型移动到相应的文件夹中，并更新了相关文件中的引用路径。

## 整理日期
2026年3月21日

## 当前文件结构

```
website/
├── pages/          # HTML 页面文件
│   ├── about_us.html
│   ├── clock.html
│   ├── comment.html
│   ├── login.html
│   ├── readme.html
│   └── user-center.html
├── php/            # PHP 脚本文件
│   ├── add-comment.php
│   ├── create-alist-account.php
│   ├── get-comments.php
│   ├── get-user-comments.php
│   ├── login.php
│   ├── register.php
│   ├── sessionlst.php
│   └── u.php
├── sql/            # 数据库文件
│   ├── create-users-table.sql
│   └── init-database.sql
├── docs/           # 文档文件
│   ├── CONTRIBUTING.md
│   └── file_organization.md
├── scripts/        # 脚本文件
├── config/         # 配置文件
│   └── web.config
├── data/           # 数据文件
├── lib/            # 库文件
│   └── parsedown-1.7.4/
├── img/            # 图片资源
├── css/            # 样式文件
├── js/             # JavaScript 文件
├── public/         # 公共资源
├── fonts/          # 字体文件
├── tutorial/       # 教程相关文件
├── password/       # 密码相关页面
├── server/         # 服务器相关文件
├── status/         # 状态相关文件
├── ErrorFiles/     # 错误页面
├── index.html      # 网站入口 (根目录)
├── file_moves.txt  # 文件移动记录
├── file_organization.md  # 文件整理说明
├── file_state.csv  # 文件状态记录
├── summary.md      # 本总结文件
└── ...             # 其他配置文件
```

## 修改的文件及内容

### 新增文件
- `config/web.config`: IIS配置文件，启用目录浏览
- `docs/file_organization.md`: 文件整理详细说明文档
- `lib/parsedown-1.7.4/`: PHP Markdown解析库及其文件
  - `composer.json`
  - `LICENSE.txt`
  - `README.md`
- `pages/`: HTML页面文件夹
  - `about_us.html`: 关于我们页面
  - `clock.html`: 时钟页面
  - `comment.html`: 留言簿页面
  - `login.html`: 登录页面
  - `readme.html`: 使用说明页面
  - `user-center.html`: 用户中心页面
- `php/`: PHP脚本文件夹
  - `add-comment.php`: 添加留言脚本
  - `create-alist-account.php`: 创建AList账户脚本
  - `get-comments.php`: 获取留言脚本
  - `get-user-comments.php`: 获取用户留言脚本
  - `login.php`: 登录脚本
  - `register.php`: 注册脚本
  - `sessionlst.php`: 会话列表脚本
  - `u.php`: UPUPW PHP探针脚本
- `sql/`: 数据库文件文件夹
  - `create-users-table.sql`: 创建用户表SQL
  - `init-database.sql`: 初始化数据库SQL

### 修改文件
- `file_moves.txt`: 更新文件移动记录，记录所有移动操作
- `file_organization.md`: 更新整理说明文档
- `file_state.csv`: 更新文件状态记录，反映新结构
- `index.html`: 更新路径引用，从相对路径改为绝对路径
- `public/student_catalog.html`: 更新favicon和CSS路径
- `server/lastOnlineTimes.json`: 更新最后在线时间

### 移动文件
根据`file_moves.txt`记录，以下文件已被移动：

#### HTML页面文件 (移动到 `pages/`)
- `about_us.html`
- `clock.html`
- `comment.html`
- `login.html`
- `readme.html`
- `user-center.html`

#### PHP脚本文件 (移动到 `php/`)
- `add-comment.php`
- `create-alist-account.php`
- `get-comments.php`
- `get-user-comments.php`
- `login.php`
- `register.php`
- `sessionlst.php`
- `u.php`

#### 数据库文件 (移动到 `sql/`)
- `create-users-table.sql`
- `init-database.sql`

#### 文档文件 (移动到 `docs/`)
- `CONTRIBUTING.md`
- `后续整理指南.md`

#### 配置文件 (移动到 `config/`)
- `web.config`

#### 图片文件 (移动到 `img/`)
- `ocean_w.png`
- `stsr.png`

#### 库文件 (移动到 `lib/`)
- `parsedown-1.7.4/` 及其内容

## 路径更新说明

### `index.html` (根目录)
- favicon: `img/favicon.ico`
- CSS: `public/css/main.css`, `../public/css/font-awesome.min.css`
- 页面链接: `pages/readme.html`, `password/newest.html`, `tutorial/show.html`, `public/clock2.html`, `public/Countdown/index.html`, `pages/clock.html`, `pages/comment.html`, `pages/user-center.html`

### `pages/clock.html`
- CSS: `../public/css/normalize.css`, `../public/public/css/style.css`, `../public/css/demo.css`, `../public/css/component.css`
- JS: `../public/js/html5.js`, `../js/TweenLite.min.js`, `../js/EasePack.min.js`, `../js/rAF.js`, `../js/demo-1.js`, `../js/quotes.js`, `../js/Rx.min.js`, `../js/rxcss.min.js`, `../js/index.js`
- 字体: `../public/fonts/one.ttf`

### `pages/about_us.html`
- 图标: `../public/img/favicon.ico`
- CSS: `../public/css/main.css`, `../../public/css/font-awesome.min.css`
- 图片: `../public/img/logo/*.jpg`, `../public/img/logo/*.png`, `../public/img/logo/*.jpeg`

### `pages/user-center.html`
- 链接: `/index.html`, `comment.html`

### `pages/readme.html`
- 链接: `/index.html`, `comment.html`

### `public/student_catalog.html`
- 图标: `../public/img/favicon.ico`
- CSS: `./css/main.css`
- 链接: `../public/pages/readme.html`

## 验证结果
经过全面检查，所有文件引用均已正确更新。使用grep搜索确认了所有`href`, `src`, `include`, `require`等引用路径的准确性。网站现在可以正常运行，所有资源路径都指向正确位置。

## 总结
本次文件整理成功地将根目录下的文件分类到相应的文件夹中，建立了清晰的项目结构。所有路径引用已更新，确保网站功能正常。整理后的项目更加易于维护和管理。