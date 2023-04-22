const { screen, app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: screen.getPrimaryDisplay().workAreaSize.width,
    titleBarStyle: 'hidden',
    frame: false,
    height: screen.getPrimaryDisplay().workAreaSize.height,
    webPreferences: {
      nodeIntegration: true,
    }
  })

  win.setFullScreen(true);

  win.loadURL('http://localhost');

  globalShortcut.register('ESC', () => app.quit());
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});