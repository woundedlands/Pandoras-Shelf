export const appThemes = ["light", "dark", "auto"] as const
export type AppTheme = (typeof appThemes)[number]
