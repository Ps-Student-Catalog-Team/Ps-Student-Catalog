<?php
header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Wed, 11 Jan 1984 05:00:00 GMT"); // 过期时间
$directory = isset($_GET['dir']) ? rtrim($_GET['dir'], '/') : './'; // 获取目录参数

// 检查是否要求返回 JSON 格式
$isJsonRequest = isset($_GET['format']) && $_GET['format'] === 'json';

if ($isJsonRequest) {
    // 返回 JSON 格式
    returnJsonFileList($directory);
} else {
    // 返回原有的 HTML 格式
    returnHtmlFileList($directory);
}

function returnHtmlFileList($directory) {
if (basename($_SERVER['HTTP_REFERER']) === 'file_list.html') {
    echo "<div class='container' style='background-color: rgba(248, 249, 250, 0.4); padding: 20px; border-radius: 5px;'>";

    echo "<div class='alert alert-success' role='alert' id='success-alert'>
          <h4 class='alert-heading'>温馨提示</h4>
          <p>此目录为共享目录，所有人都可以访问此目录，欢迎在此处上传任何有趣的文件</p>
            <p class='mb-0'>上传文件若未显示，请刷新页面，若仍未显示，请联系开发者(</p>
          <hr>
          <p class='mb-0'>tips: 储存空间有限，请勿上传占用空间过大的文件</p>
          <div class='text-right'>
          <button type='button' class='btn btn-outline-primary rounded' data-dismiss='alert'>豪德</button>
          </div>
          </div>";

    echo "<a href='?dir=.' class='directory-item file-item list-group-item list-group-item-action rounded' style='font-weight: bold;' data-dir='.'>根目录</a>";
}
elseif ($_SERVER['HTTP_REFERER'] === 'download_list.html')
{
    echo "<div class='container' style='background-color: rgba(248, 249, 250, 0.4); padding: 20px; border-radius: 5px;'>";

    echo "<div class='alert alert-success' role='alert' id='success-alert'>
          <h4 class='alert-heading'>Welcome!</h4>
          <p>Start to enjoy?</p>
          <hr>
          <p class='mb-0'>Let's begin!</p>
          <div class='text-right'>
          <button type='button' class='btn btn-outline-primary rounded' data-dismiss='alert'>okok</button>
          </div>
          </div>";

}

    $files = scandir($directory);

    // 确保能正常读取文件
    if ($files === false) {
        echo "无法读取目录。";
        exit;
    }

    // 仅在目录不是 ./download 时显示上级目录
    if ($directory !== './download' && $directory !== './pwd') {
        echo "<div class='directory-item file-item list-group-item list-group-item-action rounded' data-dir='..'>上级目录</div>";
    }

    foreach ($files as $file) {
        if ($file != "." && $file != "..") {
            $filePath = "$directory/$file"; // 生成完整路径
            echo renderItem($file, $filePath); // 渲染每个项目
        }
    }

    echo "</div>";
    echo "<br><br>";
}


function returnJsonFileList($directory) {
    $files = scandir($directory);
    $fileInfo = [];

    // 确保能正常读取文件
    if ($files === false) {
        echo json_encode(['error' => '无法读取目录。']);
        exit;
    }

    foreach ($files as $file) {
        if ($file != "." && $file != "..") {
            $filePath = "$directory/$file"; // 生成完整路径
            if (is_file($filePath)) {
                // 如果是文件，获取文件大小
                $fileSize = filesize($filePath);
                $fileInfo[] = [
                    'name' => $file,
                    'size' => $fileSize, // 文件大小（字节）
                    'type' => getFileType($file) // 文件类型
                ];
            } elseif (is_dir($filePath)) {
                // 如果是目录，添加目录信息
                $fileInfo[] = [
                    'name' => $file,
                    'size' => 0, // 目录大小设置为0
                    'type' => '目录'
                ];
            }
        }
    }

    // 返回 JSON 格式的文件信息
    header('Content-Type: application/json');
    echo json_encode(['files' => $fileInfo]);
}

// 渲染文件和目录的函数
function renderItem($file, $filePath) {
    $fileType = getFileType($file); // 获取文件类型
    if (is_dir($filePath)) {
        return "<div class='directory-item file-item list-group-item list-group-item-action d-flex justify-content-between rounded' data-dir='$filePath'>
                    <span>$file</span> <span class='badge badge-info'>&nbsp;(目录)</span>
                </div>";
    } else {
        return "<a href='$filePath' class='file-item list-group-item list-group-item-action d-flex justify-content-between rounded' download> 
                    <span>$file</span> <span class='badge badge-success'>&nbsp;($fileType)</span>
                </a>";
    }
}

// 获取文件类型的函数
function getFileType($fileName) {
    $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION)); // 获取文件扩展名
    switch ($extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return '图片文件';
        case 'pdf':
            return 'PDF文档';
        case 'txt':
            return '文本文件';
        case 'zip':
        case '7z':
            return '压缩文件';
        case 'html':
        case 'htm':
            return 'HTML文件';
        case 'exe':
            return '可执行文件';
        case 'mp4':
        case 'avi':
        case 'wmv':
            return '视频文件';
        default:
            return '其他文件类型';
    }
}
?>
