const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  onOSCMessage: (callback) => ipcRenderer.on('osc-message', (_event, value) => callback(value)),
  onLogEntry: (callback) => ipcRenderer.on('log-entry', (_event, value) => callback(value)),
  startSensors: () => ipcRenderer.send('start-sensors')
})
