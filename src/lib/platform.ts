export const isElectron = !!window.electronAPI?.isElectron
export const platform = window.electronAPI?.platform ?? 'web'
