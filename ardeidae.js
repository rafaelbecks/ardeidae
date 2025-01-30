const HID = require('node-hid');
const { Client: OSCCLient } = require('node-osc');

class RingDevice {
  constructor({productName, hexMappings, oscHost = '127.0.0.1', oscPort = 3333}) {
    this.productName = productName
    this.hexMappings = hexMappings
    this.oscClient = new OSCCLient(oscHost, oscPort)
    this.device = null
    this.initDevice()
  }

  initDevice() {
    let deviceInfo = HID.devices().find(({ product }) => product === this.productName)
    if (!deviceInfo) {
      throw new Error(`${this.productName} is not connected`)
    }
    this.device = new HID.HID(deviceInfo.path);
    this.listenEvents()
  }

  listenEvents() {
    console.log(`[${this.productName}] Listening to events...`);
    this.device.on("data", (data) => {
      const buttonPressed = data.toString('hex');
      if (this.hexMappings[buttonPressed]) {
        console.log(`[${this.productName}] Sending event: ${this.hexMappings[buttonPressed]}`)
        this.oscClient.send('/ring-button', this.hexMappings[buttonPressed])
      }
    });

    this.device.on("error", async (err) => {
      console.log(`[${this.productName}] Error:`, JSON.stringify(err));
      console.log(`[${this.productName}] Connection lost, reconnecting...`)
      this.device = null;
      await this.waitUntilDeviceIsPresent()
    });
  }

  async waitUntilDeviceIsPresent() {
    while (!HID.devices().find(({ product }) => product === this.productName)) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    this.initDevice()
  }
}

const ringDevice = new RingDevice(
  {
    productName: 'SR pius',
    hexMappings:   {
      ['02033880']: 1, // UP
      ['0203d87f']: 2, // DOWN
    }
  }
)
