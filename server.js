const express = require('express');
const net = require('net');
const cors = require('cors');
const { exec } = require('child_process'); // 引入child_process模块
const fs = require('fs');
const path = require('path');

const app = express();

// 启用CORS中间件
app.use(cors());

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
    const command = `vpncmd ${req.query.ip} /server /password:adm1n5 /hub:vpn /cmd statusget`;

    // 执行命令
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`[ERROR] 执行命令错误: ${error.message}`);
            return res.status(500).json({ error: 'Failed to execute command' });
        }
        if (stderr) {
            console.error(`[ERROR] 命令输出错误: ${stderr}`);
            return res.status(500).json({ error: 'Command execution failed' });
        }

        // 解析输出以获取有效会话数
        const sessionMatch = stdout.match(/会话数\s*\|\s*([0-9]+)/);
        const sessionCount = sessionMatch ? parseInt(sessionMatch[1], 10) : 0;

        res.json({
            ip: req.query.ip,
            sessionCount: sessionCount - 1
        });
    });
});

// 绑定到所有网络接口
app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:3000');
});
