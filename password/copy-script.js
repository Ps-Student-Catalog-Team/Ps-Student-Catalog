document.getElementById('copyButton').addEventListener('click', function() {
    // 创建一个临时的input元素
    var tempInput = document.createElement('input');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-1000px'; // 确保input元素不在视图中
    tempInput.value = document.getElementById('password').textContent;

    // 将input元素添加到body中
    document.body.appendChild(tempInput);

    // 选择input元素中的文本
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // 适用于移动设备

    // 复制选中的文本
    document.execCommand('copy');

    // 移除临时的input元素
    document.body.removeChild(tempInput);

    // 改变按钮文本
    var button = document.getElementById('copyButton');
    button.textContent = '已复制';
    button.disabled = true; // 禁用按钮以防止重复点击

    // 设置定时器，几秒后恢复按钮文本和启用按钮
    setTimeout(function() {
        button.textContent = '一键复制密码';
        button.disabled = false;
    }, 2000); 
});
