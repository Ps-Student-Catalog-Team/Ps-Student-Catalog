const express = require('express');
const net = require('net');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend/dist')));

// 健康检查
app.get('/health', (req, res) => {
    res.status(200).send('Service Healthy');
});

// ping 接口，用于前端探测服务器可用性
app.get('/api/ping', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

let lastOnlineTimes = {};

const loadLastOnlineTimes = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'lastOnlineTimes.json'), 'utf8');
        lastOnlineTimes = JSON.parse(data);
    } catch (err) {
        console.error(`[ERROR] 加载文件错误: ${err.message}`);
        lastOnlineTimes = {};
    }
};

const saveLastOnlineTimes = () => {
    try {
        fs.writeFileSync(path.join(__dirname, 'lastOnlineTimes.json'), JSON.stringify(lastOnlineTimes, null, 2));
    } catch (err) {
        console.error(`[ERROR] 保存文件错误: ${err.message}`);
    }
};

loadLastOnlineTimes();

let lastNetworkStats = {
    timestamp: 0,
    bytesReceived: 0,
    bytesSent: 0
};

app.get('/api/vpn-speed', (req, res) => {
    console.log(`[${new Date().toISOString()}] 查询VPN速率`);

    const psCommand = `
        $counters = Get-Counter -Counter @(
            "\\Network Interface(*int*)\\Bytes Received/sec",
            "\\Network Interface(*int*)\\Bytes Sent/sec"
        ) -ErrorAction SilentlyContinue
        if ($counters) {
            $totalReceived = ($counters.CounterSamples | Where-Object { $_.Path -match 'Bytes Received' } | Measure-Object -Property CookedValue -Sum).Sum
            $totalSent = ($counters.CounterSamples | Where-Object { $_.Path -match 'Bytes Sent' } | Measure-Object -Property CookedValue -Sum).Sum
            Write-Output ("{0},{1}" -f [math]::Round($totalReceived), [math]::Round($totalSent))
        } else {
            Write-Output "0,0"
        }
    `.trim();

    exec(`powershell -Command "${psCommand}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`[ERROR] 获取网络速率失败: ${error.message}`);
            return res.json({ uploadSpeed: 0, downloadSpeed: 0, timestamp: Date.now() });
        }

        const output = stdout.trim();
        const parts = output.split(',');
        
        if (parts.length >= 2) {
            const bytesReceived = parseInt(parts[0] || '0', 10);
            const bytesSent = parseInt(parts[1] || '0', 10);
            const now = Date.now();

            let uploadSpeed = 0;
            let downloadSpeed = 0;

            if (lastNetworkStats.timestamp > 0 && now - lastNetworkStats.timestamp < 5000) {
                const timeDiff = (now - lastNetworkStats.timestamp) / 1000;
                downloadSpeed = Math.round((bytesReceived - lastNetworkStats.bytesReceived) / timeDiff);
                uploadSpeed = Math.round((bytesSent - lastNetworkStats.bytesSent) / timeDiff);
            }

            lastNetworkStats = {
                timestamp: now,
                bytesReceived,
                bytesSent
            };

            res.json({
                uploadSpeed: Math.max(0, uploadSpeed),
                downloadSpeed: Math.max(0, downloadSpeed),
                timestamp: now
            });
        } else {
            console.error('[ERROR] 无法解析网络速率输出:', output);
            res.json({ uploadSpeed: 0, downloadSpeed: 0, timestamp: Date.now() });
        }
    });
});

app.get('/api/vpn-status', async (req, res) => {
    console.log(`[${new Date().toISOString()}] 检测IP: ${req.query.ip}`);

    if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(req.query.ip)) {
        return res.status(400).json({ error: 'Invalid IP format' });
    }

    const targetIP = req.query.ip;
    const maxRetries = 4;
    const retryDelay = 500;
    const connectTimeout = 3000;

    const attemptConnection = () => {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const client = net.createConnection({
                port: 443,
                host: targetIP,
                timeout: connectTimeout
            });

            let settled = false;

            const handleResult = (online) => {
                if (settled) return;
                settled = true;
                clearTimeout(timeoutHandle);
                if (online) {
                    client.end();
                    resolve({
                        online: true,
                        ping: Date.now() - start
                    });
                } else {
                    client.destroy();
                    reject(new Error('Connection failed or timeout'));
                }
            };

            const timeoutHandle = setTimeout(() => {
                handleResult(false);
            }, connectTimeout);

            client.on('connect', () => {
                handleResult(true);
            });

            client.on('error', (err) => {
                console.error(`[ERROR] 连接错误 (${targetIP}): ${err.code} - ${err.message}`);
                handleResult(false);
            });

            client.on('timeout', () => {
                console.warn(`[WARN] 连接超时 (${targetIP})`);
                handleResult(false);
            });
        });
    };

    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await attemptConnection();
            lastOnlineTimes[targetIP] = new Date().toLocaleString();
            saveLastOnlineTimes();
            return res.json({
                online: true,
                ping: result.ping,
                lastOnline: lastOnlineTimes[targetIP],
                attempts: attempt + 1
            });
        } catch (err) {
            lastError = err;
            if (attempt < maxRetries) {
                console.log(`[INFO] 尝试 ${attempt + 1} 失败，${retryDelay}ms 后重试...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }

    console.error(`[ERROR] 所有重试失败 (${targetIP}): ${lastError?.message}`);
    return res.json({
        online: false,
        ping: null,
        lastOnline: lastOnlineTimes[targetIP] || '从未在线',
        attempts: maxRetries + 1
    });
});

