---
name: code-style
description: Code style for the project. This skill contains code style rules and project structure. Use when reading, creating, refactoring project code.
---

# Code style

## Rules

1. PascalCase for types, interfaces, class definition, methods, react components
2. camelCase for variables, non tsx functions
3. Use double quotes "" for regular strings, `` (backticks) when you need use templating
4. Avoid unnecessary semicolon
5. Use trailing comma in typescript arrays and objects
6. Prefer type over interface
7. Prefer union type over enums. You can create them using array: `const colors = ["red","blue",] as const; type Color = typeof colors[number]`
8. Skip default public access modifier for classes
9. Don't use switch, when switch logic needed prefer object or "if else if"
10. Name entities meaningful, no shortcuts like ctx, x, i are allowed. If its generic index name it index
11. Always use braces in "if" statements to edit them easily
12. Prefer function over const with lambda when you don't need IIFE. lambda is allowed if used as delegate, callback or predicate
13. Don't comment obvious things which can be understood by looking at the name.
14. Strip comments which are no longer relevant
15. Comment for unobvious domain logic requirements, so it understandable why it does what it does.
16. When you see logic repeating multiple times - its a good sign that it could be moved inside separate method or/and file. Not always though, if it really complicates mental model, sometimes better to keep coupled logic in one place to keep flow simple. Make a weighted decision
17. default exports are not allowed or used in codebase
18. Don't overengineer solutions, keep implementation robust and easy to understand and maintain. Prefer simplicity and most obvious way of implementation. It does apply to the implementation, not the domain logic which is its own thing and should not be inherently simplified because of this rule
19. Main rule - common sense. Your goal is to achieve result best way possible to satisfy the domain requirements

## Structure

Project files are located inside src.

`src/main.tsx` - entry, it uses `App.tsx` component. When you need to modify entry logic - modify `App.tsx`, avoid modifying `main.tsx` without strong reason

### Modules

`src/modules` - is a folder for modules. Modules folders are named in kebab-case. You can create modules when needed. No special structure, just folders grouped by common theme
`src/modules/lib` - non ui common typescript code. Usually helpful function, classes which have no domain logic
`src/modules/ui` - common ui elements which do not fit into specific modules

### File naming

When creating/renaming file:

0. Main rule - match the name of the file with its main part, if it has no main part (for example its set of functions) - name it with common theme
1. Name React components in PascalCase.tsx
2. When its regular typescript - name the file as the main export: useSettingsStore.ts - it means that this file main function is useSettingsStore. If its a class - MyClass.ts. If its a type - MyType.ts
3. When its regular typescript and you cannot determine its main export - name it in kebab-case.ts. For example if its set of functions based on same theme

## Libraries

Zustand: is used for state management. You can read `src/modules/settings/useSettingsStore.ts` as reference
Mantine: is used for common ui elements, most of its modules are installed
@tabler/icons-react: is used for common icons
react-jss is used for styles
