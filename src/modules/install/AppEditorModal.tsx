import {
	Button,
	FileButton,
	Group,
	Modal,
	Stack,
	Text,
	TextInput,
} from "@mantine/core"
import { IconFileCode, IconPhoto } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { MiniApp } from "../apps/MiniApp"
import { readFileAsDataUrl, readFileAsText } from "../lib/files"
import { AppIcon } from "../apps/AppIcon"

type AppEditorModalProps = {
	opened: boolean
	app: MiniApp | null
	onClose(): void
	onSubmit(values: { name: string; html: string; icon: string | null }): void
}

export function AppEditorModal({ opened, app, onClose, onSubmit }: AppEditorModalProps) {
	const [name, setName] = useState("")
	const [html, setHtml] = useState("")
	const [icon, setIcon] = useState<string | null>(null)
	const [htmlFileName, setHtmlFileName] = useState<string | null>(null)

	useEffect(() => {
		if (opened) {
			setName(app?.name ?? "")
			setHtml(app?.html ?? "")
			setIcon(app?.icon ?? null)
			setHtmlFileName(null)
		}
	}, [opened, app])

	async function handleHtmlFile(file: File | null) {
		if (!file) {
			return
		}
		setHtml(await readFileAsText(file))
		setHtmlFileName(file.name)
		if (!name) {
			setName(file.name.replace(/\.html?$/i, ""))
		}
	}

	async function handleIconFile(file: File | null) {
		if (!file) {
			return
		}
		setIcon(await readFileAsDataUrl(file))
	}

	function handleSubmit() {
		onSubmit({ name: name.trim() || "Untitled", html, icon })
	}

	const previewApp: MiniApp = {
		id: "preview",
		name: name || "App",
		icon,
		html,
		source: "user",
		createdAt: 0,
	}

	return (
		<Modal opened={opened} onClose={onClose} title={app ? "Edit app" : "Install app"} centered>
			<Stack>
				<Group>
					<AppIcon app={previewApp} size={56} />
					<FileButton accept="image/*" onChange={handleIconFile}>
						{(buttonProps) => (
							<Button
								variant="light"
								leftSection={<IconPhoto size={16} />}
								{...buttonProps}
							>
								{icon ? "Change icon" : "Add icon"}
							</Button>
						)}
					</FileButton>
				</Group>

				<TextInput
					label="Name"
					value={name}
					onChange={(event) => setName(event.currentTarget.value)}
				/>

				<FileButton accept=".html,text/html" onChange={handleHtmlFile}>
					{(buttonProps) => (
						<Button
							variant="light"
							leftSection={<IconFileCode size={16} />}
							{...buttonProps}
						>
							{app ? "Replace HTML" : "Select HTML file"}
						</Button>
					)}
				</FileButton>
				<Text size="xs" c="dimmed">
					{htmlFileName ?? (html ? `${html.length} characters loaded` : "No HTML selected")}
				</Text>

				<Group justify="flex-end">
					<Button variant="default" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={!html}>
						{app ? "Save" : "Install"}
					</Button>
				</Group>
			</Stack>
		</Modal>
	)
}
