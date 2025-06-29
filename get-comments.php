<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "114514"; 
$dbname = "commentdb";

// 创建连接
$conn = new mysqli($servername, $username, $password, $dbname);

// 检查连接
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'error' => $conn->connect_error]));
}

// 获取留言数据，包含时间戳
$sql = "SELECT comment, timestamp FROM comments ORDER BY timestamp DESC"; // 按时间降序排列

$result = $conn->query($sql);

$comments = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $comments[] = $row;
    }
}

echo json_encode(['comments' => $comments]);

$conn->close();
?>
