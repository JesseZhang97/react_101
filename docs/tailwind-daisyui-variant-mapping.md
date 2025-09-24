# Tailwind v4 + DaisyUI: Variant Mapping Guide

This document explains why dynamic class names like `btn btn-${variant}` break with Tailwind v4, and shows how to fix them using a mapping table that keeps all DaisyUI variant classes in your final CSS bundle.

## Problem Summary
- Symptom: Only `btn-error` renders correctly; `btn-neutral` and `btn-info` do not.
- Context: `Button` used `className={`btn btn-${variant}`}` with `variant` coming from props.

## Root Cause
- Tailwind v4 performs static scanning of class names. It only includes class names that appear as string literals in your source.
- Dynamic strings (template expressions like `btn-${variant}`) are not detected at build time, so Tailwind purges those classes.
- In this project, `btn-error` happened to exist elsewhere as a literal (`'btn-error'`), so it survived; others were purged.

## Fix: Variant Mapping Table
Instead of building class names dynamically, define a map from variants to literal DaisyUI classes and look them up by key.

### Minimal Implementation (used in this project)
```tsx
// Variant mapping kept in source so Tailwind sees the literal classes
const VARIANT_CLASS_MAP: Record<'neutral' | 'info' | 'error' | 'accent', string> = {
  neutral: 'btn-neutral',
  info: 'btn-info',
  error: 'btn-error',
  accent: 'btn-accent',
}

function Button({ variant = 'neutral', className, ...rest }: {
  variant?: 'neutral' | 'info' | 'error' | 'accent'
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variantClass = VARIANT_CLASS_MAP[variant]
  return (
    <button className={`btn ${variantClass} ${className || ''}`} {...rest} />
  )
}
```

## Safer, More Maintainable Variants
Use TypeScript helpers to make the mapping table type‑safe and easier to extend.

### 1) `as const` + `keyof typeof`
```tsx
export const VARIANT_CLASSES = {
  neutral: 'btn-neutral',
  info: 'btn-info',
  error: 'btn-error',
  accent: 'btn-accent',
} as const

export type ButtonVariant = keyof typeof VARIANT_CLASSES

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

function Button({ variant = 'neutral', className, ...rest }: ButtonProps) {
  const variantClass = VARIANT_CLASSES[variant]
  return (
    <button className={`btn ${variantClass} ${className || ''}`} {...rest} />
  )
}
```

### 2) `satisfies` to enforce completeness
```tsx
type ButtonVariant = 'neutral' | 'info' | 'error' | 'accent'

const VARIANT_CLASSES = {
  neutral: 'btn-neutral',
  info: 'btn-info',
  error: 'btn-error',
  accent: 'btn-accent',
} satisfies Record<ButtonVariant, string>
```
If a key is missing or misspelled, TypeScript will error.

### 3) Provide a fallback
```tsx
const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.neutral
```
Prevents empty classes if an unknown variant is used later.

## How To Add New Variants
1. Check DaisyUI for the variant class (e.g., `btn-success`, `btn-warning`, `btn-primary`).
2. Add the entry to the mapping:
```tsx
export const VARIANT_CLASSES = {
  neutral: 'btn-neutral',
  info: 'btn-info',
  error: 'btn-error',
  accent: 'btn-accent',
  // New:
  success: 'btn-success',
  warning: 'btn-warning',
  primary: 'btn-primary',
  secondary: 'btn-secondary',
} as const
```
3. Use it: `<Button variant="success">Save</Button>`.

## Common Pitfalls
- Dynamic templates (e.g., `btn-${variant}`) are not scanned by Tailwind v4; use mapping for finite sets.
- Remember the base class: use `btn` plus a variant (`btn btn-info`), not just `btn-info`.
- For numeric or unconstrained values, prefer fixed atomic classes or a safelist (see below).

## Advanced Tips
- Small class combiner to avoid stray spaces:
```ts
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}
// Usage: className={cn('btn', VARIANT_CLASSES[variant], className)}
```
- Combine size + intent with two maps:
```ts
const SIZE = { sm: 'btn-sm', md: 'btn-md', lg: 'btn-lg' } as const
const INTENT = { neutral: 'btn-neutral', info: 'btn-info', error: 'btn-error' } as const
className={cn('btn', SIZE[size], INTENT[variant])}
```

## Why Only `error` Worked Here
- `btn-error` existed as a string literal in another component, so Tailwind included it.
- Other variants only appeared via `btn-${variant}`, which Tailwind could not see and it purged them.
- After introducing the mapping table, all variant classes exist as literals and are included.

## Validation Steps
- Build: `npm run build`
- Inspect CSS: search in `dist/assets/*.css` for `btn-neutral|btn-info|btn-accent` to confirm they are present.
- Manual check: open the app and verify each variant renders correctly.

## Alternatives
- Safelist: you can safelist classes in Tailwind config so they are always included. Mapping is preferred in this repo to avoid extra config and keep types aligned with actual usage.
- CSS Modules/Inline styles: you lose DaisyUI system benefits; not recommended here.

## Appendix
- Current implementation lives in the Button component within the dashboard module.
- Related file: `src/component/dashboard.tsx`
