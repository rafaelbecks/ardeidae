const config = {
  ble: {
    targetServiceUuid: '0000ffe5-0000-1000-8000-00805f9a34fb',
    targetCharacteristicUuidRead: '0000ffe4-0000-1000-8000-00805f9a34fb',
    targetCharacteristicUuidWrite: '0000ffe9-0000-1000-8000-00805f9a34fb'
  },
  ring: {
    productName: 'SR pius',
    hexMappings: {
      '02033880': 1, // UP
      '0203d87f': 2 // DOWN
    }
  },
  osc: {
    host: '127.0.0.1',
    port: 3333
  }
}

export default config
