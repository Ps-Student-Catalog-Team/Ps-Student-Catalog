<?php
header('Content-Type: application/json');

// 连接数据库
$servername = "localhost";
$username = "root";
$password = "114514";
$dbname = "commentdb";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "数据库连接失败"]));
}

// 获取POST数据
$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'];

// 查询用户留言
$sql = "SELECT comment, created_at FROM comments WHERE username = ? ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$comments = [];
while ($row = $result->fetch_assoc()) {
    $comments[] = $row;
}

// 返回结果
echo json_encode($comments);

// 关闭连接
$stmt->close();
$conn->close();