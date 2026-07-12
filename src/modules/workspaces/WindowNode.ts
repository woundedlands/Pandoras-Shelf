export const splitDirections = ["row", "column"] as const
export type SplitDirection = (typeof splitDirections)[number]

export const splitSides = ["start", "end"] as const
export type SplitSide = (typeof splitSides)[number]

export type WindowLeaf = {
	kind: "leaf"
	id: string
	appId: string
	scale: number
}

export type WindowSplit = {
	kind: "split"
	id: string
	direction: SplitDirection
	firstRatio: number
	first: WindowNode
	second: WindowNode
}

export type WindowNode = WindowLeaf | WindowSplit

export type Workspace = {
	id: string
	name: string
	root: WindowNode | null
}
