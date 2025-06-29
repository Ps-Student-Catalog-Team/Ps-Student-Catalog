document.getElementById('uploadForm').addEventListener('submit', async function(event) {  
    event.preventDefault();  
  
    const fileInput = document.getElementById('fileInput');  
    const file = fileInput.files[0];  
  
    if (!file) {  
        alert('Please select a file to upload.');  
        return;  
    }  
  
    const formData = new FormData();  
    formData.append('file', file);  
  
    try {  
        const response = await fetch('/upload', {  
            method: 'POST',  
            body: formData  
        });  
  
        if (!response.ok) {  
            throw new Error('Failed to upload file.');  
        }  
  
        const result = await response.json();  
        displayFile(result.fileName, result.filePath);  
    } catch (error) {  
        console.error('Error uploading file:', error);  
        alert('Error uploading file.');  
    }  
});  
  
function displayFile(fileName, filePath) {  
    const fileList = document.getElementById('fileList');  
    const listItem = document.createElement('li');  
    listItem.textContent = fileName;  
    const downloadLink = document.createElement('a');  
    downloadLink.href = filePath;  
    downloadLink.textContent = 'Download';  
    listItem.appendChild(downloadLink);  
    fileList.appendChild(listItem);  
}  
  
// Note: This is a client-side implementation.  
// For server-side handling, you need a backend (e.g., Node.js, Python, etc.)  
// to save the uploaded files and return the file path.  
// Below is a simple example using a Node.js server with Express.  
  
// Server-side code example (Node.js with Express)  
// const express = require('express');  
// const multer = require('multer');  
// const path = require('path');  
  
// const app = express();  
// const upload = multer({ dest: 'uploads/' });  
  
// app.post('/upload', upload.single('file'), (req, res) => {  
//     const fileName = req.file.originalname;  
//     const filePath = `http://localhost:3000/uploads/${fileName}`; // Adjust accordingly  
//     res.json({ fileName, filePath });  
// });  
  
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  
  
// app.listen(3000, () => {  
//     console.log('Server started on http://localhost:3000');  
// });