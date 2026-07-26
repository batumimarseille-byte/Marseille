# Hotel Marseille Design System

This document defines the visual system for the Hotel Marseille dashboard. It is based on the calmer internal-tool style developed for Mersel Restaurant, adapted for hotel check-in, rooms, stays, payments, and calendar work.

The goal is not a landing page or a decorative hotel site. The product should feel like a private, serious, elegant admin tool: clean, quiet, fast to scan, and comfortable for daily use.

## Direction

- Light interface with a soft blue-gray background.
- White panels and cards with clear borders.
- Blue as the main action and active-state color.
- Gold only for the Hotel Marseille brand mark/logo, not as a general UI accent.
- Compact controls and dense information layout.
- No glassmorphism, heavy gradients, floating decorative shapes, or oversized marketing typography.
- No card lifting on hover. Hover should be calm: border, background, or icon color change only.
- Use consistent 8px radius for UI cards, buttons, inputs, table rows, and icon frames unless a component has a strong reason to differ.

## Design Tokens

```css
:root {
  color-scheme: light;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;

  --bg: #f6f8fb;
  --surface: #ffffff;
  --surface-muted: #f8fafc;
  --border: #e2e8f0;
  --border-strong: #cbd5e1;

  --text-strong: #0f172a;
  --text-main: #334155;
  --text-soft: #64748b;

  --blue: #2563eb;
  --blue-hover: #1d4ed8;
  --blue-active: #1e40af;
  --blue-soft: #eff6ff;

  --green-soft: #ecfdf5;
  --green: #047857;
  --red-soft: #fef2f2;
  --red: #b91c1c;
  --amber-soft: #fffbeb;
  --amber: #b45309;

  --focus-ring: rgba(37, 99, 235, 0.16);
  --shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-sm: 0 4px 10px rgba(15, 23, 42, 0.07);
  --ease-out: 160ms ease;
}
```

## Typography

- Primary font: Inter/system sans-serif.
- Do not use negative letter spacing.
- Eyebrows: uppercase, 0 letter spacing, `0.75rem`, strong weight, muted color.
- Page titles: strong, clear, not hero-sized inside app surfaces.
- Panel titles: around `1.2rem`.
- Table and form labels: compact, readable, strong enough for scanning.

Recommended scale:

```css
h1 { font-size: 1.45rem; line-height: 1.1; }
.page-title { font-size: 2.25rem; line-height: 1.08; }
.panel-title { font-size: 1.2rem; line-height: 1.25; }
.body { font-size: 0.9rem; }
.caption { font-size: 0.78rem; }
```

## Layout

### App Shell

- Sidebar width: `260px`.
- Sidebar can later support a compact icon-only state, but should not expand beyond the designed width.
- Main content padding: `28px 30px 36px` on desktop, tighter on mobile.
- Page sections should be unframed layouts or white panels, not nested cards.

### Sidebar

Sidebar should match the restaurant system:

- White background.
- Right border: `1px solid var(--border)`.
- Brand block with bottom divider.
- Equal vertical rhythm: top to logo, logo to divider, divider to first nav item.
- Navigation items use icon frames with borders.
- Active item: light background, blue icon frame.
- Hover: soft background and border only.

Do not use pill navigation or gradient active states.

### Panels

Use panels for primary work areas:

```css
.panel {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow-xs);
  padding: 20px;
}
```

Panel headers:

- Left side: eyebrow and title.
- Right side: actions.
- Keep actions compact.
- Do not add explanatory marketing text inside headers.

## Components

### Buttons

All buttons use `8px` radius, not pills.

Primary:

- Blue background.
- White text.
- Hover: darker blue, slight shadow.
- Active: darker blue, no shadow, small press feedback.

Secondary/ghost:

- White background.
- Border.
- Muted text.
- Hover: `#f8fafc`, stronger border.

Icon-only buttons:

