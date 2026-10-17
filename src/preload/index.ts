import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  minimize: () => ipcRenderer.send('window-minimize'),
  toggleMaximize: () => ipcRenderer.send('window-maximize-toggle'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window-is-maximized'),
  onMaximizedChange: (callback: (isMaximized: boolean) => void) => {
    const handler = (_: Electron.IpcRendererEvent, val: boolean): void => callback(val)
    ipcRenderer.on('window-maximized-change', handler)
    return () => ipcRenderer.removeListener('window-maximized-change', handler)
  },
  openExternal: (url: string) => ipcRenderer.send('shell-open-external', url),
  setNativeTheme: (mode: 'light' | 'dark' | 'system') => ipcRenderer.send('theme-set-native', mode)
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
