import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ModelProvision } from '@/services/modules/ai'

interface ModelState {
  provisions: ModelProvision[]
  selectedProvisionId: number | null
  loading: boolean
}

interface ModelActions {
  fetchProvisions: () => Promise<void>
  setSelectedProvision: (id: number) => void
}

type ModelStore = ModelState & ModelActions

const initialState: ModelState = {
  provisions: [],
  selectedProvisionId: null,
  loading: false,
}

export const useModelStore = create<ModelStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        async fetchProvisions() {
          set({ loading: true }, false, 'fetchProvisions/start')
          try {
            const { aiApi } = await import('@/services')
            const data = await aiApi.listModelProvisions({ status: 1, pageSize: 100 })
            const records = data.records ?? []
            const { selectedProvisionId } = get()
            // 如果当前没有选中，或选中的已不在列表中，则选默认或第一个
            const stillValid = records.some((r) => r.id === selectedProvisionId)
            const defaultId =
              stillValid && selectedProvisionId
                ? selectedProvisionId
                : (records.find((r) => r.isDefault === 1)?.id ?? records[0]?.id ?? null)
            set({ provisions: records, selectedProvisionId: defaultId, loading: false }, false, 'fetchProvisions/success')
          } catch {
            set({ loading: false }, false, 'fetchProvisions/error')
          }
        },

        setSelectedProvision(id) {
          set({ selectedProvisionId: id }, false, 'setSelectedProvision')
        },
      }),
      {
        name: 'refinex-model',
        partialize: (state) => ({ selectedProvisionId: state.selectedProvisionId }),
      },
    ),
    { name: 'ModelStore', enabled: import.meta.env.DEV },
  ),
)
