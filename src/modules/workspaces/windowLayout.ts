import { SplitDirection, WindowNode } from "./WindowNode"

export type Rect = {
	left: number
	top: number
	width: number
	height: number
}

export type LeafRect = {
	leafId: string
	appId: string
	scale: number
	rect: Rect
}

export type SplitterRect = {
	splitId: string
	direction: SplitDirection
	rect: Rect
	nodeRect: Rect
}

export type WindowLayout = {
	leaves: LeafRect[]
	splitters: SplitterRect[]
}

const fullRect: Rect = { left: 0, top: 0, width: 100, height: 100 }

export function computeLayout(node: WindowNode | null): WindowLayout {
	const layout: WindowLayout = { leaves: [], splitters: [] }
	if (node) {
		walk(node, fullRect, layout)
	}
	return layout
}

function walk(node: WindowNode, rect: Rect, layout: WindowLayout) {
	if (node.kind === "leaf") {
		layout.leaves.push({ leafId: node.id, appId: node.appId, scale: node.scale ?? 1, rect })
		return
	}

	if (node.direction === "row") {
		const firstWidth = rect.width * node.firstRatio
		const firstRect: Rect = { ...rect, width: firstWidth }
		const secondRect: Rect = {
			left: rect.left + firstWidth,
			top: rect.top,
			width: rect.width - firstWidth,
			height: rect.height,
		}
		layout.splitters.push({
			splitId: node.id,
			direction: "row",
			nodeRect: rect,
			rect: {
				left: rect.left + firstWidth,
				top: rect.top,
				width: 0,
				height: rect.height,
			},
		})
		walk(node.first, firstRect, layout)
		walk(node.second, secondRect, layout)
		return
	}

	const firstHeight = rect.height * node.firstRatio
	const firstRect: Rect = { ...rect, height: firstHeight }
	const secondRect: Rect = {
		left: rect.left,
		top: rect.top + firstHeight,
		width: rect.width,
		height: rect.height - firstHeight,
	}
	layout.splitters.push({
		splitId: node.id,
		direction: "column",
		nodeRect: rect,
		rect: {
			left: rect.left,
			top: rect.top + firstHeight,
			width: rect.width,
			height: 0,
		},
	})
	walk(node.first, firstRect, layout)
	walk(node.second, secondRect, layout)
}
