document.addEventListener("DOMContentLoaded", function() {
    var fileListContainer = document.getElementById("fileList");
    var dirLocationContainer = document.getElementById("directoryLocation");
    var currentDirectory = fileListContainer.getAttribute("data-current-directory");

    function loadFileList(directory) {
        fetch(`file_list.php?dir=${encodeURIComponent(directory)}`)
            .then(response => response.text())
            .then(data => {
                fileListContainer.innerHTML = data;
                dirLocationContainer.innerHTML = "当前目录: " + directory;

                // 为每个目录项添加点击事件
                var directoryItems = document.querySelectorAll('.directory-item');
                directoryItems.forEach(item => {
                    item.addEventListener('click', function() {
                        var newDirectory = this.getAttribute('data-dir');

                        // 特殊处理 ".." 目录
                        if (this.textContent.trim() === "上级目录") {
                            var parentDirectory = directory.substring(0, directory.lastIndexOf('/'));
                            loadFileList(parentDirectory || './'); // 加载父目录的文件列表
                        } else {
                            console.log('加载目录:', newDirectory);
                            loadFileList(newDirectory); // 加载新目录的文件列表
                        }
                    });
                });
            });
    }


    loadFileList(currentDirectory); // 初始加载文件列表
});
