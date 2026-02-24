import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface PreferencesState {
  wideMode: boolean
}

interface PreferencesActions {
  setWideMode: (wide: boolean) => void
}

type PreferencesStore = PreferencesState & PreferencesActions

export const usePreferencesStore = create<PreferencesStore>()(
  devtools(
    persist(
      (set) => ({
        wideMode: false,

        setWideMode(wide) {
          set({ wideMode: wide }, false, 'setWideMode')
        },
      }),
      { name: 'refinex-preferences' },
    ),
    { name: 'PreferencesStore', enabled: import.meta.env.DEV },
  ),
)
