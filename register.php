<?php
header('Content-Type: application/json');

session_start();

$servername = "localhost";
$username = "root";
$password = "114514";
$dbname = "commentdb";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'error' => $conn->connect_error]));
}

$inputUsername = $_POST['username'];
$inputPassword = $_POST['password'];

// 检查用户名是否已存在
$checkSql = "SELECT * FROM users WHERE username = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("s", $inputUsername);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    echo json_encode(['success' => false, 'error' => '用户名已存在']);
    $checkStmt->close();
    $conn->close();
    exit;
}

$checkStmt->close();

// 哈希密码
$hashedPassword = password_hash($inputPassword, PASSWORD_DEFAULT);

// 插入新用户
$insertSql = "INSERT INTO users (username, password) VALUES (?, ?)";
$insertStmt = $conn->prepare($insertSql);
$insertStmt->bind_param("ss", $inputUsername, $hashedPassword);

if ($insertStmt->execute()) {
    $_SESSION['username'] = $inputUsername;
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error]);
}

$insertStmt->close();
$conn->close();
?>