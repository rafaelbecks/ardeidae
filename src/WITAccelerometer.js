import Bluetooth from 'node-web-bluetooth'
import AccelerometerDataProcessor from './accelerometerDataProcessor.js'
import logger from './logger.js'

const logGroup = 'WITAccelerometer'

export default class WITAccelerometer {

  offsetCoordinates = { x: 0, y: 0, z: 0 }

  constructor ({ config, oscClient }) {
    this.config = config
    this.oscClient = oscClient
  }

  setOffsetCoordinates(coordinates){
    this.offsetCoordinates = coordinates
  }

  async connect () {
    logger.info(logGroup, 'Attepmting to connect...')

    try{
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
      logger.info(logGroup, 'Connected, reading data.. ')
      await characteristics.startNotifications()

      characteristics.on('characteristicvaluechanged', (data) => {
        const value = data.target._value
        const rawData = new Uint8Array(value.buffer)
        dataProcessor.onDataReceived(rawData, this.offsetCoordinates)
      })
    } catch(error){
      logger.error("Device not available")
    }

    // process.on('SIGINT', async () => {
    //   logger.info(logGroup, 'Disconnecting Bluetooth device...')

    //   await characteristics.stopNotifications()
    //   await server.disconnect()
    //   logger.info(logGroup, 'Device disconnected.')
    //   process.exit(9)

    //   try{
    //   } catch (err) {
    //     console.log(err)
    //   }
    // })
  }
}

class SelectFirstFoundDevice extends Bluetooth.RequestDeviceDelegate {
  onAddDevice (device) {
    this.resolve(device)
  }

  onStartScan () {
    this._timer = setTimeout(() => {
      this.reject(new Error('No device found'))
    }, 10000)
  }

  onStopScan () {
    if (this._timer) clearTimeout(this._timer)
  }
}
