document.addEventListener('DOMContentLoaded', (event) => {  
    const downloadLinks = document.querySelectorAll('.download-link');  
  
    downloadLinks.forEach(link => {  
        link.addEventListener('click', (event) => {  
            console.log(`Downloading: ${event.target.href}`);  
        });  
    });  
});