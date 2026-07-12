import { create } from "zustand"

type PickCallback = (appId: string) => void

type AppPickerState = {
	open: boolean
	callback: PickCallback | null
}

type AppPickerActions = {
	requestPick(callback: PickCallback): void
	pick(appId: string): void
	close(): void
}

export const useAppPickerStore = create<AppPickerState & AppPickerActions>((set, get) => ({
	open: false,
	callback: null,
	requestPick(callback) {
		set({ open: true, callback })
	},
	pick(appId) {
		const callback = get().callback
		if (callback) {
			callback(appId)
		}
		set({ open: false, callback: null })
	},
	close() {
		set({ open: false, callback: null })
	},
}))
