export const appSources = ["builtin", "user"] as const
export type AppSource = (typeof appSources)[number]

export type MiniApp = {
	id: string
	name: string
	icon: string | null
	html: string
	source: AppSource
	createdAt: number
}

export type ExportedApp = {
	name: string
	icon: string | null
	html: string
}

export type AppDatabase = {
	format: "pandoras-shelf-apps"
	version: 1
	apps: ExportedApp[]
}
