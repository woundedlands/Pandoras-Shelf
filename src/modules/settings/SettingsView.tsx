import {
	ActionIcon,
	Button,
	Divider,
	Group,
	SegmentedControl,
	Stack,
	Switch,
	Text,
	Title,
} from "@mantine/core"
import { useMantineColorScheme } from "@mantine/core"
import { modals } from "@mantine/modals"
import { IconMinus, IconPlus, IconRotate2 } from "@tabler/icons-react"
import { appThemes } from "./AppTheme"
import { scaleStep, useSettingsStore } from "./useSettingsStore"

export function SettingsView() {
	const { setColorScheme } = useMantineColorScheme()
	const theme = useSettingsStore((state) => state.theme)
	const setTheme = useSettingsStore((state) => state.setTheme)
	const alwaysShowSidebar = useSettingsStore((state) => state.alwaysShowSidebar)
	const setAlwaysShowSidebar = useSettingsStore((state) => state.setAlwaysShowSidebar)
	const alwaysShowBorders = useSettingsStore((state) => state.alwaysShowBorders)
	const setAlwaysShowBorders = useSettingsStore((state) => state.setAlwaysShowBorders)
	const globalScale = useSettingsStore((state) => state.globalScale)
	const adjustGlobalScale = useSettingsStore((state) => state.adjustGlobalScale)
	const setGlobalScale = useSettingsStore((state) => state.setGlobalScale)
	const resetSettings = useSettingsStore((state) => state.resetSettings)

	function changeTheme(value: string) {
		const next = value as (typeof appThemes)[number]
		setTheme(next)
		setColorScheme(next)
	}

	function handleReset() {
		modals.openConfirmModal({
			title: "Reset settings",
			children: <Text size="sm">Restore all settings to their defaults?</Text>,
			labels: { confirm: "Reset", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => {
				resetSettings()
				setColorScheme("auto")
			},
		})
	}

	return (
		<Stack p="md" maw={520}>
			<Title order={3}>Settings</Title>

			<Stack gap={4}>
				<Text fw={600}>Theme</Text>
				<SegmentedControl
					value={theme}
					onChange={changeTheme}
					data={appThemes.map((value) => ({
						value,
						label: value.charAt(0).toUpperCase() + value.slice(1),
					}))}
				/>
			</Stack>

			<Divider />

			<Switch
				label="Always show sidebar"
				description="When off, the sidebar only appears on hover"
				checked={alwaysShowSidebar}
				onChange={(event) => setAlwaysShowSidebar(event.currentTarget.checked)}
			/>

			<Switch
				label="Always show window borders"
				description="When off, borders only appear on hover"
				checked={alwaysShowBorders}
				onChange={(event) => setAlwaysShowBorders(event.currentTarget.checked)}
			/>

			<Divider />

			<Stack gap={4}>
				<Text fw={600}>Global app scale</Text>
				<Text size="xs" c="dimmed">
					Applies to all mini apps. Also adjustable with Ctrl and +/-.
				</Text>
				<Group>
					<ActionIcon
						variant="light"
						onClick={() => adjustGlobalScale(-scaleStep)}
					>
						<IconMinus size={16} />
					</ActionIcon>
					<Text w={56} ta="center">
						{Math.round(globalScale * 100)}%
					</Text>
					<ActionIcon
						variant="light"
						onClick={() => adjustGlobalScale(scaleStep)}
					>
						<IconPlus size={16} />
					</ActionIcon>
					<Button variant="subtle" size="xs" onClick={() => setGlobalScale(1)}>
						Reset to 100%
					</Button>
				</Group>
			</Stack>

			<Divider />

			<Button
				variant="light"
				color="red"
				leftSection={<IconRotate2 size={16} />}
				onClick={handleReset}
				w="fit-content"
			>
				Reset settings
			</Button>
		</Stack>
	)
}
