import { create } from "zustand"
import { combine, persist } from "zustand/middleware"
import { AppTheme } from "./AppTheme"

const minGlobalScale = 0.25
const maxGlobalScale = 4
export const scaleStep = 0.05

const defaultState = {
	theme: "auto" as AppTheme,
	alwaysShowSidebar: true,
	alwaysShowBorders: false,
	globalScale: 1,
}

function clampGlobalScale(value: number): number {
	const rounded = Math.round(value / scaleStep) * scaleStep
	return Math.min(maxGlobalScale, Math.max(minGlobalScale, Number(rounded.toFixed(2))))
}

const createState = combine({ ...defaultState }, (set) => {
	return {
		setTheme(value: AppTheme) {
			set({ theme: value })
		},
		setAlwaysShowSidebar(value: boolean) {
			set({ alwaysShowSidebar: value })
		},
		setAlwaysShowBorders(value: boolean) {
			set({ alwaysShowBorders: value })
		},
		setGlobalScale(value: number) {
			set({ globalScale: clampGlobalScale(value) })
		},
		adjustGlobalScale(delta: number) {
			set((state) => ({ globalScale: clampGlobalScale(state.globalScale + delta) }))
		},
		resetSettings() {
			set({ ...defaultState })
		},
	}
})

const createPersist = persist(createState, {
	name: "settings",
})

export const useSettingsStore = create<ReturnType<typeof createState>>()(createPersist)
