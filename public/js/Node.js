const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
app.use(express.json());

const storedPasswordHash = '$2b$10$....'; // 从数据库中获取存储的密码哈希

app.post('/api/verify-password', async (req, res) => {
    const { password } = req.body;

    // 验证密码
    const match = await bcrypt.compare(password, storedPasswordHash);
    if (match) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// 启动服务器
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
