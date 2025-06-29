<!DOCTYPE html>
<html>
<head>
    <title>VPN会话监控</title>
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


        table {
            width: 100%;
            border-collapse: collapse;
            margin: 2rem 0;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            overflow: hidden;
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
            from { 
                opacity: 0; 
                transform: scale(0.95); 
            }
            to { 
                opacity: 1; 
                transform: scale(1); 
            }
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
        
        .name {
            text-align: right;
            margin-top: 20px;
        }

    </style>

</head>
<body>
<div class="markdown-container">
  <div class="fixed-buttons">
    <a href="../index.php" class="floating-btn home-btn">返回首页</a>
    <a href="javascript:history.back()" class="floating-btn back-btn">返回</a> 
  </div>
    <div class="container" style="align-items: center">
        <h1>VPN会话流量统计</h1>
        <h2 style="text-align:right;font-size: 1.4rem">让我看看是谁在用网呀╰(￣ω￣ｏ)~</h2>
        <table id="sessionTable">
        <thead>
            <tr>
                <th>序号</th>
                <th>会话名</th>
                <th>传输字节</th>
                <th>传输数据包</th>
            </tr>
        </thead>
        <tbody id="tableBody">
        </tbody>
    </table>
    <p class="name">数据更新频率：每10s更新一次</p>
    <p class="name">注：传输字节单位为字节，传输数据包单位为包</p>

    </div>
    <script>
        window.addEventListener('DOMContentLoaded', () => {
            fetch('status/sessionlst.txt')  // 根据实际路径调整
                .then(response => response.text())
                .then(text => {
                    const sessions = parseSessionData(text);
                    populateTable(sessions);
                })
                .catch(error => console.error('读取文件失败:', error));
        });

        function parseSessionData(text) {
            const lines = text.split('\n');
            const sessions = [];
            let currentSession = {};
            let counter = 1;
            let time = ' ';

            lines.forEach(line => {
                if (line.startsWith('会话名')) {
                    currentSession.name = line.split('|')[1].trim();
                } else if (line.startsWith('传输字节')) {
                    const rawBytes = line.split('|')[1].trim().replace(/,/g, '');
                    currentSession.bytes = formatBytes(rawBytes);
                } else if (line.startsWith('传输数据包')) {
                    currentSession.packets = line.split('|')[1].trim();
                    sessions.push({
                        id: counter++,
                        name: currentSession.name,
                        bytes: currentSession.bytes,
                        packets: currentSession.packets
                    });
                    currentSession = {};
                } else if (line.startsWith('时间')) {
                    time = line.split('|')[1].trim();
                }
            });

            return sessions;
        }

        function formatBytes(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
            if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
            return (bytes / 1073741824).toFixed(2) + ' GB';
        }

        function populateTable(sessions) {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';
            
            sessions.forEach(session => {
                const row = `<tr>
                    <td>${session.id}</td>
                    <td>${session.name}</td>
                    <td>${session.bytes}</td>
                    <td>${session.packets}</td>
                </tr>`;
                tbody.innerHTML += row;
            });
        }

    </script>
</body>
</html>
