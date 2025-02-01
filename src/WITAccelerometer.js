import Bluetooth from 'node-web-bluetooth'
import AccelerometerDataProcessor from './accelerometerDataProcessor.js'

export default class WITAccelerometer {
  constructor ({ config, oscClient }) {
    this.config = config
    this.oscClient = oscClient
  }

  async connect () {
    console.log('[WIT Accelerometer] Attepmting to connect...')
    const device = await Bluetooth.requestDevice({
      filters: [
        { services: [this.config.targetServiceUuid] }
      ],
      delegate: new SelectFirstFoundDevice()
    })

    const server = await device.gatt.connect()
    const service = await server.getPrimaryService(this.config.targetServiceUuid)
    const characteristics = await service.getCharacteristic(this.config.targetCharacteristicUuidRead)
    const dataProcessor = new AccelerometerDataProcessor(this.oscClient)
    console.log('[WIT Accelerometer] Connected, reading data.. ')
    await characteristics.startNotifications()

    characteristics.on('characteristicvaluechanged', (data) => {
      const value = data.target._value
      const rawData = new Uint8Array(value.buffer)
      dataProcessor.onDataReceived(rawData)
    })

    process.on('SIGINT', async () => {
      console.log('\n[WIT Accelerometer] Disconnecting Bluetooth device...')

      await characteristics.stopNotifications()
      await server.disconnect()
      console.log('[WIT Accelerometer] Device disconnected.')

      process.exit()
    })
  }
}

class SelectFirstFoundDevice extends Bluetooth.RequestDeviceDelegate {
  onAddDevice (device) {
    this.resolve(device)
  }

  onStartScan () {
    this._timer = setTimeout(() => {
      this.reject(new Error('No device found'))
    }, 20000)
  }

  onStopScan () {
    if (this._timer) clearTimeout(this._timer)
  }
}
