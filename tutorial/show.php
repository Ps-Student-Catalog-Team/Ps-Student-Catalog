<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php
        // 获取URL参数
        $markdownFile = isset($_GET['file']) ? $_GET['file'] : 'powershadow.md'; // 默认文件

        // 初始化标题
        $pageTitle = "默认标题";

        // 读取Markdown文件并提取标题
        if (file_exists($markdownFile)) {
            $fileContent = file_get_contents($markdownFile);
            
            // 将Markdown内容按行分割
            $lines = explode("\n", $fileContent);
            
            // 查找第一个以 '#' 开头的行
            foreach ($lines as $line) {
                if (preg_match('/^#\s*(.*)$/', $line, $matches)) {
                    $pageTitle = trim($matches[1]); // 获取第一个标题内容
                    break; // 找到标题后退出循环
                }
            }

            $pageTitle = htmlspecialchars($pageTitle); // 转义标题中的特殊字符以安全输出
        } else {
            $pageTitle = "文件不存在"; // 如果文件不存在的情况下
        }
    ?>
    <title><?php echo $pageTitle; ?></title> <!-- 将标题设置为Markdown文件的标题 -->
    <style>
        :root {
                --primary-color: #2a2a2a;
                --accent-color: #00ff9d;
                --text-color: #e0e0e0;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Noto Sans SC', system-ui, sans-serif;
            }

            body {
                background-color: var(--primary-color);
                color: var(--text-color);
                min-height: 100vh;
                line-height: 1.8;
                letter-spacing: 0.8px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            body::after {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at 50% 50%, 
                    rgba(0, 255, 157, 0.1) 0%, 
                    transparent 60%);
                pointer-events: none;
                z-index: -1;
                animation: pulse 8s infinite;
            }

            .container {
                padding: 2rem;
                width: 100%;
                max-width: 800px;
                opacity: 0;
                animation: fadeIn 0.6s ease-out 0.3s forwards;
            }

            h1 {
                font-size: 2.8rem;
                margin-bottom: 2rem;
                position: relative;
                animation: typewriter 1.2s steps(12) 0.5s both, 
                        blinkCursor 0.8s infinite;
                overflow: hidden;
                white-space: nowrap;
                border-right: 2px solid var(--accent-color);
                max-width: max-content;
            }

            h2 {
                font-size: 1.8rem;
                margin: 2rem 0 1rem;
                color: var(--accent-color);
                opacity: 0;
                animation: slideIn 0.6s ease-out 1.8s forwards;
            }

            p {
                margin: 1rem 0;
                opacity: 0;
                animation: fadeInUp 0.6s ease-out 2s forwards;
            }

            table {
                opacity: 0;
                animation: scaleIn 0.4s ease-out 2.2s forwards;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }

            @keyframes blinkCursor {
                from, to { border-color: transparent }
                50% { border-color: var(--accent-color) }
            }


            @keyframes typewriter {
                from { width: 0; }
                to { width: 100%; }
            }

            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes slideIn {
                from { opacity: 0; transform: translateX(-20px); }
                to { opacity: 1; transform: translateX(0); }
            }

            @keyframes scaleIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }

            /* 优化后的表格样式 */
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 2rem 0;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                overflow: hidden;
                text-align: center;
            }

            th, td {
                padding: 1rem;
                border-bottom: 1px solid rgba(0, 255, 157, 0.1);
                transition: background 0.3s ease;
            }

            th {
                background: rgba(0, 255, 157, 0.1);
                font-weight: 700;
            }

            tr {
            transition: background 0.5s ease; /* 增加背景颜色变化的过渡时间 */
            }

            tr:hover {
                background: rgba(0, 255, 157, 0.2); /* 改变悬停时的背景颜色 */
                animation: hoverBackground 0.5s forwards; /* 应用动画效果 */
            }

            @keyframes hoverBackground {
                0% { background-color: rgba(0, 255, 157, 0.05); } /* 初始状态 */
                100% { background-color: rgba(0, 255, 157, 0.2); } /* 最终状态 */
            }

            .a {
            position: relative;
            color: rgb(0, 189, 73) !important;
            text-decoration: none;
            padding: 5px 0;
            transition: all 0.3s ease;
        }

        .a::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: 0;
            left: 50%;
            background: currentColor;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .a:hover {
            color: #00ff9d !important;
            transform: translateY(-2px);
        }

        .a:hover::after {
            width: 100%;
            left: 0;
        }



            /* 增强的返回按钮 */
            .back-home-btn {
                display: inline-flex;
                align-items: center;
                padding: 0.8rem 1.5rem;
                margin-top: 2rem;
                background: rgba(0, 255, 157, 0.1);
                color: var(--accent-color);
                border: 2px solid var(--accent-color);
                border-radius: 50px;
                transition: all 0.3s ease;
                opacity: 0;
                animation: fadeIn 0.6s ease-out 2.4s forwards;
            }

            .btn-outline-primary,
            .btn-outline-secondary {
                display: inline-flex;
                align-items: center;
                padding: 12px 24px;
                margin: 0 10px;
                border-radius: 25px;
                text-decoration: none;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                font-weight: 500;
                backdrop-filter: blur(4px);
                position: relative;
                overflow: hidden;
                border: 2px solid transparent;
            }

            .btn-outline-primary {
                background: rgba(0, 145, 5, 0.15);
                color: var(--accent-color);
                border-color: #00ab6a;
            }

            .btn-outline-secondary {
                background: rgba(169, 169, 169, 0.15);
                color: #e0e0e0;
                border-color: #666;
            }

            /* 悬停效果 */
            .btn-outline-primary:hover,
            .btn-outline-secondary:hover {
                background: transparent;
                box-shadow: 0 0 15px rgba(0, 255, 157, 0.3);
                transform: translateY(-2px);
            }

            .btn-outline-primary:hover {
                border-color: var(--accent-color);
                color: var(--accent-color);
            }

            .btn-outline-secondary:hover {
                border-color: #999;
                color: #fff;
            }

            /* 悬浮光效 */
            .btn-outline-primary::after,
            .btn-outline-secondary::after {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    45deg,
                    transparent 25%,
                    rgba(0, 255, 157, 0.1) 50%,
                    transparent 75%
                );
                transform: rotate(45deg);
                opacity: 0;
                transition: opacity 0.3s;
            }

            .btn-outline-primary:hover::after,
            .btn-outline-secondary:hover::after {
                opacity: 1;
            }

            /* 按钮容器样式 */
            .markdown-container > div[style*="text-align: center"] {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin: 2rem 0;
                padding: 15px;
                background: rgba(42, 42, 42, 0.8);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            }

            .back-home-btn:hover {
                background: var(--accent-color);
                color: var(--primary-color);
                box-shadow: 0 0 15px rgba(0, 255, 157, 0.3);
                transform: translateY(-2px);
            }

            /* 响应式优化 */
            @media (max-width: 768px) {
                .container {
                    padding: 1rem;
                }
                
                h1 {
                    font-size: 2rem;
                }
                
                table {
                    font-size: 0.9rem;
                }
            }
        body {
        font-family: Arial, sans-serif;
        font-size: 1.5em; 
        }
        .markdown-container {
            max-width: 1500px;
            margin: 0px auto;
            padding: 30px;
            overflow-x: hidden;
            word-wrap: break-word; 
        }
        
        .markdown-container img {
            max-width: 80%;
            height: auto;
            margin: 2rem auto;
            display: block;
            border-radius: 8px;
            cursor: zoom-in;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 255, 157, 0.2);
        }


        @media (max-width: 768px) {
            .markdown-container img {
                max-width: 95%;
            }
        }

        .markdown-container img:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 25px rgba(0, 255, 157, 0.3);
        }

        .markdown-container img[src*=".gif"] {
            max-width: 60%; 
            border: 3px solid var(--accent-color);
        }

        .img-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(42, 42, 42, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            cursor: zoom-out;
        }

        .img-overlay img {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 12px;
            box-shadow: 0 0 40px rgba(0, 255, 157, 0.3);
            animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes scaleUp {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        /* 特定样式，避免Bootstrap影响Markdown内容 */
        .markdown-container h1, 
        .markdown-container h2, 
        .markdown-container h3, 
        .markdown-container h4, 
        .markdown-container h5, 
        .markdown-container h6 {
        margin-top: 1.5rem; /* 调整标题的上外边距 */
        margin-bottom: 1rem; /* 调整标题的下外边距 */
        font-weight: bold; /* 自定义字体粗细 */
        }
        .markdown-container p, 
        .markdown-container li {
        line-height: 1.6; /* 行间距 */
        }
        .markdown-container blockquote {
        border-left: 5px solid #ccc; /* 自定义引用样式 */
        padding-left: 10px;
        margin: 1rem 0;
        color: #555; /* 颜色 */
        }
        .fixed-buttons {
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(42, 42, 42, 0.95);
            backdrop-filter: blur(5px);
            padding: 15px 0;
            display: flex;
            justify-content: center;
            gap: 20px;
            transition: all 0.3s ease;
            background: rgba(42, 42, 42, 0); /* 完全透明 */
            border-bottom: 0 solid rgba(0, 255, 157, 0.3); 
            margin-bottom: 30px;
        }

        .fixed-buttons.scrolled {
            background: rgba(42, 42, 42, 0.7); /* 半透明背景 */
            border-bottom: 1px solid rgba(0, 255, 157, 0.3); /* 底部发光边框 */
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .fixed-buttons .floating-btn {
            margin: 0 8px;
        }

        .floating-btn {
            padding: 10px 25px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            border: 2px solid;
            backdrop-filter: blur(5px);
            background: rgba(42, 42, 42, 0.8);
        }

        

        .home-btn {
            color: var(--accent-color);
            border-color: var(--accent-color);
        }

        .back-btn {
            color: #00ab6a;
            border-color: #00ab6a;
        }

        .floating-btn:hover {
            background: rgba(0, 255, 157, 0.2);
            box-shadow: 0 0 15px rgba(0, 255, 157, 0.3);
            transform: translateY(-2px);
        }

    </style>
    

</head>
<body>
  <div class="markdown-container">
  <div class="fixed-buttons">
    <a href="../index.html" class="floating-btn home-btn">返回首页</a>
    <a href="javascript:history.back()" class="floating-btn back-btn">返回</a> 
  </div>

    
    <?php
      // 检查文件是否存在
      if (file_exists($markdownFile)) {
          // 使用Parsedown库解析Markdown
          require 'Parsedown.php';
          $parsedown = new Parsedown();
          echo $parsedown->text($fileContent); // 输出完整的Markdown内容
      } else {
          echo "<p>文件不存在: " . htmlspecialchars($markdownFile) . "</p>";
      }
    ?>
  </div>

    <script>
        // 添加滚动监听
        window.addEventListener('scroll', function() {
            const buttonsContainer = document.querySelector('.fixed-buttons');
            if (window.scrollY > 0) {
                buttonsContainer.classList.add('scrolled');
            } else {
                buttonsContainer.classList.remove('scrolled');
            }
        });
        document.querySelectorAll('.markdown-container img').forEach(img => {
            img.addEventListener('click', () => {
                const overlay = document.createElement('div');
                overlay.className = 'img-overlay';
                
                const clonedImg = img.cloneNode();
                clonedImg.style.cursor = 'zoom-out';
                
                overlay.appendChild(clonedImg);
                document.body.appendChild(overlay);
                document.body.style.overflow = 'hidden'; // 禁用滚动

                // 关闭全屏
                const close = () => {
                    overlay.remove();
                    document.body.style.overflow = '';
                };

                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) close();
                });

                // ESC键关闭
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') close();
                });
            });
        });
    </script>
</body>
</html>
