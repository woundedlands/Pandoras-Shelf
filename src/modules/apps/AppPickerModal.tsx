import { Modal, SimpleGrid, Text, TextInput, UnstyledButton } from "@mantine/core"
import { IconSearch } from "@tabler/icons-react"
import { useMemo, useState } from "react"
import { createUseStyles } from "react-jss"
import { useAppPickerStore } from "./useAppPickerStore"
import { useAppsStore } from "./useAppsStore"
import { builtinApps } from "./builtinApps"
import { AppIcon } from "./AppIcon"

const useStyles = createUseStyles({
	tile: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: 6,
		padding: 10,
		borderRadius: 8,
		"&:hover": {
			background: "var(--mantine-color-default-hover)",
		},
	},
})

export function AppPickerModal() {
	const styles = useStyles()
	const open = useAppPickerStore((state) => state.open)
	const pick = useAppPickerStore((state) => state.pick)
	const close = useAppPickerStore((state) => state.close)
	const userApps = useAppsStore((state) => state.userApps)
	const [query, setQuery] = useState("")

	const apps = useMemo(() => {
		const all = [...builtinApps, ...userApps]
		const search = query.trim().toLowerCase()
		if (!search) {
			return all
		}
		return all.filter((app) => app.name.toLowerCase().includes(search))
	}, [userApps, query])

	return (
		<Modal opened={open} onClose={close} title="Choose an app" centered size="lg">
			<TextInput
				placeholder="Search apps"
				leftSection={<IconSearch size={16} />}
				value={query}
				onChange={(event) => setQuery(event.currentTarget.value)}
				mb="md"
			/>
			{apps.length === 0 ? (
				<Text c="dimmed" ta="center" py="xl">
					No apps yet. Install apps first.
				</Text>
			) : (
				<SimpleGrid cols={{ base: 3, sm: 4, md: 5 }}>
					{apps.map((app) => (
						<UnstyledButton
							key={app.id}
							className={styles.tile}
							onClick={() => pick(app.id)}
						>
							<AppIcon app={app} />
							<Text size="xs" ta="center" lineClamp={2}>
								{app.name}
							</Text>
						</UnstyledButton>
					))}
				</SimpleGrid>
			)}
		</Modal>
	)
}
