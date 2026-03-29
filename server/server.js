const express = require('express');
const net = require('net');
const cors = require('cors');
const { exec } = require('child_process'); // 引入child_process模块
const fs = require('fs');
const path = require('path');

const app = express();

// 启用CORS中间件
app.use(cors());

// 添加静态文件服务
app.use(express.static(path.join(__dirname, '..')));

// 解析JSON请求体
app.use(express.json());
// 解析URL编码的请求体
app.use(express.urlencoded({ extended: true }));

// 添加健康检查端点
app.get('/health', (req, res) => {
    res.status(200).send('Service Healthy');
});

let lastOnlineTimes = {};

// 从文件中加载最后在线时间
const loadLastOnlineTimes = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'lastOnlineTimes.json'), 'utf8');
        lastOnlineTimes = JSON.parse(data);
    } catch (err) {
        console.error(`[ERROR] 加载文件错误: ${err.message}`);
        lastOnlineTimes = {};
    }
};

// 将最后在线时间保存到文件中
const saveLastOnlineTimes = () => {
    try {
        fs.writeFileSync(path.join(__dirname, 'lastOnlineTimes.json'), JSON.stringify(lastOnlineTimes, null, 2));
    } catch (err) {
        console.error(`[ERROR] 保存文件错误: ${err.message}`);
    }
};

loadLastOnlineTimes();

app.get('/api/vpn-status', async (req, res) => {
    // 添加请求日志
    console.log(`[${new Date().toISOString()}] 检测IP: ${req.query.ip}`);

    // 添加参数验证
    if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(req.query.ip)) {
        return res.status(400).json({ error: 'Invalid IP format' });
    }

    const start = Date.now();
    const client = net.createConnection({
        port: 443,
        host: req.query.ip,
        timeout: 5000 // 添加超时控制
    });

    // 统一处理响应
    const sendResponse = (online) => {
        clearTimeout(timeoutHandle);
        if (online) {
            lastOnlineTimes[req.query.ip] = new Date().toLocaleString();
            saveLastOnlineTimes(); // 保存最后在线时间到文件
        }
        res.json({
            online,
            ping: online ? Date.now() - start : null,
            lastOnline: lastOnlineTimes[req.query.ip] || '从未在线'
        });
    };

    // 超时处理
    const timeoutHandle = setTimeout(() => {
        client.destroy();
        sendResponse(false);
    }, 1000);

    client.on('connect', () => {
        client.end();
        sendResponse(true);
    });

    client.on('error', (err) => {
        console.error(`[ERROR] 检测错误: ${err.message}`);
        sendResponse(false);
    });
});

// 添加查询VPN当前在线人数的端点
app.get('/api/vpn-users', async (req, res) => {
    // 添加请求日志
    console.log(`[${new Date().toISOString()}] 查询VPN用户数: ${req.query.ip}`);

    // 添加参数验证
    if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(req.query.ip)) {
        return res.status(400).json({ error: 'Invalid IP format' });
    }

    // 构建vpncmd命令
    const command = `"C:\\Program Files\\SoftEther VPN Server Developer Edition\\vpncmd.exe" ${req.query.ip} /server /password:adm1n5 /hub:vpn /cmd statusget`;

    // 执行命令
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`[ERROR] 执行命令错误: ${error.message}`);
            console.error(`[ERROR] 执行命令 stderr: ${stderr}`);
            return res.status(500).json({ error: 'Failed to execute command', details: error.message });
        }

        if (stderr) {
            // 某些情况下 vpncmd 会把普通信息输出到 stderr，例如警告或进度提示
            console.warn(`[WARN] 命令 stderr: ${stderr}`);
        }

        const parseSessionCount = (output) => {
            const lines = output.split(/\r?\n/);
            for (const line of lines) {
                // 优先抽取主会话数行，排除客户端和网桥细分行
                if (/^\s*会话数[\s\u3000]*\|/.test(line) && !/会话数\s*\(客户端\)|会话数\s*\(网桥\)/.test(line)) {
                    const m = line.match(/会话数[\s\u3000]*\|[\s\u3000]*([0-9]+)/);
                    if (m) return parseInt(m[1].replace(/,/g, ''), 10);
                }
                // 兼容英文输出形式
                if (/\b(SessionCount|CurrentSessions|Sessions)\b/i.test(line)) {
                    const m = line.match(/\|[\s\u3000]*([0-9]+)/);
                    if (m) return parseInt(m[1].replace(/,/g, ''), 10);
                }
            }
            return null;
        };

        const sessionCount = parseSessionCount(stdout);

        if (sessionCount === null) {
            console.error('[ERROR] 无法从 vpncmd 输出解析会话数', { stdout, stderr });
            return res.status(500).json({ error: 'Failed to parse VPN user count', details: stdout.trim() || stderr.trim() });
        }

        res.json({
            ip: req.query.ip,
            sessionCount: sessionCount,
            rawOutput: stdout.trim()
        });
    });
});

// 添加拉取同步最新更改的端点
app.get('/api/pull-updates', (req, res) => {
    console.log(`[${new Date().toISOString()}] 执行 git pull 命令`);
    
    // 执行 git pull 命令
    exec('git pull', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
        if (error) {
            console.error(`[ERROR] 执行 git pull 错误: ${error.message}`);
            return res.status(500).json({ error: 'Failed to pull updates', details: error.message });
        }
        if (stderr) {
            console.error(`[ERROR] git pull 输出错误: ${stderr}`);
            // 即使有stderr，也尝试返回stdout，因为git pull可能会在stderr中输出一些信息
        }
        
        console.log(`[INFO] git pull 执行成功: ${stdout}`);
        res.json({ success: true, message: 'Updates pulled successfully', output: stdout });
    });
});

// 添加获取最新VPN密码的端点
app.get('/api/vpn-password', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'vpn-password.json');
        const passwordData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(passwordData);
        res.json(data);
    } catch (err) {
        console.error(`[ERROR] 读取VPN密码文件错误: ${err.message}`);
        res.status(500).json({ error: 'Failed to read VPN password data' });
    }
});

// 添加获取公告内容的端点
app.get('/api/announcement', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'announcement.json');
        const announcementData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(announcementData);
        
        // 获取文件修改时间
        const stats = fs.statSync(filePath);
        const modifiedTime = stats.mtime;
        
        // 格式化为本地时间字符串
        const formattedTime = modifiedTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        // 将自动生成的修改时间添加到响应中
        data.serverModifiedTime = formattedTime;
        
        res.json(data);
    } catch (err) {
        console.error(`[ERROR] 读取公告文件错误: ${err.message}`);
        res.status(500).json({ error: 'Failed to read announcement data' });
    }
});

// 绑定到所有网络接口
app.listen(3132, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:3132');
});
