import HID from 'node-hid'
import logger from './logger.js'

export default class RingDevice {
  constructor ({ config: { productName, hexMappings }, oscClient }) {
    this.productName = productName
    this.hexMappings = hexMappings
    this.oscClient = oscClient
    this.device = null
  }

  initDevice () {
    const deviceInfo = HID.devices().find(({ product }) => product === this.productName)
    if (!deviceInfo) {
      logger.error(this.productName, 'Ring is not connected')
      process.exit()
    }
    this.device = new HID.HID(deviceInfo.path)
    this.listenEvents()
  }

  listenEvents () {
    logger.info(this.productName, 'Ring connected. Listening to events...')
    this.device.on('data', (data) => {
      const buttonPressed = data.toString('hex')
      if (this.hexMappings[buttonPressed]) {
        logger.info(this.productName, `Sending event: ${this.hexMappings[buttonPressed]}`)
        this.oscClient.send('/ring-button', this.hexMappings[buttonPressed])
      }
    })

    this.device.on('error', async (err) => {
      logger.error(this.productName, 'Error:', JSON.stringify(err))
      logger.error(this.productName, 'Connection lost, reconnecting...')
      this.device = null
      await this.waitUntilDeviceIsPresent()
    })
  }

  async waitUntilDeviceIsPresent () {
    while (!HID.devices().find(({ product }) => product === this.productName)) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
    this.initDevice()
  }
}
