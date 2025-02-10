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

const Sensors = {
  RING: 'RING',
  ACCELEROMETER: 'ACCELEROMETER',
  LIDAR: 'LIDAR'
}

const createWindow = async () => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    width: 1120,
    height: 856,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    contextIsolation: true,
    enableBlinkFeatures: 'Bluetooth',
    transparent:true,
    frame: false
  })

  const onOSCMessage = ({ address, value }) => {
    win.webContents.send('osc-message', { address, value })
  }


  logger.init([
    { transport: console.log, level: 'info' },
    { transport: (log) => win.webContents.send('log-entry', log), level: 'info' }
  ])

  win.loadURL(
    process.env.NODE_ENV === 'local' ? 'http://localhost:8000/' : 'https://ardeidae.netlify.app/',
    {"extraHeaders" : "pragma: no-cache\n"}
  )

  let witAccelerometer

  ipcMain.on('start-sensors', async (_, activeSensors = [Sensors.ACCELEROMETER, Sensors.RING]) => {

    const oscClient = new OSCClient(config.osc.host, config.osc.port, onOSCMessage)

    if(activeSensors.includes(Sensors.RING)){
      const ring = new RingDevice({ config: config.ring, oscClient })
      ring.initDevice()
    }

    if(activeSensors.includes(Sensors.ACCELEROMETER)){
      witAccelerometer = new WITAccelerometer({ config: config.ble, oscClient })
      await witAccelerometer.connect()
    }
  })

  ipcMain.on('set-offset-coordinates', (_, coordinates) => {
    logger.info(`Setting offset coordinates: ${JSON.stringify(coordinates)}`)
    witAccelerometer.setOffsetCoordinates(coordinates)
  })
}

app.whenReady().then(() => {
  createWindow()
})