app.get('/api/vpn-users', async (req, res) => {
    console.log(`[${new Date().toISOString()}] 查询本地VPN用户数`);

    const localhost = '127.0.0.1';
    const command = `"C:\\Program Files\\SoftEther VPN Server Developer Edition\\vpncmd.exe" ${localhost} /server /password:adm1n5 /hub:vpn /cmd statusget`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`[ERROR] 执行命令错误: ${error.message}`);
            return res.json({ success: false, error: 'Failed to execute command', details: error.message });
        }

        const parseSessionCount = (output) => {
            const lines = output.split(/\r?\n/);
            for (const line of lines) {
                if (/^\s*会话数[\s\u3000]*\|/.test(line) && !/会话数\s*\(客户端\)|会话数\s*\(网桥\)/.test(line)) {
                    const m = line.match(/会话数[\s\u3000]*\|[\s\u3000]*([0-9]+)/);
                    if (m) return parseInt(m[1].replace(/,/g, ''), 10);
                }
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
            return res.json({ success: false, error: 'Failed to parse session count', rawOutput: stdout.trim() });
        }

        res.json({ success: true, ip: localhost, sessionCount: sessionCount });
    });
});

app.get('/api/pull-updates', (req, res) => {
    console.log(`[${new Date().toISOString()}] 执行 git pull 命令`);

    exec('git pull', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
        if (error) {
            console.error(`[ERROR] 执行 git pull 错误: ${error.message}`);
            return res.status(500).json({ error: 'Failed to pull updates', details: error.message });
        }
        if (stderr) {
            console.error(`[ERROR] git pull 输出错误: ${stderr}`);
        }
        console.log(`[INFO] git pull 执行成功: ${stdout}`);
        res.json({ success: true, message: 'Updates pulled successfully', output: stdout });
    });
});

app.get('/api/Vpn-Password', (req, res) => {
    const filePath = path.join(__dirname, 'Vpn-Password.json');
    try {
        if (!fs.existsSync(filePath)) {
            return res.json({ success: false, error: '密码文件未配置', password: null });
        }
        const passwordData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(passwordData);
        res.json({ success: true, ...data });
    } catch (err) {
        console.error(`[ERROR] 读取VPN密码文件错误: ${err.message}`);
        res.json({ success: false, error: 'Failed to read VPN password data' });
    }
});

app.get('/api/announcement', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'announcement.json');
        const announcementData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(announcementData);

        const stats = fs.statSync(filePath);
        const modifiedTime = stats.mtime;
        const formattedTime = modifiedTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        data.serverModifiedTime = formattedTime;
        res.json(data);
    } catch (err) {
        console.error(`[ERROR] 读取公告文件错误: ${err.message}`);
        res.status(500).json({ error: 'Failed to read announcement data' });
    }
});

app.listen(3132, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:3132');
});