- Fixed size.
- Icon centered.
- Tooltip/title for meaning.
- Prefer Lucide-style symbols.

Avoid button hover lift for this product.

### Icon Frames

Use framed icons in sidebar, metric cards, report cards, and action controls:

```css
.icon-frame {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-muted);
  color: var(--text-soft);
}
```

Active icon:

```css
.is-active .icon-frame {
  border-color: var(--blue);
  background: var(--blue);
  color: #ffffff;
}
```

### Cards

Cards should be calm and data-focused:

- White surface.
- 8px radius.
- 1px border.
- `shadow-xs`.
- No hover translation.
- Hover may use stronger border and muted background.

Metric cards follow:

- Icon frame at top.
- Uppercase metric label.
- Large value.
- Small supporting text.

### Forms

Forms are compact work surfaces:

- Labels above fields.
- Inputs `42px` min height.
- 8px radius.
- White background.
- Border focus with blue ring.
- Select arrows should be custom and aligned.
- Do not use browser-default select styling.

For long forms, use grid columns on desktop and one column on mobile.

### Tables

Tables are for repeated admin work:

- Header row with muted uppercase text.
- Clear row separators.
- Numeric columns right aligned.
- Row actions use icon-only buttons where possible.
- Sticky first column is acceptable on narrow screens.
- Inline editors should open near the row being edited when context matters.

### Badges

Use badges for statuses and reasons:

- Green: paid, active, available, success.
- Red: debt, cancelled, delete, destructive state.
- Amber: warning, partial payment, attention.
- Blue/neutral: informational states.

Badges should not dominate rows.

## Hotel-Specific Patterns

### Room Cards

Room cards should feel like inventory/status cards:

- White base card.
- Status shown with small badge or soft tinted state.
- Room number strong.
- Room type and price muted.
- Avoid large color-filled cards unless status must be urgent.

### Stay Records

Stay rows/cards should prioritize:

1. Guest name.
2. Room number/type.
3. Check-in/check-out dates.
4. Payment status and debt.
5. Actions.

Actions should be icon-first and compact.

### Calendar

Calendar should be operational:

- Dense grid.
- Strong today marker.
- Clear occupied blocks.
- Muted unavailable/empty cells.
- No decorative gradients.
- Booking colors can remain, but should sit within a restrained palette.

### Language Toggle

The language toggle can remain visual with flags, but should behave like a small icon control:

- Fixed square or circular hit area.
- No lift on hover.
- Soft border or shadow only if needed.

## Interaction States

Use these states consistently:

```css
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 0;
  box-shadow: 0 0 0 3px var(--focus-ring);
}

.interactive:hover {
  border-color: var(--border-strong);
  background: #f8fafc;
}

.interactive:active {
  background: #f1f5f9;
  box-shadow: none;
}
```

Do not use hover `translateY` for cards, nav items, stat cards, or report cards.

## Responsive Rules

- Desktop: sidebar + content grid.
- Tablet: sidebar can be narrower; content grids reduce to 2 columns.
- Mobile: sidebar becomes top navigation or drawer; content is one column.
- Buttons in topbars can become equal-width grid controls on mobile.
- Tables should scroll horizontally when needed.
- Text must never overlap buttons, badges, or adjacent columns.

## Migration Notes

When applying this design system to the existing Hotel Marseille code later:

1. Replace old CSS variables with the token set above.
2. Remove gradient page backgrounds and glass panel styling.
3. Change large radii and pill controls to 8px.
4. Remove hover lift from buttons/cards/stat cards.
5. Align sidebar navigation with framed icons and active blue icon state.
6. Convert metric cards, room cards, panels, forms, and tables to the same border/surface system.
7. Keep the current hotel logic untouched while changing CSS in small steps.

## Do Not Change

- Do not change business logic while applying visual polish.
- Do not change Supabase behavior.
- Do not change localStorage keys.
- Do not rename hotel data fields.
- Do not redraw the Hotel Marseille logo.

