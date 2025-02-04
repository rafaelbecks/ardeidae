import path from 'node:path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'

import OSCClient from '../OSCClient.js'
import config from '../config.js'
import logger from '../logger.js'
import WITAccelerometer from '../WITAccelerometer.js'
import RingDevice from '../ringDevice.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const createWindow = async () => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    width: 1024,
    height: 856,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    contextIsolation: true,
    enableBlinkFeatures: 'Bluetooth'
  })

  const onOSCMessage = ({ address, value }) => {
    win.webContents.send('osc-message', { address, value })
  }


  logger.init([
    { transport: console.log, level: 'debug' },
    { transport: (log) => win.webContents.send('log-entry', log), level: 'info' }
  ])

  win.loadURL('http://localhost:8000/')

  ipcMain.on('start-sensors', async () => {
    const oscClient = new OSCClient(config.osc.host, config.osc.port, onOSCMessage)
    const witAccelerometer = new WITAccelerometer({ config: config.ble, oscClient })
    const ring = new RingDevice({ config: config.ring, oscClient })
    ring.initDevice()
    await witAccelerometer.connect()
  })


}

app.whenReady().then(() => {
  createWindow()
})
