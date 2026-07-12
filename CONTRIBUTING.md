# Contributing

Thanks for your interest in Pandora's Shelf. This guide covers the tech stack, project setup, and build process.

## Tech Stack

- [React](https://react.dev/)
- [Mantine](https://mantine.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [react-jss](https://cssinjs.org/react-jss/)
- [Tabler Icons](https://tabler.io/icons)
- [Tauri](https://tauri.app/) (desktop shell, using the system webview)
- [Vite](https://vite.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict mode)

## Platforms

The app is built to run in three ways:

- **Desktop (Windows exe)** — a native standalone executable built with Tauri.
- **Standalone HTML** — a single self-contained HTML file.
- **GitHub Pages** — the web build deployed online.

## Project Structure

- `src` — entry point.
- `src/modules` — feature modules, each in its own folder.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/) and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) (only for desktop builds)

## Setup

```bash
npm install
```

## Development

Run the web app in the browser:

```bash
npm run dev
```

Run the desktop app:

```bash
npm run dev-desktop
```

## Build

Build the web app (standalone HTML / GitHub Pages):

```bash
npm run build
```

Build the desktop executable:

```bash
npm run build-desktop
```
