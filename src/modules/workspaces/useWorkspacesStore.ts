import { create } from "zustand"
import { persist } from "zustand/middleware"
import { v4 as uuid } from "uuid"
import { SplitDirection, SplitSide, Workspace } from "./WindowNode"
import {
	createLeaf,
	removeLeaf,
	setLeafApp,
	setLeafScale,
	setSplitRatio,
	splitLeaf,
	swapLeaves,
} from "./windowTree"

type WorkspacesState = {
	workspaces: Workspace[]
	activeWorkspaceId: string | null
}

type WorkspacesActions = {
	addWorkspace(): string
	removeWorkspace(id: string): void
	clearWorkspace(id: string): void
	renameWorkspace(id: string, name: string): void
	setActiveWorkspace(id: string): void
	setInitialApp(workspaceId: string, appId: string): void
	splitWindow(
		workspaceId: string,
		leafId: string,
		direction: SplitDirection,
		side: SplitSide,
		appId: string,
	): void
	removeWindow(workspaceId: string, leafId: string): void
	resizeSplit(workspaceId: string, splitId: string, ratio: number): void
	swapWindows(workspaceId: string, firstLeafId: string, secondLeafId: string): void
	setWindowScale(workspaceId: string, leafId: string, scale: number): void
	replaceWindowApp(workspaceId: string, leafId: string, appId: string): void
}

function makeWorkspace(index: number): Workspace {
	return { id: uuid(), name: `Workspace ${index}`, root: null }
}

function updateWorkspace(
	state: WorkspacesState,
	id: string,
	map: (workspace: Workspace) => Workspace,
): Workspace[] {
	return state.workspaces.map((workspace) => (workspace.id === id ? map(workspace) : workspace))
}

export const useWorkspacesStore = create<WorkspacesState & WorkspacesActions>()(
	persist(
		(set, get) => ({
			workspaces: [],
			activeWorkspaceId: null,

			addWorkspace() {
				const workspace = makeWorkspace(get().workspaces.length + 1)
				set((state) => ({
					workspaces: [...state.workspaces, workspace],
					activeWorkspaceId: workspace.id,
				}))
				return workspace.id
			},

			removeWorkspace(id) {
				set((state) => {
					const workspaces = state.workspaces.filter((workspace) => workspace.id !== id)
					const activeWorkspaceId =
						state.activeWorkspaceId === id
							? (workspaces[0]?.id ?? null)
							: state.activeWorkspaceId
					return { workspaces, activeWorkspaceId }
				})
			},

			clearWorkspace(id) {
				set((state) => ({
					workspaces: updateWorkspace(state, id, (workspace) => ({ ...workspace, root: null })),
				}))
			},

			renameWorkspace(id, name) {
				set((state) => ({
					workspaces: updateWorkspace(state, id, (workspace) => ({ ...workspace, name })),
				}))
			},

			setActiveWorkspace(id) {
				set({ activeWorkspaceId: id })
			},

			setInitialApp(workspaceId, appId) {
				set((state) => ({
					workspaces: updateWorkspace(state, workspaceId, (workspace) =>
						workspace.root ? workspace : { ...workspace, root: createLeaf(appId) },
					),
				}))
			},

			splitWindow(workspaceId, leafId, direction, side, appId) {
				set((state) => ({
					workspaces: updateWorkspace(state, workspaceId, (workspace) => ({
						...workspace,
						root: workspace.root
							? splitLeaf(workspace.root, leafId, direction, side, appId)
							: createLeaf(appId),
					})),
				}))
			},

			removeWindow(workspaceId, leafId) {
				set((state) => ({
					workspaces: updateWorkspace(state, workspaceId, (workspace) => ({
						...workspace,
						root: removeLeaf(workspace.root, leafId),
					})),
				}))
			},

			resizeSplit(workspaceId, splitId, ratio) {
				set((state) => ({
					workspaces: updateWorkspace(state, workspaceId, (workspace) => ({
						...workspace,
						root: workspace.root ? setSplitRatio(workspace.root, splitId, ratio) : workspace.root,
					})),
				}))
			},

			swapWindows(workspaceId, firstLeafId, secondLeafId) {
				set((state) => ({
					workspaces: updateWorkspace(state, workspaceId, (workspace) => ({
						...workspace,
						root: workspace.root
							? swapLeaves(workspace.root, firstLeafId, secondLeafId)
							: workspace.root,
					})),
				}))
			},

			setWindowScale(workspaceId, leafId, scale) {
				set((state) => ({
					workspaces: updateWorkspace(state, workspaceId, (workspace) => ({
						...workspace,
						root: workspace.root ? setLeafScale(workspace.root, leafId, scale) : workspace.root,
					})),
				}))
			},

			replaceWindowApp(workspaceId, leafId, appId) {
				set((state) => ({
					workspaces: updateWorkspace(state, workspaceId, (workspace) => ({
						...workspace,
						root: workspace.root ? setLeafApp(workspace.root, leafId, appId) : workspace.root,
					})),
				}))
			},
		}),
		{ name: "workspaces" },
	),
)
