const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Ps-Student-Catalog',
    // 隐藏默认窗口边框，使用自定义导航栏
    frame: false,
    // 半透明效果
    transparent: false,
    // 窗口圆角（在支持的平台上）
    roundedCorners: true,
    // 窗口动画效果
    animation: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 隐藏默认菜单栏
  Menu.setApplicationMenu(null);

  // 加载主页面
  win.loadFile('index.html');

  // 开发环境下打开调试工具
  // win.webContents.openDevTools();
  
  // 处理窗口关闭事件
  win.on('closed', () => {
    app.quit();
  });
  
  // 监听渲染进程的窗口控制事件
  ipcMain.on('window:minimize', () => {
    win.minimize();
  });
  
  ipcMain.on('window:maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
  
  ipcMain.on('window:close', () => {
    win.close();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});