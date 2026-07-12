import { create } from "zustand"

export const shellViews = ["workspace", "install", "settings"] as const
export type ShellView = (typeof shellViews)[number]

type ShellState = {
	view: ShellView
}

type ShellActions = {
	setView(view: ShellView): void
}

export const useShellStore = create<ShellState & ShellActions>((set) => ({
	view: "workspace",
	setView(view) {
		set({ view })
	},
}))
