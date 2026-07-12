import { create } from "zustand"

type ZoomTarget = {
	workspaceId: string
	leafId: string
}

type ZoomTargetState = {
	target: ZoomTarget | null
}

type ZoomTargetActions = {
	setTarget(target: ZoomTarget | null): void
}

export const useZoomTargetStore = create<ZoomTargetState & ZoomTargetActions>((set) => ({
	target: null,
	setTarget(target) {
		set({ target })
	},
}))
