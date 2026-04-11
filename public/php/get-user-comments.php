<?php
header('Content-Type: application/json');

// 连接数据库
$servername = "localhost";
$username_db = "root";
$password_db = "114514";
$dbname = "commentdb";

$conn = new mysqli($servername, $username_db, $password_db, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "数据库连接失败"]));
}

// 获取POST数据
$data = json_decode(file_get_contents('php://input'), true);

// 检查数据是否存在
if (!$data || !isset($data['username'])) {
    die(json_encode(["error" => "请求参数错误"]));
}

$username = $data['username'];

// 查询用户留言
$sql = "SELECT comment, created_at FROM comments WHERE username = ? ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    // 返回具体的 SQL 错误信息
    die(json_encode(["error" => "SQL预处理失败: " . $conn->error]));
}
    
$stmt->bind_param("s", $username);

if (!$stmt->execute()) {
    die(json_encode(["error" => "查询执行失败"]));
}

$result = $stmt->get_result();

if (!$result) {
    die(json_encode(["error" => "获取结果集失败"]));
}

$comments = [];
while ($row = $result->fetch_assoc()) {
    $comments[] = $row;
}

// 返回结果
echo json_encode($comments);

// 关闭连接
$stmt->close();
$conn->close();