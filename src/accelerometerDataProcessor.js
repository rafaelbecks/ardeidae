import logger from "./logger.js"

export default class AccelerometerDataProcessor {
  constructor (oscClient) {
    this.tempBytes = []
    this.oscClient = oscClient
  }

  onDataReceived (data, offsetCoordinates) {
    const tempData = Buffer.from(data)
    for (const byte of tempData) {
      this.tempBytes.push(byte)

      if (this.tempBytes.length === 1 && this.tempBytes[0] !== 0x55) {
        this.tempBytes.shift()
        continue
      }

      if (
        this.tempBytes.length === 2 &&
        this.tempBytes[1] !== 0x61 &&
        this.tempBytes[1] !== 0x71
      ) {
        this.tempBytes.shift()
        continue
      }

      if (this.tempBytes.length === 20) {
        this.processData(this.tempBytes, offsetCoordinates)
        this.tempBytes = []
      }
    }
  }

  processData (bytes, offsetCoordinates) {
    if (bytes[1] === 0x61) {
      const ax = this.getSignInt16((bytes[3] << 8) | bytes[2]) / 32768 * 16
      const ay = this.getSignInt16((bytes[5] << 8) | bytes[4]) / 32768 * 16
      const az = this.getSignInt16((bytes[7] << 8) | bytes[6]) / 32768 * 16
      const gx = this.getSignInt16((bytes[9] << 8) | bytes[8]) / 32768 * 2000
      const gy = this.getSignInt16((bytes[11] << 8) | bytes[10]) / 32768 * 2000
      const gz = this.getSignInt16((bytes[13] << 8) | bytes[12]) / 32768 * 2000
      const angx = this.getSignInt16((bytes[15] << 8) | bytes[14]) / 32768 * 180
      const angy = this.getSignInt16((bytes[17] << 8) | bytes[16]) / 32768 * 180
      const angz = this.getSignInt16((bytes[19] << 8) | bytes[18]) / 32768 * 180

      const { x, y , z } = offsetCoordinates

      const data = {
        acceleration: { ax, ay, az },
        gyroscope: { gx, gy, gz },
        angles: { angx, angy, angz },
        offsetAngle: { offsetx: angx - x , offsety: angy - y, offsetz: angz - z }
      }

      Object.values(data).forEach((object) => {
        Object.keys(object).forEach((key) => {
          this.oscClient.send(`/accelerometer/${key}`, object[key])
        })
      })
    } else if (bytes[2] === 0x3A) {
      const Hx = this.getSignInt16((bytes[5] << 8) | bytes[4]) / 120
      const Hy = this.getSignInt16((bytes[7] << 8) | bytes[6]) / 120
      const Hz = this.getSignInt16((bytes[9] << 8) | bytes[8]) / 120

      console.log('Magnetic Field:', { Hx, Hy, Hz })
    } else if (bytes[2] === 0x51) {
      const Q0 = this.getSignInt16((bytes[5] << 8) | bytes[4]) / 32768
      const Q1 = this.getSignInt16((bytes[7] << 8) | bytes[6]) / 32768
      const Q2 = this.getSignInt16((bytes[9] << 8) | bytes[8]) / 32768
      const Q3 = this.getSignInt16((bytes[11] << 8) | bytes[10]) / 32768

      console.log('Quaternion:', { Q0, Q1, Q2, Q3 })
    }
  }

  getSignInt16 (num) {
    return num >= 0x8000 ? num - 0x10000 : num
  }
}
