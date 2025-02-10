const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  onOSCMessage: (callback) => ipcRenderer.on('osc-message', (_event, value) => callback(value)),
  onLogEntry: (callback) => ipcRenderer.on('log-entry', (_event, value) => callback(value)),
  startSensors: (sensors) => ipcRenderer.send('start-sensors', sensors),
  setOffsetCoordinates: (coordinates) => ipcRenderer.send('set-offset-coordinates', coordinates)
})
