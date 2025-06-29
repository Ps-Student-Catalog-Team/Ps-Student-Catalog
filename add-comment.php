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

// 获取留言内容
$comment = $_POST['comment'];

// 插入留言到数据库
$sql = "INSERT INTO comments (comment) VALUES ('$comment')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}

$conn->close();
?>
