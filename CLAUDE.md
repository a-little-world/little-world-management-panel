# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
pnpm run start        # webpack watch (dev, hot reload via Docker volume)
pnpm run build        # production build
pnpm exec tsc --noEmit     # type-check without emitting — run before declaring done
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

**Available DS components (non-exhaustive):**
`Button` · `Select` · `Tag` · `Text` · `Loading` · `Modal` · `Card` · `Tabs` · `CheckboxGroup` · `Checkbox` · `Switch` · `RadioGroup` · `TextInput` · `Label` · `Tooltip` · `Popover` · `Separator` · `NavigationMenu` · `Toast`

**Local atoms (check before writing new ones):**
`src/components/atoms/Card.tsx` — `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` — use for page panel cards
`src/components/atoms/UserImage.tsx` — user avatars, always use this, never custom avatar circles

**Component folder structure (`src/components/`):**

- `atoms/` — simple, single-purpose components. Building blocks used everywhere.
- `blocks/` — composite components built from atoms (e.g. `FiltersToolbar`, `DataTable`, `ObjectHistory`).
- `views/` — full pages (e.g. `Users.tsx`, `SupportTasksOverview.tsx`).

**Component reuse rules (in priority order):**

1. DS component
2. Existing local component in `atoms/` or `blocks/`
3. New shared component — add to `atoms/` if self-contained, `blocks/` if it composes others
4. Inline styled-component inside a view — **last resort only**

When creating a new component, ask: could this be used elsewhere? If yes, save it in `atoms/` or `blocks/` rather than inline in the view.

---

## Styling Rules

**All CSS must live in `styled-components`. Inline `style={{}}` props are forbidden.**

```tsx
// ✗ wrong
<div style={{ color: 'red', padding: 16 }}>...</div>;

// ✓ correct
const Box = styled.div`
  color: ${({ theme }) => theme.color.text.primary};
  padding: ${({ theme }) => theme.spacing.small};
`;
```

Use `theme` tokens for all colors, spacing, radii, and z-index — **no hard-coded values**:

- `theme.color.surface.*` · `theme.color.text.*` · `theme.color.border.*` · `theme.color.gradient.*`
- `theme.spacing.{xxxxsmall … massive}`
- `theme.radius.{xxxsmall … full}`
- `theme.breakpoints.{xsmall … xxlarge}`
- `theme.zIndex.*`

**Spacing token map** (use these, never raw px):

| px   | token                    |
| ---- | ------------------------ |
| 4px  | `theme.spacing.xxxsmall` |
| 8px  | `theme.spacing.xxsmall`  |
| 12px | `theme.spacing.xsmall`   |
| 16px | `theme.spacing.small`    |
| 24px | `theme.spacing.medium`   |
| 32px | `theme.spacing.large`    |
| 40px | `theme.spacing.xlarge`   |
| 64px | `theme.spacing.xxlarge`  |

**Radius token map:**

| px   | token                   |
| ---- | ----------------------- |
| 4px  | `theme.radius.xxxsmall` |
| 8px  | `theme.radius.xxsmall`  |
| 12px | `theme.radius.xsmall`   |
| 16px | `theme.radius.small`    |
| 20px | `theme.radius.medium`   |
| 24px | `theme.radius.large`    |

**No hard-coded colors.** The theme has no brand color tokens, so those live in `src/constants.ts` as named exports — never as anonymous hex literals in components:

```tsx
// ✗ wrong — anonymous hex inside a component
const Title = styled.h2`
  color: #db590b;
`;
const Dot = <InitialsDot $bg="#cfe3f8" />;

// ✓ correct — named constant from constants.ts
import { ORANGE_40, BLUE_10 } from '../../constants';
const Title = styled.h2`
  color: ${ORANGE_40};
`;
const Dot = <InitialsDot $bg={AVATAR_BLUE_BG} />;
```

**Font sizes and font families cannot use theme tokens** (the theme has no typography scale). Use the DS `Text` component instead — see below. Only create a custom styled heading when no `TextTypes` variant fits (e.g. a 36px page title).

