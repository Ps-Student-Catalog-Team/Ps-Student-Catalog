<?php
header('Content-Type: application/json');

// --- 数据库配置 ---
$servername = "localhost";
$username_db = "root";
$password_db = "114514";
$dbname = "commentdb";

$conn = new mysqli($servername, $username_db, $password_db, $dbname);
if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "数据库连接失败"]));
}

// --- 获取POST数据 ---
$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['username'])) {
    die(json_encode(["success" => false, "error" => "请求参数错误"]));
}

$username = $data['username'];
$password = generateRandomPassword(12);

// --- 核心逻辑 ---

/**
 * 获取 AList 管理员 Token
 */
function getAlistToken() {
    $login_url = 'http://127.0.0.1:5244/api/auth/login'; // 建议用 127.0.0.1 避免 DNS 解析
    $login_data = [
        'username' => 'admin', 
        'password' => 'adm1n5' 
    ];

    $ch = curl_init($login_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($login_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $res_data = json_decode($response, true);
    curl_close($ch);

    if (isset($res_data['data']['token'])) {
        return $res_data['data']['token'];
    }
    return false;
}

/**
 * 调用 AList API 创建账户
 */
function createAlistUser($username, $password) {
    $api_url = 'http://127.0.0.1:5244/api/admin/user/create'; 
    
    $token = getAlistToken();
    if (!$token) return ["success" => false, "msg" => "无法获取管理员Token"];

    $api_data = [
        'username' => $username,
        'password' => $password,
        'base_path' => '/' . $username,
        'role' => [0],          // 0 为普通用户
        'permission' => 0,    // 0 为基础权限，若需上传权限通常设为较高数值
        'disabled' => false
    ];

    $ch = curl_init($api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($api_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: ' . $token 
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);

    if ($http_code == 200 && isset($result['code']) && $result['code'] == 200) {
    return ["success" => true];
} else {
    $error_msg = $result['message'] ?? "未知API错误 (HTTP $http_code)";
    // 判断是否唯一约束错误
    if (strpos($error_msg, 'UNIQUE constraint failed') !== false) {
        $error_msg = "用户名已存在，请使用其他用户名";
    }
    return ["success" => false, "msg" => $error_msg];
}
}

/**
 * 生成随机密码
 */
function generateRandomPassword($length = 12) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    return substr(str_shuffle(str_repeat($chars, 5)), 0, $length);
}

// --- 执行任务 ---
try {
    if (!function_exists('curl_init')) {
        throw new Exception("服务器未安装 curl 扩展");
    }

    $res = createAlistUser($username, $password);

    if ($res['success']) {
        echo json_encode([
            "success" => true, 
            "username" => $username, 
            "password" => $password
        ]);
    } else {
        echo json_encode([
            "success" => false, 
            "error" => "AList创建失败: " . $res['msg']
        ]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

$conn->close();