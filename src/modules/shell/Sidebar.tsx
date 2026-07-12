import { ActionIcon, Menu, Stack, Tooltip } from "@mantine/core"
import { modals } from "@mantine/modals"
import {
	IconDownload,
	IconEraser,
	IconLayoutGrid,
	IconPlus,
	IconSettings,
	IconTrash,
} from "@tabler/icons-react"
import { useState } from "react"
import { createUseStyles } from "react-jss"
import { useShellStore } from "./useShellStore"
import { useSettingsStore } from "../settings/useSettingsStore"
import { useWorkspacesStore } from "../workspaces/useWorkspacesStore"

const sidebarWidth = 56
const hintWidth = 6
const hoverZoneWidth = 8

const useStyles = createUseStyles({
	hoverZone: {
		position: "absolute",
		top: 0,
		left: 0,
		bottom: 0,
		width: hoverZoneWidth,
		zIndex: 25,
	},
	hint: {
		position: "absolute",
		top: 0,
		left: 0,
		bottom: 0,
		width: hintWidth,
		background: "var(--mantine-color-default-border)",
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
		zIndex: 20,
		pointerEvents: "none",
	},
	sidebar: {
		position: "absolute",
		top: 0,
		left: 0,
		bottom: 0,
		width: sidebarWidth,
		zIndex: 30,
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		padding: 8,
		gap: 8,
		background: "var(--mantine-color-body)",
		borderRight: "1px solid var(--mantine-color-default-border)",
		transition: "transform 150ms ease",
	},
	hidden: {
		transform: `translateX(-${sidebarWidth + hintWidth}px)`,
	},
	workspaceScroll: {
		flex: 1,
		minHeight: 0,
		overflowY: "auto",
		scrollbarWidth: "none",
		"&::-webkit-scrollbar": {
			display: "none",
		},
	},
})

export function Sidebar() {
	const styles = useStyles()
	const view = useShellStore((state) => state.view)
	const setView = useShellStore((state) => state.setView)
	const [hovered, setHovered] = useState(false)
	const [menuWorkspaceId, setMenuWorkspaceId] = useState<string | null>(null)
	const [longPressTimer, setLongPressTimer] = useState<number | null>(null)
	const alwaysShowSidebar = useSettingsStore((state) => state.alwaysShowSidebar)

	const workspaces = useWorkspacesStore((state) => state.workspaces)
	const activeWorkspaceId = useWorkspacesStore((state) => state.activeWorkspaceId)
	const setActiveWorkspace = useWorkspacesStore((state) => state.setActiveWorkspace)
	const addWorkspace = useWorkspacesStore((state) => state.addWorkspace)
	const removeWorkspace = useWorkspacesStore((state) => state.removeWorkspace)
	const clearWorkspace = useWorkspacesStore((state) => state.clearWorkspace)

	const visible = alwaysShowSidebar || hovered

	function openWorkspace(id: string) {
		setActiveWorkspace(id)
		setView("workspace")
	}

	function confirmRemove(id: string, name: string) {
		modals.openConfirmModal({
			title: "Delete workspace",
			children: <span>Delete "{name}" and all its windows?</span>,
			labels: { confirm: "Delete", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => removeWorkspace(id),
		})
	}

	function confirmClear(id: string, name: string) {
		modals.openConfirmModal({
			title: "Clear workspace",
			children: <span>Remove all windows from "{name}"?</span>,
			labels: { confirm: "Clear", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => clearWorkspace(id),
		})
	}

	return (
		<div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
			{!alwaysShowSidebar ? <div className={styles.hoverZone} /> : null}
			<div className={styles.hint} />
			<div className={`${styles.sidebar} ${visible ? "" : styles.hidden}`}>
				<div className={styles.workspaceScroll}>
					<Stack gap={6} align="center">
						{workspaces.map((workspace, index) => {
							const active = view === "workspace" && workspace.id === activeWorkspaceId
							return (
								<Menu
									key={workspace.id}
									position="right"
									withArrow
									shadow="md"
									opened={menuWorkspaceId === workspace.id}
									onChange={(open) => setMenuWorkspaceId(open ? workspace.id : null)}
								>
									<Menu.Target>
										<Tooltip label={workspace.name} position="right">
											<ActionIcon
												variant={active ? "filled" : "subtle"}
												size="lg"
												onClick={() => openWorkspace(workspace.id)}
												onContextMenu={(event) => {
													event.preventDefault()
													setMenuWorkspaceId(workspace.id)
												}}
												onPointerDown={(event) => {
													if (event.pointerType === "touch") {
														const timer = window.setTimeout(
															() => setMenuWorkspaceId(workspace.id),
															500,
														)
														setLongPressTimer(timer)
													}
												}}
												onPointerUp={() => {
													if (longPressTimer !== null) {
														window.clearTimeout(longPressTimer)
														setLongPressTimer(null)
													}
												}}
											>
												{index + 1}
											</ActionIcon>
										</Tooltip>
									</Menu.Target>
									<Menu.Dropdown>
										<Menu.Label>{workspace.name}</Menu.Label>
										<Menu.Item
											leftSection={<IconEraser size={14} />}
											onClick={() => confirmClear(workspace.id, workspace.name)}
										>
											Clear windows
										</Menu.Item>
										<Menu.Item
											color="red"
											leftSection={<IconTrash size={14} />}
											disabled={workspaces.length <= 1}
											onClick={() => confirmRemove(workspace.id, workspace.name)}
										>
											Delete workspace
										</Menu.Item>
									</Menu.Dropdown>
								</Menu>
							)
						})}
						<Tooltip label="New workspace" position="right">
							<ActionIcon variant="subtle" size="lg" onClick={() => addWorkspace()}>
								<IconPlus size={20} />
							</ActionIcon>
						</Tooltip>
					</Stack>
				</div>

				<Stack gap={6} align="center">
					<Tooltip label="Workspaces" position="right">
						<ActionIcon
							variant={view === "workspace" ? "light" : "subtle"}
							size="lg"
							onClick={() => setView("workspace")}
						>
							<IconLayoutGrid size={20} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Install apps" position="right">
						<ActionIcon
							variant={view === "install" ? "filled" : "subtle"}
							size="lg"
							onClick={() => setView("install")}
						>
							<IconDownload size={20} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Settings" position="right">
						<ActionIcon
							variant={view === "settings" ? "filled" : "subtle"}
							size="lg"
							onClick={() => setView("settings")}
						>
							<IconSettings size={20} />
						</ActionIcon>
					</Tooltip>
				</Stack>
			</div>
		</div>
	)
}
