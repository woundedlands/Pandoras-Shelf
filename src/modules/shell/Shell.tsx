import { useEffect } from "react"
import { createUseStyles } from "react-jss"
import { Sidebar } from "./Sidebar"
import { useShellStore } from "./useShellStore"
import { useSettingsStore } from "../settings/useSettingsStore"
import { useAppsStore } from "../apps/useAppsStore"
import { useWorkspacesStore } from "../workspaces/useWorkspacesStore"
import { useZoomTargetStore } from "../workspaces/useZoomTargetStore"
import { findLeafScale } from "../workspaces/windowTree"
import { WorkspaceView } from "../workspaces/WorkspaceView"
import { InstallView } from "../install/InstallView"
import { SettingsView } from "../settings/SettingsView"
import { AppPickerModal } from "../apps/AppPickerModal"

const sidebarWidth = 56

const useStyles = createUseStyles({
	root: {
		position: "fixed",
		inset: 0,
		overflow: "hidden",
	},
	content: {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		transition: "left 150ms ease",
	},
	overlay: {
		position: "absolute",
		inset: 0,
		background: "var(--mantine-color-body)",
		overflow: "auto",
	},
})

export function Shell() {
	const styles = useStyles()
	const view = useShellStore((state) => state.view)
	const alwaysShowSidebar = useSettingsStore((state) => state.alwaysShowSidebar)
	const loadApps = useAppsStore((state) => state.load)
	const workspaces = useWorkspacesStore((state) => state.workspaces)
	const activeWorkspaceId = useWorkspacesStore((state) => state.activeWorkspaceId)
	const addWorkspace = useWorkspacesStore((state) => state.addWorkspace)
	const setActiveWorkspace = useWorkspacesStore((state) => state.setActiveWorkspace)

	const adjustGlobalScale = useSettingsStore((state) => state.adjustGlobalScale)
	const setWindowScale = useWorkspacesStore((state) => state.setWindowScale)

	useEffect(() => {
		loadApps()
	}, [loadApps])

	useEffect(() => {
		function applyScale(delta: number) {
			const target = useZoomTargetStore.getState().target
			if (target) {
				const workspace = useWorkspacesStore
					.getState()
					.workspaces.find((item) => item.id === target.workspaceId)
				const current = findLeafScale(workspace?.root ?? null, target.leafId)
				setWindowScale(target.workspaceId, target.leafId, current + delta)
			} else {
				adjustGlobalScale(delta)
			}
		}
		function onKeyDown(event: KeyboardEvent) {
			if (!event.ctrlKey) {
				return
			}
			const isPlus = event.key === "=" || event.key === "+"
			const isMinus = event.key === "-" || event.key === "_"
			if (!isPlus && !isMinus) {
				return
			}
			event.preventDefault()
			applyScale(isPlus ? 0.05 : -0.05)
		}
		function onWheel(event: WheelEvent) {
			if (!event.ctrlKey) {
				return
			}
			event.preventDefault()
			applyScale(event.deltaY < 0 ? 0.05 : -0.05)
		}
		window.addEventListener("keydown", onKeyDown)
		window.addEventListener("wheel", onWheel, { passive: false })
		return () => {
			window.removeEventListener("keydown", onKeyDown)
			window.removeEventListener("wheel", onWheel)
		}
	}, [adjustGlobalScale, setWindowScale])

	useEffect(() => {
		if (workspaces.length === 0) {
			addWorkspace()
		} else if (!activeWorkspaceId) {
			setActiveWorkspace(workspaces[0].id)
		}
	}, [workspaces, activeWorkspaceId, addWorkspace, setActiveWorkspace])

	return (
		<div className={styles.root}>
			<Sidebar />
			<div className={styles.content} style={{ left: alwaysShowSidebar ? sidebarWidth : 0 }}>
				<WorkspaceView visible={view === "workspace"} />
				{view === "install" ? (
					<div className={styles.overlay}>
						<InstallView />
					</div>
				) : null}
				{view === "settings" ? (
					<div className={styles.overlay}>
						<SettingsView />
					</div>
				) : null}
			</div>
			<AppPickerModal />
		</div>
	)
}
