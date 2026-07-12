import {
	ActionIcon,
	Badge,
	Button,
	Card,
	Checkbox,
	Group,
	ScrollArea,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core"
import { modals } from "@mantine/modals"
import {
	IconDownload,
	IconEdit,
	IconFileImport,
	IconPlus,
	IconSearch,
	IconTrash,
} from "@tabler/icons-react"
import { useMemo, useState } from "react"
import { AppDatabase, MiniApp } from "../apps/MiniApp"
import { useAppsStore } from "../apps/useAppsStore"
import { builtinApps } from "../apps/builtinApps"
import { AppIcon } from "../apps/AppIcon"
import { AppEditorModal } from "./AppEditorModal"
import { downloadJson, readFileAsText } from "../lib/files"

export function InstallView() {
	const userApps = useAppsStore((state) => state.userApps)
	const addApp = useAppsStore((state) => state.addApp)
	const updateApp = useAppsStore((state) => state.updateApp)
	const deleteApp = useAppsStore((state) => state.deleteApp)
	const importDatabase = useAppsStore((state) => state.importDatabase)
	const exportApps = useAppsStore((state) => state.exportApps)

	const [query, setQuery] = useState("")
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const [editorOpen, setEditorOpen] = useState(false)
	const [editingApp, setEditingApp] = useState<MiniApp | null>(null)

	const filtered = useMemo(() => {
		const search = query.trim().toLowerCase()
		if (!search) {
			return userApps
		}
		return userApps.filter((app) => app.name.toLowerCase().includes(search))
	}, [userApps, query])

	function toggleSelected(id: string) {
		setSelected((previous) => {
			const next = new Set(previous)
			if (next.has(id)) {
				next.delete(id)
			} else {
				next.add(id)
			}
			return next
		})
	}

	function openInstall() {
		setEditingApp(null)
		setEditorOpen(true)
	}

	function openEdit(app: MiniApp) {
		setEditingApp(app)
		setEditorOpen(true)
	}

	function handleSubmit(values: { name: string; html: string; icon: string | null }) {
		if (editingApp) {
			updateApp(editingApp.id, values)
		} else {
			addApp(values.name, values.html, values.icon)
		}
		setEditorOpen(false)
	}

	async function handleImport(file: File | null) {
		if (!file) {
			return
		}
		try {
			const database = JSON.parse(await readFileAsText(file)) as AppDatabase
			if (database.format !== "pandoras-shelf-apps" || !Array.isArray(database.apps)) {
				throw new Error("Invalid database")
			}
			await importDatabase(database)
		} catch {
			modals.open({
				title: "Import failed",
				children: <Text size="sm">This file is not a valid app database.</Text>,
			})
		}
	}

	function exportSelected() {
		const ids = [...selected]
		if (ids.length === 0) {
			return
		}
		downloadJson("pandoras-shelf-apps.json", exportApps(ids))
	}

	function deleteSelected() {
		const ids = [...selected]
		if (ids.length === 0) {
			return
		}
		modals.openConfirmModal({
			title: "Delete apps",
			children: (
				<Text size="sm">
					Permanently delete {ids.length} selected app(s)? This cannot be undone.
				</Text>
			),
			labels: { confirm: "Delete", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: async () => {
				for (const id of ids) {
					await deleteApp(id)
				}
				setSelected(new Set())
			},
		})
	}

	function renderCard(app: MiniApp, builtin: boolean) {
		return (
			<Card key={app.id} withBorder padding="sm">
				<Group justify="space-between" align="flex-start" wrap="nowrap">
					<Group wrap="nowrap">
						{!builtin ? (
							<Checkbox
								checked={selected.has(app.id)}
								onChange={() => toggleSelected(app.id)}
							/>
						) : null}
						<AppIcon app={app} />
						<Stack gap={2}>
							<Text fw={600} lineClamp={1}>
								{app.name}
							</Text>
							{builtin ? <Badge size="xs" variant="light">Built-in</Badge> : null}
						</Stack>
					</Group>
					{!builtin ? (
						<Group gap={4} wrap="nowrap">
							<ActionIcon variant="subtle" onClick={() => openEdit(app)}>
								<IconEdit size={16} />
							</ActionIcon>
						</Group>
					) : null}
				</Group>
			</Card>
		)
	}

	return (
		<Stack h="100%" gap="sm" p="md">
			<Group justify="space-between">
				<Title order={3}>Install apps</Title>
				<Group>
					<Button
						variant="light"
						leftSection={<IconFileImport size={16} />}
						component="label"
					>
						Import database
						<input
							type="file"
							accept=".json,application/json"
							hidden
							onChange={(event) => handleImport(event.currentTarget.files?.[0] ?? null)}
						/>
					</Button>
					<Button leftSection={<IconPlus size={16} />} onClick={openInstall}>
						Install app
					</Button>
				</Group>
			</Group>

			<TextInput
				placeholder="Search apps"
				leftSection={<IconSearch size={16} />}
				value={query}
				onChange={(event) => setQuery(event.currentTarget.value)}
			/>

			{selected.size > 0 ? (
				<Group>
					<Text size="sm">{selected.size} selected</Text>
					<Button
						size="xs"
						variant="light"
						leftSection={<IconDownload size={14} />}
						onClick={exportSelected}
					>
						Export
					</Button>
					<Button
						size="xs"
						color="red"
						variant="light"
						leftSection={<IconTrash size={14} />}
						onClick={deleteSelected}
					>
						Delete
					</Button>
				</Group>
			) : null}

			<ScrollArea style={{ flex: 1 }}>
				<Stack gap="lg">
					<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
						{filtered.map((app) => renderCard(app, false))}
					</SimpleGrid>
					{filtered.length === 0 ? (
						<Text c="dimmed" ta="center">
							No user apps installed
						</Text>
					) : null}

					<Stack gap="xs">
						<Text size="sm" fw={600} c="dimmed">
							Built-in
						</Text>
						<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
							{builtinApps.map((app) => renderCard(app, true))}
						</SimpleGrid>
					</Stack>
				</Stack>
			</ScrollArea>

			<AppEditorModal
				opened={editorOpen}
				app={editingApp}
				onClose={() => setEditorOpen(false)}
				onSubmit={handleSubmit}
			/>
		</Stack>
	)
}
