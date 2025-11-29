const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

let mainWindow
let nextProcess

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'default',
    backgroundColor: '#000000',
    show: false,
  })

  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Abrir links externos no navegador padrão
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    // Em desenvolvimento, conectar ao servidor Next.js
    const startUrl = 'http://localhost:3000'
    
    const waitForServer = () => {
      const http = require('http')
      const options = { host: 'localhost', port: 3000, path: '/' }
      
      http.get(options, () => {
        mainWindow.loadURL(startUrl)
      }).on('error', () => {
        setTimeout(waitForServer, 1000)
      })
    }
    
    waitForServer()
  } else {
    // Em produção, iniciar servidor Next.js interno
    const nextPath = path.join(__dirname, '../.next')
    const serverPath = path.join(__dirname, '../server.js')
    
    // Carregar o servidor interno
    require(serverPath)
    
    // Aguardar servidor iniciar e carregar
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:3000')
    }, 2000)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('before-quit', () => {
  if (nextProcess) {
    nextProcess.kill()
  }
})