---

## Text — Use the DS `Text` Component

Prefer `<Text>` from the DS over custom styled `div`/`span`/`p` elements for any display text.

```tsx
import { Text, TextTypes } from '@a-little-world/little-world-design-system';

// type controls font size (Body7 ≈ 12px … Body1 ≈ 32px+, Heading6 … Heading1)
// bold, color, center, tag are all props
<Text type={TextTypes.Body6} bold color={ORANGE_40} tag="span">Name</Text>
<Text type={TextTypes.Body7}>Subtitle</Text>
<Text center>Centered paragraph</Text>
```

**TextTypes size reference** (approximate at 16px root):

| type     | size      |
| -------- | --------- |
| Body7    | 12px      |
| Body6    | 14px      |
| Body5    | 16px      |
| Body4    | 20px      |
| Body3    | 24px      |
| Heading6 | 16px bold |
| Heading5 | 24px bold |

**`styled(Text)` pattern** — extend `Text` when you need additional CSS that can't be expressed via props (e.g. `text-transform`, `letter-spacing`, theme colors):

```tsx
const MetaLabel = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.color.text.tertiary};
  font-weight: 600;
`;
```

`Text` accepts `className` and can be extended with `styled()`. Use `.attrs()` to lock in default props so call sites stay clean.

---

## Minimize Styled Components

**Not everything needs a styled component.** Plain `<Text>`, `<Card>`, native HTML, and DS components are preferred. Create a styled component only when:

- You need a layout container (`display: flex`, `display: grid`, `position`, etc.)
- You need conditional CSS based on props
- You need theme-token-based values that can't come from component props

```tsx
// ✗ wrong — styled component for a text element that could just be <Text>
const UserEmail = styled.div`font-size: 13px; color: ${...secondary};`;
<UserEmail>{email}</UserEmail>

// ✓ correct — plain DS component
<Text type={TextTypes.Body7} tag="div">{email}</Text>
```

**Avoid `& + &` sibling margin hacks** for stacking. Use a flex container with `gap` instead:

```tsx
// ✗ wrong
const Card = styled.div`
  & + & {
    margin-top: 20px;
  }
`;

// ✓ correct
const SideColumn = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;
```

---

## Color Constants

Brand colors and semantic display colors are defined in `src/constants.ts`. Import from there — never redeclare in a component file.

**Available constants:**

```ts
// Brand palette
(BLUE_10, BLUE_40, ORANGE_10, ORANGE_40, GREEN_10, GREEN_40);

// Task display colors
(GRAY_40, RED_40, CRIMSON_40, AMBER_40, MAROON_40, PURPLE_40);

// ObjectHistory local constants (defined in ObjectHistory.tsx, not shared)
(DIFF_OLD_BG,
  DIFF_NEW_BG,
  AVATAR_BLUE_BG,
  AVATAR_NEUTRAL_BG,
  AVATAR_NEUTRAL_COLOR);
