import HID from 'node-hid'

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
      throw new Error(`${this.productName} is not connected`)
    }
    this.device = new HID.HID(deviceInfo.path)
    this.listenEvents()
  }

  listenEvents () {
    console.log(`[${this.productName}] Listening to events...`)
    this.device.on('data', (data) => {
      const buttonPressed = data.toString('hex')
      if (this.hexMappings[buttonPressed]) {
        console.log(`[${this.productName}] Sending event: ${this.hexMappings[buttonPressed]}`)
        this.oscClient.send('/ring-button', this.hexMappings[buttonPressed])
      }
    })

    this.device.on('error', async (err) => {
      console.log(`[${this.productName}] Error:`, JSON.stringify(err))
      console.log(`[${this.productName}] Connection lost, reconnecting...`)
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
