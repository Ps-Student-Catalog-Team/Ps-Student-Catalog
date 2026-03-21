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

$sql = "SELECT * FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $inputUsername);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if (password_verify($inputPassword, $user['password'])) {
        $_SESSION['username'] = $user['username'];
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => '密码错误']);
    }
} else {
    echo json_encode(['success' => false, 'error' => '用户名不存在']);
}

$stmt->close();
$conn->close();
?>