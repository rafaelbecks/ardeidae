import OSCClient from './OSCClient.js'
import RingDevice from './ringDevice.js'
import WITAccelerometer from './WITAccelerometer.js'
import logger from './logger.js'
import config from './config.js'

logger.init([
  { transport: console.log, level: 'info' }
])

const oscClient = new OSCClient(config.osc.host, config.osc.port)
const ring = new RingDevice({ config: config.ring, oscClient })
const witAccelerometer = new WITAccelerometer({ config: config.ble, oscClient })

ring.initDevice()
await witAccelerometer.connect()
