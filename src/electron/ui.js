import path from 'node:path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { app, BrowserWindow } from 'electron'
import OSCClient from '../OSCClient.js'
import config from '../config.js';
import WITAccelerometer from '../WITAccelerometer.js'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('__dirname', __dirname)

const createWindow = async () => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    width: 1024,
    height: 856,
    titleBarStyle: 'hiddenInset',
    contextIsolation: true,
    enableBlinkFeatures: 'Bluetooth'
  })

  const onOSCMessage = ({ address, value}) => {
    win.webContents.send('osc-message', { address, value })
  }

  const oscClient = new OSCClient(config.osc.host, config.osc.port, onOSCMessage)
  const witAccelerometer = new WITAccelerometer({ config: config.ble, oscClient })

  win.loadURL('http://localhost:8000/')
  await witAccelerometer.connect()

}

app.whenReady().then(() => {
  createWindow()
})
