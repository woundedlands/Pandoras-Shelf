import { Center, Text } from "@mantine/core"
import { WindowManager } from "./WindowManager"
import { useWorkspacesStore } from "./useWorkspacesStore"
import { useSettingsStore } from "../settings/useSettingsStore"

type WorkspaceViewProps = {
	visible: boolean
}

export function WorkspaceView({ visible }: WorkspaceViewProps) {
	const workspaces = useWorkspacesStore((state) => state.workspaces)
	const activeWorkspaceId = useWorkspacesStore((state) => state.activeWorkspaceId)
	const alwaysShowBorders = useSettingsStore((state) => state.alwaysShowBorders)

	if (workspaces.length === 0) {
		return (
			<Center h="100%" style={{ display: visible ? "flex" : "none" }}>
				<Text c="dimmed">No workspaces yet</Text>
			</Center>
		)
	}

	return (
		<div style={{ width: "100%", height: "100%", display: visible ? "block" : "none" }}>
			{workspaces.map((workspace) => (
				<div
					key={workspace.id}
					style={{
						width: "100%",
						height: "100%",
						display: workspace.id === activeWorkspaceId ? "block" : "none",
					}}
				>
					<WindowManager
						workspace={workspace}
						alwaysShowBorders={alwaysShowBorders}
						active={visible && workspace.id === activeWorkspaceId}
					/>
				</div>
			))}
		</div>
	)
}
