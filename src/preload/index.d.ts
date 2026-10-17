export interface ElectronAPI {
  minimize: () => void
  toggleMaximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  onMaximizedChange: (callback: (isMaximized: boolean) => void) => () => void
  openExternal: (url: string) => void
  setNativeTheme: (mode: 'light' | 'dark' | 'system') => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