```

---

## Shared Display Configs (Support Tasks)

`STATUS_CONFIG`, `PRIORITY_CONFIG`, `ACTION_TYPE_CONFIG`, and `getActionTypeConfig` are the single source of truth for task display metadata (labels + colors). They live in `src/api/supportTasks.ts`. **Never redefine them in a view or filter component.**

Derive select options from the configs — don't re-declare labels:

```tsx
// ✓ correct — derived, labels stay in sync automatically
const PRIORITY_OPTIONS = Object.entries(PRIORITY_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

// ✗ wrong — duplicate labels that will diverge
const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  ...
];
```

---

## Reference Files for Common Patterns

| Need                           | Reference                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| Table page with filters        | `src/components/views/Users.tsx`                                                    |
| Table page with dropdowns      | `src/components/views/Matches.tsx`                                                  |
| Support task table page        | `src/components/views/SupportTasksOverview.tsx`                                     |
| Detail / single-record page    | `src/components/views/SupportTaskDetail.tsx`                                        |
| Layout / navigation            | `src/components/blocks/Layout.tsx`, `Header.tsx`, `Menu.tsx`                        |
| Filter modal                   | `src/components/blocks/Filters.tsx`, `src/components/blocks/SupportTaskFilters.tsx` |
| Toolbar with search/pagination | `src/components/blocks/FiltersToolbar.tsx`                                          |
| Data table                     | `src/components/blocks/DataTable.tsx`                                               |
| Download settings modal        | `src/components/blocks/DownloadSettingsModal.tsx`                                   |
| Page panel cards               | `src/components/atoms/Card.tsx`                                                     |
| Timeline / change history      | `src/components/blocks/ObjectHistory.tsx`                                           |
| User avatar/image              | `src/components/atoms/UserImage.tsx`                                                |

---

## Table Pages — Required Pattern

| Requirement            | Implementation                                                            |
| ---------------------- | ------------------------------------------------------------------------- |
| Column definitions     | `createColumnHelper` + `ColumnDef<T, any>[]` from `@tanstack/react-table` |
| Table rendering        | `<DataTable columns={...} data={...} />`                                  |
| Filter/sort/page state | `useSearchParams` from `react-router-dom`                                 |
| Toolbar                | `<FiltersToolbar>` with `<Select>` children for sort/filter               |
| Filter modal           | Per-page `*Filters.tsx` component (see below)                             |
| Export                 | `<DownloadSettingsModal>`                                                 |
| Status / type pills    | `<Tag appearance={TagAppearance.outline} color={...}>`                    |
| User avatars           | `<UserImage>` — not custom avatar circles                                 |
| Column text            | `<Text type={TextTypes.Body6} tag="span">` — not custom styled spans      |

**`Select` options must never use `value: ''`** — Radix Select forbids empty strings. Use a named sentinel (e.g. `'ALL'`) and convert to `undefined` before passing to the API.

---

## Filter Modals

Each page owns its own `*Filters.tsx` in `src/components/blocks/`. Follow this structure:

```tsx
<Modal open={open} onClose={onClose}>
  <Card width={CardSizes.Large}>
    <CardHeader>Filters</CardHeader>
    <CardContent align="flex-start">
      {/* Select / CheckboxGroup / Switch rows */}
    </CardContent>
    <CardFooter align="space-between">
      <Button variation={ButtonVariations.Inline} onClick={handleReset}>
        Clear all
      </Button>
      <Button onClick={onClose}>Show results</Button>
    </CardFooter>
  </Card>
</Modal>
```

Export a `contains*FilterKey(filters)` helper keyed to that page's own filter keys, and pass it to `FiltersToolbar`'s `filtersActive` prop.

Filter options (priority, action type, etc.) must be derived from the shared configs in `supportTasks.ts` — see **Shared Display Configs** above.

---

## Routing

1. Add constants to `src/routes.ts`: a `ROUTE_NAME` constant and a `getRouteNameRoute(id)` helper for parameterised routes.
2. Register in `src/App.tsx` under the `<Root withLayout />` parent.
3. Add a nav entry in `src/components/blocks/Menu.tsx`.

---

## Building a New Page — Checklist

1. Read design system exports (`packages/web/src/index.ts`) to inventory available components.
2. Read comparable pages (`Users.tsx`, `Matches.tsx`, `SupportTaskDetail.tsx`) for the exact patterns in use.
3. Read the prop interfaces of every DS component you plan to use.
4. Read `src/components/atoms/` and `src/components/blocks/` for reusable local components before writing new ones.
5. Map each design element: DS component → existing local atom/block → new shared component → inline styled-component.
6. New components that could be reused go in `atoms/` or `blocks/`, not inline in the view.
7. Use `Text` + `TextTypes` for all text. Use `styled(Text).attrs(...)` when extra CSS is needed.
8. Use theme spacing/radius tokens — refer to the token maps above.
9. Import brand colors from `src/constants.ts`. No anonymous hex literals.
10. Keep styled-component count low — if a plain `<Text>` or `<div>` works, use it.
11. Run `pnpm exec tsc --noEmit` — no type errors before the task is done.
