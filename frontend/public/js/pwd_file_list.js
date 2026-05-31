
var correctPasswordHash = "ewq"; 
var maxAttempts = 3;  
var attemptCount = 0;  
  
document.getElementById("submitPassword").addEventListener("click", function() {  
    var inputPassword = document.getElementById("password").value;  
       
    attemptCount++;  
    if (attemptCount > maxAttempts) {  
        alert("尝试次数过多，请稍后再试。");  
        return;  
    }  
  
    // 发送密码到服务器进行验证（这里使用假设的哈希比较作为示例）  
    // 在实际应用中，应通过AJAX或Fetch请求发送密码到服务器  
    var hashedInputPassword = hashPassword(inputPassword); // 假设有一个hashPassword函数  
    if (hashedInputPassword === correctPasswordHash) {  
        // 如果密码正确，则隐藏密码输入框并显示文件列表  
        document.getElementById("passwordContainer").style.display = "none";  
        document.getElementById("directoryLocation").style.display = "block";  
        document.getElementById("fileList").style.display = "block";  
        document.getElementById("uploadForm").style.display = "block";  
        loadFileList(document.getElementById("fileList").getAttribute("data-current-directory"));  
    } else {  
        alert("密码错误，请重试。您还有 " + (maxAttempts - attemptCount) + " 次机会。");  
    }  
});  
  
function hashPassword(password) {  
    return password.split('').reverse().join('');  
}