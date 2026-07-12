import { create } from "zustand"
import { v4 as uuid } from "uuid"
import { AppDatabase, ExportedApp, MiniApp } from "./MiniApp"
import { builtinApps } from "./builtinApps"
import { IndexedDbStore } from "../lib/indexedDb"

const userAppsStore = new IndexedDbStore<MiniApp>("pandoras-shelf", "apps")

type AppsState = {
	userApps: MiniApp[]
	loaded: boolean
}

type AppsActions = {
	load(): Promise<void>
	getById(id: string): MiniApp | undefined
	addApp(name: string, html: string, icon: string | null): Promise<MiniApp>
	updateApp(id: string, patch: Partial<Pick<MiniApp, "name" | "html" | "icon">>): Promise<void>
	deleteApp(id: string): Promise<void>
	importDatabase(database: AppDatabase): Promise<void>
	exportApps(ids: string[]): AppDatabase
}

export const useAppsStore = create<AppsState & AppsActions>((set, get) => {
	function allUserApps(): MiniApp[] {
		return get().userApps
	}

	return {
		userApps: [],
		loaded: false,

		async load() {
			if (get().loaded) {
				return
			}
			const userApps = await userAppsStore.getAll()
			userApps.sort((first, second) => first.createdAt - second.createdAt)
			set({ userApps, loaded: true })
		},

		getById(id) {
			const builtin = builtinApps.find((app) => app.id === id)
			if (builtin) {
				return builtin
			}
			return allUserApps().find((app) => app.id === id)
		},

		async addApp(name, html, icon) {
			const app: MiniApp = {
				id: uuid(),
				name,
				html,
				icon,
				source: "user",
				createdAt: Date.now(),
			}
			await userAppsStore.put(app.id, app)
			set((state) => ({ userApps: [...state.userApps, app] }))
			return app
		},

		async updateApp(id, patch) {
			const existing = allUserApps().find((app) => app.id === id)
			if (!existing) {
				return
			}
			const updated = { ...existing, ...patch }
			await userAppsStore.put(id, updated)
			set((state) => ({
				userApps: state.userApps.map((app) => (app.id === id ? updated : app)),
			}))
		},

		async deleteApp(id) {
			await userAppsStore.delete(id)
			set((state) => ({ userApps: state.userApps.filter((app) => app.id !== id) }))
		},

		async importDatabase(database) {
			for (const exported of database.apps) {
				await get().addApp(exported.name, exported.html, exported.icon)
			}
		},

		exportApps(ids) {
			const selected = ids
				.map((id) => get().getById(id))
				.filter((app): app is MiniApp => app !== undefined)
			const apps: ExportedApp[] = selected.map((app) => ({
				name: app.name,
				icon: app.icon,
				html: app.html,
			}))
			return { format: "pandoras-shelf-apps", version: 1, apps }
		},
	}
})
