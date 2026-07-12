import { CustomIconsRegistry } from "../icons/CustomIconsRegistry"
import { MiniApp } from "./MiniApp"

import diceRollerHtml from "./builtin/dice-roller.html?raw"
import calculatorHtml from "./builtin/calculator.html?raw"
import markdownEditorHtml from "./builtin/markdown-editor.html?raw"
import zipTextMergerHtml from "./builtin/zip-text-merger.html?raw"

export const builtinApps: MiniApp[] = [
	{
		id: "builtin-dice-roller",
		name: "Dice Roller",
		icon: CustomIconsRegistry.d20,
		html: diceRollerHtml,
		source: "builtin",
		createdAt: 0,
	},
	{
		id: "builtin-calculator",
		name: "Calculator",
		icon: CustomIconsRegistry.calculator,
		html: calculatorHtml,
		source: "builtin",
		createdAt: 0,
	},
	{
		id: "builtin-markdown-editor",
		name: "Markdown Editor",
		icon: CustomIconsRegistry.markdown,
		html: markdownEditorHtml,
		source: "builtin",
		createdAt: 0,
	},
	{
		id: "builtin-zip-text-merge",
		name: "Zip Text Merger (ZIP -> MD/TXT)",
		icon: CustomIconsRegistry.merge,
		html: zipTextMergerHtml,
		source: "builtin",
		createdAt: 0,
	},
]
