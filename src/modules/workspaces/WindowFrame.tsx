import { ActionIcon, Group, Menu, Text } from "@mantine/core"
import {
	IconGripVertical,
	IconMinus,
	IconPlus,
	IconRefresh,
	IconReplace,
	IconX,
	IconZoomReset,
} from "@tabler/icons-react"
import { createUseStyles } from "react-jss"
import { SplitDirection, SplitSide } from "./WindowNode"
import { Rect } from "./windowLayout"

const borderThickness = 20

type BorderPosition = "top" | "bottom" | "left" | "right"

const borderSides: Record<BorderPosition, { direction: SplitDirection; side: SplitSide }> = {
	top: { direction: "column", side: "start" },
	bottom: { direction: "column", side: "end" },
	left: { direction: "row", side: "start" },
	right: { direction: "row", side: "end" },
}

const useStyles = createUseStyles({
	frame: {
		position: "absolute",
		pointerEvents: "none",
		zIndex: 5,
	},
	border: {
		position: "absolute",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		pointerEvents: "auto",
		opacity: 0,
		transition: "opacity 120ms ease",
		background: "var(--mantine-color-default-hover)",
		"@media (hover: hover)": {
			"$frame:hover &": {
				opacity: 1,
			},
		},
	},
	alwaysVisible: {
		opacity: 1,
	},
})

type WindowFrameProps = {
	rect: Rect
	leafId: string
	scale: number
	alwaysShowBorders: boolean
	onSplit(direction: SplitDirection, side: SplitSide): void
	onReplace(): void
	onRefresh(): void
	onRemove(): void
	onScale(scale: number): void
	onDragStart(event: React.PointerEvent): void
}

function percent(value: number): string {
	return `${value}%`
}

export function WindowFrame(props: WindowFrameProps) {
	const styles = useStyles()

	function renderBorder(position: BorderPosition, style: React.CSSProperties) {
		const config = borderSides[position]
		return (
			<div
				className={`${styles.border} ${props.alwaysShowBorders ? styles.alwaysVisible : ""}`}
				style={style}
				onPointerDown={(event) => {
					if (event.button === 0) {
						props.onDragStart(event)
					}
				}}
			>
				<Menu position="bottom" withArrow shadow="md" width={190}>
					<Menu.Target>
						<ActionIcon
							variant="light"
							size="sm"
							onPointerDown={(event) => event.stopPropagation()}
						>
							<IconGripVertical size={14} />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item
							leftSection={<IconPlus size={14} />}
							onClick={() => props.onSplit(config.direction, config.side)}
						>
							Add app here
						</Menu.Item>
						<Menu.Item leftSection={<IconReplace size={14} />} onClick={props.onReplace}>
							Replace with...
						</Menu.Item>
						<Menu.Item leftSection={<IconRefresh size={14} />} onClick={props.onRefresh}>
							Refresh window
						</Menu.Item>
						<Menu.Divider />
						<Group gap={4} px="xs" py={4} wrap="nowrap" justify="center">
							<ActionIcon
								variant="subtle"
								size="sm"
								aria-label="Decrease scale"
								onClick={() => props.onScale(props.scale - 0.05)}
							>
								<IconMinus size={14} />
							</ActionIcon>
							<Text size="xs" style={{ whiteSpace: "nowrap" }}>
								Scale: {Math.round(props.scale * 100)}%
							</Text>
							<ActionIcon
								variant="subtle"
								size="sm"
								aria-label="Reset scale"
								onClick={() => props.onScale(1)}
							>
								<IconZoomReset size={14} />
							</ActionIcon>
							<ActionIcon
								variant="subtle"
								size="sm"
								aria-label="Increase scale"
								onClick={() => props.onScale(props.scale + 0.05)}
							>
								<IconPlus size={14} />
							</ActionIcon>
						</Group>
						<Menu.Divider />
						<Menu.Item
							color="red"
							leftSection={<IconX size={14} />}
							onClick={props.onRemove}
						>
							Remove window
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</div>
		)
	}

	return (
		<div
			className={styles.frame}
			style={{
				left: percent(props.rect.left),
				top: percent(props.rect.top),
				width: percent(props.rect.width),
				height: percent(props.rect.height),
			}}
		>
			{renderBorder("top", { top: 0, left: 0, right: 0, height: borderThickness })}
			{renderBorder("bottom", { bottom: 0, left: 0, right: 0, height: borderThickness })}
			{renderBorder("left", {
				top: borderThickness,
				bottom: borderThickness,
				left: 0,
				width: borderThickness,
			})}
			{renderBorder("right", {
				top: borderThickness,
				bottom: borderThickness,
				right: 0,
				width: borderThickness,
			})}
		</div>
	)
}
