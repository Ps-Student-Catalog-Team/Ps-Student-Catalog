<?php
header('Content-Type: application/json');
error_reporting(0); // 生产环境关闭报错，避免破坏 JSON

$servername = "localhost";
$username_db = "root";
$password_db = "114514";
$dbname = "commentdb";

$conn = new mysqli($servername, $username_db, $password_db, $dbname);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => '数据库连接失败']);
    exit;
}

// 获取参数
$comment = $_POST['comment'] ?? '';
$username = $_POST['username'] ?? '';

if (empty($comment) || empty($username)) {
    echo json_encode(['success' => false, 'error' => '内容或用户名为空']);
    exit;
}

// 预处理插入（避免单引号问题）
$stmt = $conn->prepare("INSERT INTO comments (comment, username, timestamp) VALUES (?, ?, NOW())");
$stmt->bind_param("ss", $comment, $username);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    // 返回具体错误（调试时可查看，生产环境建议记录日志）
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conn->close();
?>