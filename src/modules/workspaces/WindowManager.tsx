import { Button, Center, Stack, Text } from "@mantine/core"
import { modals } from "@mantine/modals"
import { IconPlus } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { createUseStyles } from "react-jss"
import { SplitDirection, SplitSide, Workspace } from "./WindowNode"
import { computeLayout } from "./windowLayout"
import { WindowFrame } from "./WindowFrame"
import { AppView } from "./AppView"
import { useWorkspacesStore } from "./useWorkspacesStore"
import { useZoomTargetStore } from "./useZoomTargetStore"
import { useAppsStore } from "../apps/useAppsStore"
import { useAppPickerStore } from "../apps/useAppPickerStore"
import { useSettingsStore } from "../settings/useSettingsStore"

const splitterHit = 8

const useStyles = createUseStyles({
	container: {
		position: "relative",
		width: "100%",
		height: "100%",
		overflow: "hidden",
	},
	noSelect: {
		userSelect: "none",
	},
	splitter: {
		position: "absolute",
		zIndex: 6,
		"&:hover::after": {
			content: '""',
			position: "absolute",
			inset: 0,
			background: "var(--mantine-color-blue-filled)",
			opacity: 0.3,
		},
	},
	zoomLayer: {
		position: "absolute",
		zIndex: 7,
		cursor: "zoom-in",
	},
	dropTarget: {
		position: "absolute",
		zIndex: 8,
		background: "var(--mantine-color-blue-light)",
		border: "3px dashed var(--mantine-color-blue-filled)",
		borderRadius: 8,
		pointerEvents: "none",
	},
})

type FrameDrag = {
	leafId: string
	startX: number
	startY: number
	active: boolean
}

type WindowManagerProps = {
	workspace: Workspace
	alwaysShowBorders: boolean
	active: boolean
}

function percent(value: number): string {
	return `${value}%`
}

