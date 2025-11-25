<?php
header('Content-Type: application/json');

// 连接数据库
$servername = "localhost";
$username_db = "root";
$password_db = "114514";
$dbname = "commentdb";

$conn = new mysqli($servername, $username_db, $password_db, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "数据库连接失败"]));
}

// 获取POST数据
$data = json_decode(file_get_contents('php://input'), true);

// 检查数据是否存在
if (!$data || !isset($data['username']) || !isset($data['password'])) {
    die(json_encode(["success" => false, "error" => "请求参数错误"]));
}

$username = $data['username'];

// 使用用户提供的密码
$password = isset($data['password']);
// 调用AList API创建账户
function createAlistUser($username, $password) {
    // 配置AList API信息
    $alist_api_url = 'http://localhost:5244/api/admin/user'; // AList API地址
    $alist_token = 'your_alist_token'; // AList管理员令牌
    
    // API请求数据
    $api_data = [
        'username' => $username,
        'password' => $password,
        'base_path' => '/'.$username,
        'role' => 'user',
        'permission' => [
            'admin' => false,
            'write' => true,
            'read' => true
        ]
    ];
    
    // 初始化curl
    $ch = curl_init();
    
    // 设置curl选项
    curl_setopt($ch, CURLOPT_URL, $alist_api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($api_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $alist_token
    ]);
    
    // 执行请求
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    // 关闭curl
    curl_close($ch);
    
    // 检查响应
    if ($http_code == 200) {
        $result = json_decode($response, true);
        return $result['code'] == 200;
    }
    
    return false;
}

// 生成随机密码
function generateRandomPassword($length = 12) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    $password = '';
    for ($i = 0; $i < $length; $i++) {
        $password .= $chars[rand(0, strlen($chars) - 1)];
    }
    return $password;
}

try {
    // 调用AList API创建账户
    $success = createAlistUser($username, $password);
    
    if ($success) {
        // 返回成功结果
        echo json_encode(["success" => true, "password" => $password]);
    } else {
        // 返回失败结果
        echo json_encode(["success" => false, "error" => "AList账户创建失败，请检查AList API配置"]);
    }
} catch (Exception $e) {
    // 返回异常信息
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

// 关闭数据库连接
$conn->close();
