<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <title>文件上传结果</title>
</head>
<body>
    <div class="container mt-5">
        <?php  
        $target_dir = ; // 目标目录，请确保此目录存在且服务器有写入权限  
        $target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);  
        $uploadOk = 1;  
        $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));  
          
        // 检查文件是否已存在  
        if (file_exists($target_file)) {  
            echo '<div class="alert alert-danger">抱歉，文件已存在.</div>';  
            $uploadOk = 0;  
        }  
          
        // 检查 $uploadOk 是否被设置为 0，如果是，则文件不应被上传  
        if ($uploadOk == 0) {  
            echo '<div class="alert alert-danger">抱歉，您的文件未能上传.</div>';  
        // 如果一切检查都通过，尝试上传文件  
        } else {  
            if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {  
                echo '<div class="alert alert-success">文件 ' . htmlspecialchars(basename($_FILES["fileToUpload"]["name"])) . ' 已成功上传.</div>';  
            } else {  
                echo '<div class="alert alert-danger">抱歉，上传您的文件时出错.</div>';  
            }  
        }  
        
        // 输出文件路径
        echo '<div class="mt-3"><strong>文件路径：</strong>' . htmlspecialchars($target_file) . '</div>';
        ?>
        
        <!-- 添加“确定”按钮 -->
        <div class="mt-4">
            <a class="btn btn-primary" href ="file_list.html">确定</a>
        </div>
    </div>

    <script src="scripts/jquery-3.5.1.slim.min.js"></script>
    <script src="scripts/popper.min.js"></script>
    <script src="scripts/bootstrap.min.js"></script>
    <script src="scripts/file_list.js"></script>
</body>
</html>