export function WindowManager({ workspace, alwaysShowBorders, active }: WindowManagerProps) {
	const styles = useStyles()
	const containerRef = useRef<HTMLDivElement>(null)
	const orderRef = useRef<string[]>([])
	const dragTargetLeafRef = useRef<string | null>(null)
	const [refreshTicks, setRefreshTicks] = useState<Record<string, number>>({})
	const [dragTargetLeaf, setDragTargetLeaf] = useState<string | null>(null)
	const [dragging, setDragging] = useState(false)
	const [ctrlHeld, setCtrlHeld] = useState(false)
	dragTargetLeafRef.current = dragTargetLeaf

	const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
	const setZoomTarget = useZoomTargetStore((state) => state.setTarget)

	const getById = useAppsStore((state) => state.getById)
	useAppsStore((state) => state.userApps)
	const requestPick = useAppPickerStore((state) => state.requestPick)
	const globalScale = useSettingsStore((state) => state.globalScale)
	const splitWindow = useWorkspacesStore((state) => state.splitWindow)
	const removeWindow = useWorkspacesStore((state) => state.removeWindow)
	const resizeSplit = useWorkspacesStore((state) => state.resizeSplit)
	const swapWindows = useWorkspacesStore((state) => state.swapWindows)
	const setWindowScale = useWorkspacesStore((state) => state.setWindowScale)
	const replaceWindowApp = useWorkspacesStore((state) => state.replaceWindowApp)
	const setInitialApp = useWorkspacesStore((state) => state.setInitialApp)

	const layout = computeLayout(workspace.root)

	const currentIds = layout.leaves.map((leaf) => leaf.leafId)
	orderRef.current = [
		...orderRef.current.filter((id) => currentIds.includes(id)),
		...currentIds.filter((id) => !orderRef.current.includes(id)),
	]
	const orderedLeaves = orderRef.current
		.map((id) => layout.leaves.find((leaf) => leaf.leafId === id))
		.filter((leaf): leaf is (typeof layout.leaves)[number] => leaf !== undefined)

	// Zooming apps requires a Ctrl-held overlay above each iframe, otherwise the
	// iframe swallows wheel/pointer events and hovering an app never registers.
	useEffect(() => {
		if (!active) {
			return
		}
		function leafAtClientPoint(clientX: number, clientY: number): string | null {
			const bounds = containerRef.current?.getBoundingClientRect()
			if (!bounds || bounds.width === 0) {
				return null
			}
			const localX = ((clientX - bounds.left) / bounds.width) * 100
			const localY = ((clientY - bounds.top) / bounds.height) * 100
			const leaf = layout.leaves.find(
				(item) =>
					localX >= item.rect.left &&
					localX <= item.rect.left + item.rect.width &&
					localY >= item.rect.top &&
					localY <= item.rect.top + item.rect.height,
			)
			return leaf?.leafId ?? null
		}
		function onPointerMove(event: PointerEvent) {
			pointerRef.current = { x: event.clientX, y: event.clientY }
		}
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Control") {
				setCtrlHeld(true)
				const leafId = leafAtClientPoint(pointerRef.current.x, pointerRef.current.y)
				setZoomTarget(leafId ? { workspaceId: workspace.id, leafId } : null)
			}
		}
		function onKeyUp(event: KeyboardEvent) {
			if (event.key === "Control") {
				setCtrlHeld(false)
				setZoomTarget(null)
			}
		}
		function onBlur() {
			setCtrlHeld(false)
			setZoomTarget(null)
		}
		window.addEventListener("pointermove", onPointerMove)
		window.addEventListener("keydown", onKeyDown)
		window.addEventListener("keyup", onKeyUp)
		window.addEventListener("blur", onBlur)
		return () => {
			window.removeEventListener("pointermove", onPointerMove)
			window.removeEventListener("keydown", onKeyDown)
			window.removeEventListener("keyup", onKeyUp)
			window.removeEventListener("blur", onBlur)
		}
	}, [active, workspace.id, setZoomTarget, layout])

	function handleSplit(leafId: string, direction: SplitDirection, side: SplitSide) {
		requestPick((appId) => splitWindow(workspace.id, leafId, direction, side, appId))
	}

	function handleReplace(leafId: string) {
		requestPick((appId) => replaceWindowApp(workspace.id, leafId, appId))
	}

	function handleRefresh(leafId: string) {
		setRefreshTicks((ticks) => ({ ...ticks, [leafId]: (ticks[leafId] ?? 0) + 1 }))
	}

	function handleRemove(leafId: string) {
		modals.openConfirmModal({
			title: "Remove window",
			children: <Text size="sm">Remove this window from the workspace?</Text>,
			labels: { confirm: "Remove", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => removeWindow(workspace.id, leafId),
		})
	}

	function beginSplitterDrag(event: React.PointerEvent, splitId: string, direction: SplitDirection) {
		event.preventDefault()
		const bounds = containerRef.current?.getBoundingClientRect()
		if (!bounds) {
			return
		}
		setDragging(true)

		function onMove(moveEvent: PointerEvent) {
			const ratio =
				direction === "row"
					? (moveEvent.clientX - bounds!.left) / bounds!.width
					: (moveEvent.clientY - bounds!.top) / bounds!.height
			resizeSplit(workspace.id, splitId, ratio)
		}

		function onUp() {
			setDragging(false)
			window.removeEventListener("pointermove", onMove)
			window.removeEventListener("pointerup", onUp)
		}

		window.addEventListener("pointermove", onMove)
		window.addEventListener("pointerup", onUp)
	}

	function beginFrameDrag(event: React.PointerEvent, leafId: string) {
		event.preventDefault()
		const bounds = containerRef.current?.getBoundingClientRect()
		if (!bounds) {
			return
		}
		const drag: FrameDrag = { leafId, startX: event.clientX, startY: event.clientY, active: false }

		function onMove(moveEvent: PointerEvent) {
			if (!drag.active) {
				const moved =
					Math.abs(moveEvent.clientX - drag.startX) + Math.abs(moveEvent.clientY - drag.startY)
				if (moved < 8) {
					return
				}
				drag.active = true
				setDragging(true)
			}
			const localX = ((moveEvent.clientX - bounds!.left) / bounds!.width) * 100
			const localY = ((moveEvent.clientY - bounds!.top) / bounds!.height) * 100
			const target = layout.leaves.find(
				(leaf) =>
					localX >= leaf.rect.left &&
					localX <= leaf.rect.left + leaf.rect.width &&
					localY >= leaf.rect.top &&
					localY <= leaf.rect.top + leaf.rect.height,
			)
			setDragTargetLeaf(target && target.leafId !== leafId ? target.leafId : null)
		}

		function onUp() {
			if (drag.active && dragTargetLeafRef.current && dragTargetLeafRef.current !== leafId) {
				swapWindows(workspace.id, leafId, dragTargetLeafRef.current)
			}
			setDragging(false)
			setDragTargetLeaf(null)
			window.removeEventListener("pointermove", onMove)
			window.removeEventListener("pointerup", onUp)
		}

		window.addEventListener("pointermove", onMove)
		window.addEventListener("pointerup", onUp)
	}

	if (!workspace.root) {
		return (
			<Center h="100%">
				<Stack align="center">
					<Text c="dimmed">This workspace is empty</Text>
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => requestPick((appId) => setInitialApp(workspace.id, appId))}
					>
						Add app
					</Button>
				</Stack>
			</Center>
		)
	}

	const targetRect = dragTargetLeaf
		? layout.leaves.find((leaf) => leaf.leafId === dragTargetLeaf)?.rect
		: null

	return (
		<div
			ref={containerRef}
			className={`${styles.container} ${dragging ? styles.noSelect : ""}`}
		>
			{orderedLeaves.map((leaf) => {
				const app = getById(leaf.appId)
				return (
					<AppView
						key={`${leaf.leafId}:${refreshTicks[leaf.leafId] ?? 0}`}
						html={app?.html ?? null}
						title={app?.name ?? "App"}
						rect={leaf.rect}
						scale={globalScale * leaf.scale}
						interactive={!dragging}
					/>
				)
			})}

			{ctrlHeld
				? layout.leaves.map((leaf) => (
						<div
							key={`zoom-${leaf.leafId}`}
							className={styles.zoomLayer}
							style={{
								left: percent(leaf.rect.left),
								top: percent(leaf.rect.top),
								width: percent(leaf.rect.width),
								height: percent(leaf.rect.height),
							}}
							onMouseEnter={() =>
								setZoomTarget({ workspaceId: workspace.id, leafId: leaf.leafId })
							}
							onMouseLeave={() => setZoomTarget(null)}
						/>
					))
				: null}

			{layout.splitters.map((splitter) => {
				const isRow = splitter.direction === "row"
				return (
					<div
						key={splitter.splitId}
						className={styles.splitter}
						style={{
							left: isRow ? `calc(${percent(splitter.rect.left)} - ${splitterHit / 2}px)` : percent(splitter.rect.left),
							top: isRow ? percent(splitter.rect.top) : `calc(${percent(splitter.rect.top)} - ${splitterHit / 2}px)`,
							width: isRow ? splitterHit : percent(splitter.rect.width),
							height: isRow ? percent(splitter.rect.height) : splitterHit,
							cursor: isRow ? "col-resize" : "row-resize",
						}}
						onPointerDown={(event) =>
							beginSplitterDrag(event, splitter.splitId, splitter.direction)
						}
					/>
				)
			})}

			{layout.leaves.map((leaf) => (
				<WindowFrame
					key={leaf.leafId}
					leafId={leaf.leafId}
					rect={leaf.rect}
					scale={leaf.scale}
					alwaysShowBorders={alwaysShowBorders}
					onSplit={(direction, side) => handleSplit(leaf.leafId, direction, side)}
					onReplace={() => handleReplace(leaf.leafId)}
					onRefresh={() => handleRefresh(leaf.leafId)}
					onRemove={() => handleRemove(leaf.leafId)}
					onScale={(scale) => setWindowScale(workspace.id, leaf.leafId, scale)}
					onDragStart={(event) => beginFrameDrag(event, leaf.leafId)}
				/>
			))}

			{targetRect ? (
				<div
					className={styles.dropTarget}
					style={{
						left: percent(targetRect.left),
						top: percent(targetRect.top),
						width: percent(targetRect.width),
						height: percent(targetRect.height),
					}}
				/>
			) : null}
		</div>
	)
}
