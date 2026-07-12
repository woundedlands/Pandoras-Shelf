import { v4 as uuid } from "uuid"
import { SplitDirection, SplitSide, WindowLeaf, WindowNode, WindowSplit } from "./WindowNode"

export function createLeaf(appId: string): WindowLeaf {
	return { kind: "leaf", id: uuid(), appId, scale: 1 }
}

export function setLeafScale(root: WindowNode, leafId: string, scale: number): WindowNode {
	return mapTree(root, leafId, (leaf) => ({
		...leaf,
		scale: Math.min(4, Math.max(0.25, scale)),
	}))
}

export function setLeafApp(root: WindowNode, leafId: string, appId: string): WindowNode {
	return mapTree(root, leafId, (leaf) => ({ ...leaf, appId }))
}

export function findLeaf(node: WindowNode | null, leafId: string): WindowLeaf | null {
	if (!node) {
		return null
	}
	if (node.kind === "leaf") {
		return node.id === leafId ? node : null
	}
	return findLeaf(node.first, leafId) ?? findLeaf(node.second, leafId)
}

export function findLeafScale(node: WindowNode | null, leafId: string): number {
	const leaf = findLeaf(node, leafId)
	return leaf?.scale ?? 1
}

export function collectLeaves(node: WindowNode | null): WindowLeaf[] {
	if (!node) {
		return []
	}
	if (node.kind === "leaf") {
		return [node]
	}
	return [...collectLeaves(node.first), ...collectLeaves(node.second)]
}

export function splitLeaf(
	root: WindowNode,
	leafId: string,
	direction: SplitDirection,
	side: SplitSide,
	newAppId: string,
): WindowNode {
	return mapTree(root, leafId, (leaf) => {
		const newLeaf = createLeaf(newAppId)
		const split: WindowSplit = {
			kind: "split",
			id: uuid(),
			direction,
			firstRatio: 0.5,
			first: side === "start" ? newLeaf : leaf,
			second: side === "start" ? leaf : newLeaf,
		}
		return split
	})
}

export function removeLeaf(root: WindowNode | null, leafId: string): WindowNode | null {
	if (!root) {
		return null
	}
	if (root.kind === "leaf") {
		return root.id === leafId ? null : root
	}
	if (root.first.kind === "leaf" && root.first.id === leafId) {
		return root.second
	}
	if (root.second.kind === "leaf" && root.second.id === leafId) {
		return root.first
	}
	return {
		...root,
		first: removeLeaf(root.first, leafId) ?? root.first,
		second: removeLeaf(root.second, leafId) ?? root.second,
	}
}

export function setSplitRatio(root: WindowNode, splitId: string, ratio: number): WindowNode {
	if (root.kind === "leaf") {
		return root
	}
	if (root.id === splitId) {
		return { ...root, firstRatio: Math.min(0.9, Math.max(0.1, ratio)) }
	}
	return {
		...root,
		first: setSplitRatio(root.first, splitId, ratio),
		second: setSplitRatio(root.second, splitId, ratio),
	}
}

export function swapLeaves(root: WindowNode, firstLeafId: string, secondLeafId: string): WindowNode {
	if (firstLeafId === secondLeafId) {
		return root
	}
	const first = findLeaf(root, firstLeafId)
	const second = findLeaf(root, secondLeafId)
	if (!first || !second) {
		return root
	}
	const afterFirst = replaceAppId(root, firstLeafId, second.appId)
	return replaceAppId(afterFirst, secondLeafId, first.appId)
}

function replaceAppId(node: WindowNode, leafId: string, appId: string): WindowNode {
	return mapTree(node, leafId, (leaf) => ({ ...leaf, appId }))
}

function mapTree(
	node: WindowNode,
	leafId: string,
	replace: (leaf: WindowLeaf) => WindowNode,
): WindowNode {
	if (node.kind === "leaf") {
		return node.id === leafId ? replace(node) : node
	}
	return {
		...node,
		first: mapTree(node.first, leafId, replace),
		second: mapTree(node.second, leafId, replace),
	}
}
