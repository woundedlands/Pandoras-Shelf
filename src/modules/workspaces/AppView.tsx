import { Text } from "@mantine/core"
import { memo } from "react"
import { Rect } from "./windowLayout"

type AppViewProps = {
	html: string | null
	title: string
	rect: Rect
	scale: number
	interactive: boolean
}

function toPercent(value: number): string {
	return `${value}%`
}

function AppViewComponent({ html, title, rect, scale, interactive }: AppViewProps) {
	return (
		<div
			style={{
				position: "absolute",
				left: toPercent(rect.left),
				top: toPercent(rect.top),
				width: toPercent(rect.width),
				height: toPercent(rect.height),
				padding: 2,
				overflow: "hidden",
				pointerEvents: interactive ? "auto" : "none",
			}}
		>
			{html === null ? (
				<Text c="dimmed" ta="center" mt="md">
					App not found
				</Text>
			) : (
				<iframe
					title={title}
					srcDoc={html}
					sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
					style={{
						width: `${100 / scale}%`,
						height: `${100 / scale}%`,
						transform: `scale(${scale})`,
						transformOrigin: "top left",
						border: "1px solid var(--mantine-color-default-border)",
						borderRadius: 8,
						background: "var(--mantine-color-body)",
					}}
				/>
			)}
		</div>
	)
}

function areEqual(previous: AppViewProps, next: AppViewProps): boolean {
	return (
		previous.html === next.html &&
		previous.interactive === next.interactive &&
		previous.scale === next.scale &&
		previous.rect.left === next.rect.left &&
		previous.rect.top === next.rect.top &&
		previous.rect.width === next.rect.width &&
		previous.rect.height === next.rect.height
	)
}

export const AppView = memo(AppViewComponent, areEqual)
