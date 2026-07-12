import { Avatar } from "@mantine/core"
import { MiniApp } from "./MiniApp"

type AppIconProps = {
	app: MiniApp
	size?: number
}

export function AppIcon({ app, size = 40 }: AppIconProps) {
	return (
		<Avatar src={app.icon ?? undefined} size={size} radius="sm" color="initials" name={app.name}>
			{app.name.slice(0, 2).toUpperCase()}
		</Avatar>
	)
}
