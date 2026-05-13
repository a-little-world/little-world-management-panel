# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm run start        # webpack watch (dev, hot reload via Docker volume)
npm run build        # production build
npx tsc --noEmit     # type-check without emitting — run before declaring done
```

---

## Design System First

Always check `@a-little-world/little-world-design-system` before writing a new component.
Source lives at `../../../little-world-design-system/packages/web/src/components/` (sibling repo).

**How to find a fitting component:**
1. Read `packages/web/src/index.ts` for all exports.
2. Read `packages/web/src/components/<Name>/<Name>.tsx` for implementation.
3. Read `packages/core/src/types/<Name>.ts` for the prop interface.
4. If a component exists but needs tweaks, extend it: `styled(DSComponent)`.

**Available components (non-exhaustive):**
`Button` · `Dropdown` · `Tag` · `Text` · `Loading` · `Modal` · `Card` · `Tabs` · `MultiCheckbox` · `Checkbox` · `Switch` · `RadioGroup` · `TextInput` · `Label` · `Tooltip` · `Popover` · `Separator` · `NavigationMenu` · `Toast`

When no DS component fits, create a local **styled-component** (layout/atoms) or a **React function component** (when it has internal state or composition).

---

## Styling Rules

**All CSS must live in `styled-components`. Inline `style={{}}` props are forbidden.**

```tsx
// ✗ wrong
<div style={{ color: 'red', padding: 16 }}>...</div>

// ✓ correct
const Box = styled.div`
  color: red;
  padding: ${({ theme }) => theme.spacing.small};
`;
```

Use `theme` tokens wherever possible:
- `theme.color.surface.*` · `theme.color.text.*` · `theme.color.border.*` · `theme.color.gradient.*`
- `theme.spacing.{xxxxsmall … massive}`
- `theme.radius.{xxxsmall … full}`
- `theme.breakpoints.{xsmall … xxlarge}`
- `theme.zIndex.*`

Font families are **not** in the theme — hardcode them:
- Headings: `'Work Sans', system-ui, sans-serif`
- Body: `'Signika Negative', system-ui, sans-serif`
- Mono: `source-code-pro, Menlo, Monaco, monospace`

---

## Reference Files for Common Patterns

| Need | Reference |
|---|---|
| Table page with filters | `src/components/views/Users.tsx` |
| Table page with dropdowns | `src/components/views/Matches.tsx` |
| Support task table page | `src/components/views/SupportTasksOverview.tsx` |
| Layout / navigation | `src/components/blocks/Layout.tsx`, `Header.tsx`, `Menu.tsx` |
| Filter modal | `src/components/blocks/Filters.tsx`, `src/components/blocks/SupportTaskFilters.tsx` |
| Toolbar with search/pagination | `src/components/blocks/FiltersToolbar.tsx` |
| Data table | `src/components/blocks/DataTable.tsx` |
| Download settings modal | `src/components/blocks/DownloadSettingsModal.tsx` |
| User avatar/image | `src/components/atoms/UserImage.tsx` |

---

## Table Pages — Required Pattern

| Requirement | Implementation |
|---|---|
| Column definitions | `createColumnHelper` + `ColumnDef<T, any>[]` from `@tanstack/react-table` |
| Table rendering | `<DataTable columns={...} data={...} />` |
| Filter/sort/page state | `useSearchParams` from `react-router-dom` |
| Toolbar | `<FiltersToolbar>` with `<Dropdown>` children for sort/filter |
| Filter modal | Per-page `*Filters.tsx` component (see below) |
| Export | `<DownloadSettingsModal>` |
| Status / type pills | `<Tag appearance={TagAppearance.outline} color={...}>` |
| User avatars | `<UserImage>` — not custom avatar circles |

**`Dropdown` options must never use `value: ''`** — Radix Select forbids empty strings. Use a named sentinel (e.g. `'ALL'`) and convert to `undefined` before passing to the API.

---

## Filter Modals

Each page owns its own `*Filters.tsx` in `src/components/blocks/`. Follow this structure:

```tsx
<Modal open={open} onClose={onClose}>
  <Card width={CardSizes.Large}>
    <CardHeader>Filters</CardHeader>
    <CardContent align="flex-start">
      {/* Dropdown / MultiCheckbox / Switch rows */}
    </CardContent>
    <CardFooter align="space-between">
      <Button variation={ButtonVariations.Inline} onClick={handleReset}>Clear all</Button>
      <Button onClick={onClose}>Show results</Button>
    </CardFooter>
  </Card>
</Modal>
```

Export a `contains*FilterKey(filters)` helper keyed to that page's own filter keys, and pass it to `FiltersToolbar`'s `filtersActive` prop.

---

## Routing

1. Add constants to `src/routes.ts`: a `ROUTE_NAME` constant and a `getRouteNameRoute(id)` helper for parameterised routes.
2. Register in `src/App.tsx` under the `<Root withLayout />` parent.
3. Add a nav entry in `src/components/blocks/Menu.tsx`.

---

## Building a New Page — Checklist

1. Read design system exports (`packages/web/src/index.ts`) to inventory available components.
2. Read comparable pages (`Users.tsx`, `Matches.tsx`) for the exact patterns in use.
3. Read the prop interfaces of every DS component you plan to use.
4. Read shared blocks (`FiltersToolbar`, `DataTable`, `DownloadSettingsModal`) before writing your own.
5. Map each design element to a DS component first; fall back to styled-components.
6. Use theme tokens throughout; hardcode only font families.
7. Run `npx tsc --noEmit` — no type errors before the task is done.
