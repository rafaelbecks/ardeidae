import { Client } from 'node-osc'

export default class OSCClient {
  constructor (host = '127.0.0.1', port = 3333, onMessage = () => {}) {
    this.host = host
    this.port = port
    this.client = new Client(this.host, this.port)
    this.onMessage= onMessage
  }

  send (address, ...args) {
    console.log(`[OSC] Sending to ${address}:`, args)
    this.client.send(address, ...args)
    this.onMessage({ address, value: args})
  }

  close () {
    this.client.close()
  }
}
