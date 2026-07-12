import { createTheme, MantineProvider } from "@mantine/core"
import { ModalsProvider } from "@mantine/modals"
import "@mantine/core/styles.css"
import "./App.css"
import { useSettingsStore } from "./modules/settings/useSettingsStore"
import { Shell } from "./modules/shell/Shell"

const theme = createTheme({
	cursorType: "pointer",
	primaryColor: "brand",
	colors: {
		brand: [
			"#f2edff",
			"#ddd6fb",
			"#b8a9f0",
			"#927ae6",
			"#7252de",
			"#6643c2",
			"#5b3bc9",
			"#4b2eb0",
			"#42289d",
			"#37208a",
		],
	},
})

export function App() {
	const colorScheme = useSettingsStore((state) => state.theme)

	return (
		<MantineProvider theme={theme} defaultColorScheme={colorScheme}>
			<ModalsProvider>
				<Shell />
			</ModalsProvider>
		</MantineProvider>
	)
}
