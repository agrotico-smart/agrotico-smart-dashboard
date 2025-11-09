# Market Prices Module - UI Design Documentation

## Overview
This document describes the visual design and user interface of the Agricultural Market Prices module.

---

## Page Layout

### Header Section
```
┌─────────────────────────────────────────────────────────────────────┐
│  📈 Precios de Mercado Agrícola         [🔄 Actualizar Precios]    │
│  Costa Rica - Última actualización: 09/11/2024, 02:24:33           │
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**
- Title with TrendingUp icon
- Last update timestamp
- Update button (with refresh icon)

---

## Alerts Section

### When Alerts Exist:
```
┌─────────────────────────────────────────────────────────────────────┐
│  Alertas de Precio (últimos 7 días)                                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ↗ Café - GAM                                                 │   │
│  │   El precio subió un 8.5% esta semana.                       │   │
│  │   De ₡750 a ₡814 · 07/11/2024                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ↘ Tomate - Pacífico Norte                                    │   │
│  │   El precio bajó un 6.2% esta semana.                        │   │
│  │   De ₡980 a ₡919 · 06/11/2024                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### When No Alerts:
```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚠️ No hay cambios significativos en los precios                   │
└─────────────────────────────────────────────────────────────────────┘
```

**Visual Design:**
- Green background (#f0fdf4) for price increases
- Red background (#fef2f2) for price decreases
- Icons: ↗ (TrendingUp) for increases, ↘ (TrendingDown) for decreases

---

## Filters Section

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────┐  ┌────────────────────┐  ┌─────────────────┐│
│  │ Región            │  │ Producto (gráfico) │  │ Período         ││
│  │ [Nacional     ▼]  │  │ [Café          ▼]  │  │ [30 días     ▼] ││
│  └───────────────────┘  └────────────────────┘  └─────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**
- Three dropdown selectors arranged horizontally
- Labels above each selector
- Responsive: Stack vertically on mobile

**Options:**
1. **Región:** Nacional, GAM, Pacífico Norte, Huetar Norte, Pacífico Central, Brunca, Huetar Caribe
2. **Producto:** Café, Arroz, Maíz, Frijol, Tomate, Papa, Caña de Azúcar
3. **Período:** Últimos 30 días, Últimos 60 días, Últimos 90 días

---

## Historical Chart Section

```
┌─────────────────────────────────────────────────────────────────────┐
│  Tendencia de precios - Café (GAM)                                 │
│                                                                     │
│  ₡900 ┤                                              ╭─╮           │
│       │                                         ╭────╯ ╰─╮         │
│  ₡850 ┤                                    ╭────╯        ╰──╮      │
│       │                               ╭────╯                ╰─╮    │
│  ₡800 ┤                          ╭────╯                       ╰─╮  │
│       │                     ╭────╯                              ╰─╮│
│  ₡750 ┤                ╭────╯                                     ╰│
│       │           ╭────╯                                           │
│  ₡700 ┤──────╭────╯                                                │
│       └────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬───│
│          Oct 10  Oct 17  Oct 24  Oct 31  Nov 7                   │
└─────────────────────────────────────────────────────────────────────┘
```

**Chart Features:**
- Line chart with blue line (#2563eb)
- X-axis: Dates (formatted as "Oct 10")
- Y-axis: Prices in Costa Rican Colones
- Hover tooltip shows exact price and date
- Responsive and adjusts to container width
- Grid lines for easier reading

---

## Price Cards Grid

### Desktop Layout (4 columns):
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Café      ↗  │  │ Arroz     —  │  │ Maíz      ↘  │  │ Frijol    ↗  │
│ Nacional     │  │ Nacional     │  │ Nacional     │  │ Nacional     │
│              │  │              │  │              │  │              │
│ ₡850         │  │ ₡650         │  │ ₡320         │  │ ₡780         │
│ por kg       │  │ por kg       │  │ por kg       │  │ por kg       │
│              │  │              │  │              │  │              │
│ +2.5%        │  │ +0.2%        │  │ -1.8%        │  │ +3.1%        │
│ (desde ₡829) │  │ (desde ₡648) │  │ (desde ₡326) │  │ (desde ₡757) │
│              │  │              │  │              │  │              │
│ 09/11/2024   │  │ 09/11/2024   │  │ 09/11/2024   │  │ 09/11/2024   │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Tomate    ↘  │  │ Papa      ↗  │  │ Caña      —  │
│ Nacional     │  │ Nacional     │  │ Nacional     │
│              │  │              │  │              │
│ ₡920         │  │ ₡450         │  │ ₡28,000      │
│ por kg       │  │ por kg       │  │ por tonelada │
│              │  │              │  │              │
│ -4.2%        │  │ +1.5%        │  │ +0.5%        │
│ (desde ₡960) │  │ (desde ₡443) │  │ (₡27,860)    │
│              │  │              │  │              │
│ 09/11/2024   │  │ 09/11/2024   │  │ 09/11/2024   │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Individual Card Design:

```
┌──────────────────────────────┐
│ Café                      ↗  │  ← Product name + trend icon
│ GAM                          │  ← Region
├──────────────────────────────┤
│                              │
│ ₡850                         │  ← Current price (large, bold)
│ por kg                       │  ← Unit
│                              │
│ +2.5%                        │  ← Percentage change (colored)
│ (desde ₡829)                 │  ← Previous price
│                              │
│ Actualizado: 09/11/2024      │  ← Last update date
└──────────────────────────────┘
```

**Visual Design:**
- White background with shadow on hover
- Price in large blue text (#2563eb)
- Green text for positive changes
- Red text for negative changes
- Gray text for stable prices
- Rounded corners
- Border on hover

**Icons:**
- ↗ (TrendingUp) - Green for price increase
- ↘ (TrendingDown) - Red for price decrease
- — (Minus) - Gray for stable price

---

## Information Footer

```
┌─────────────────────────────────────────────────────────────────────┐
│ ℹ️ Información importante                                          │
│                                                                     │
│ Los precios mostrados son aproximaciones basadas en datos          │
│ históricos y actuales del mercado costarricense. Los precios       │
│ reales pueden variar según el punto de venta, calidad del          │
│ producto y condiciones específicas de cada transacción. Se         │
│ recomienda consultar con fuentes oficiales como el CNP (Consejo    │
│ Nacional de Producción) o el MAG (Ministerio de Agricultura y      │
│ Ganadería) para decisiones comerciales importantes.                │
└─────────────────────────────────────────────────────────────────────┘
```

**Visual Design:**
- Light blue background (#eff6ff)
- Blue border (#bfdbfe)
- Blue text (#1e40af)
- Information icon

---

## Responsive Breakpoints

### Desktop (> 1280px)
- 4 price cards per row
- Horizontal filters
- Full-width chart

### Tablet (768px - 1280px)
- 2-3 price cards per row
- Horizontal filters
- Full-width chart

### Mobile (< 768px)
- 1 price card per row
- Vertical filters (stacked)
- Full-width chart (scrollable)
- Compact header
- Hamburger menu for navigation

---

## Color Scheme

### Primary Colors:
- **Primary Blue:** #2563eb (main theme color)
- **Success Green:** #16a34a (price increases)
- **Danger Red:** #dc2626 (price decreases)
- **Neutral Gray:** #6b7280 (stable prices)

### Background Colors:
- **Card Background:** #ffffff (white)
- **Page Background:** #f9fafb (light gray)
- **Alert Success Background:** #f0fdf4 (light green)
- **Alert Danger Background:** #fef2f2 (light red)
- **Info Background:** #eff6ff (light blue)

### Text Colors:
- **Primary Text:** #111827 (dark gray)
- **Secondary Text:** #6b7280 (medium gray)
- **Light Text:** #9ca3af (light gray)

---

## Typography

### Font Family:
- **Primary:** Inter (from Google Fonts)
- **Fallback:** system-ui, -apple-system, sans-serif

### Font Sizes:
- **Page Title:** 1.875rem (30px)
- **Card Title:** 1.125rem (18px)
- **Price (Large):** 1.875rem (30px)
- **Body Text:** 0.875rem (14px)
- **Small Text:** 0.75rem (12px)

### Font Weights:
- **Regular:** 400
- **Medium:** 500
- **Semibold:** 600
- **Bold:** 700

---

## Loading States

### Initial Page Load:
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                          ⟳ (spinning)                               │
│                   Cargando precios...                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Chart Loading:
```
┌─────────────────────────────────────────────────────────────────────┐
│  Tendencia de precios - Café (GAM)                                 │
│                                                                     │
│                          ⟳ (spinning)                               │
│                   Cargando historial...                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Update Button Loading:
```
[⟳ Actualizando...]  ← Button with spinning icon
```

---

## Empty States

### No Data Available:
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                          📊                                         │
│           No hay datos disponibles para esta región                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### No Historical Data:
```
┌─────────────────────────────────────────────────────────────────────┐
│  Tendencia de precios - Café (GAM)                                 │
│                                                                     │
│                          📈                                         │
│              No hay datos históricos disponibles                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Interactions

### Hover States:
- **Price Cards:** Shadow increases, slight scale up
- **Buttons:** Background color darkens
- **Chart Lines:** Line becomes thicker
- **Chart Points:** Tooltip appears

### Click/Tap States:
- **Dropdowns:** Open with smooth animation
- **Update Button:** Shows loading state, then success toast
- **Navigation Link:** Highlights in sidebar

### Toast Notifications:
```
┌─────────────────────────────────────┐
│ ✓ Precios actualizados correctamente│
└─────────────────────────────────────┘
```

```
┌─────────────────────────────────────┐
│ ✗ Error al actualizar precios       │
└─────────────────────────────────────┘
```

---

## Accessibility Features

- **Semantic HTML:** Proper heading hierarchy, labels, and ARIA attributes
- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Screen Reader Support:** Descriptive labels for all UI elements
- **Color Contrast:** WCAG AA compliant contrast ratios
- **Focus Indicators:** Visible focus states for keyboard navigation
- **Alternative Text:** Icons have descriptive alternative text

---

## Performance Optimizations

- **Lazy Loading:** Components load only when needed
- **Data Caching:** Server-side caching of price data
- **Debounced Updates:** Filter changes debounced to reduce API calls
- **Memoization:** React components memoized to prevent unnecessary re-renders
- **Code Splitting:** Page-level code splitting for faster initial load

---

## Browser Support

- **Chrome/Edge:** 90+
- **Firefox:** 88+
- **Safari:** 14+
- **Mobile Safari:** iOS 14+
- **Chrome Mobile:** Android 90+

---

This UI design follows Material Design principles and Tailwind CSS best practices, ensuring a modern, accessible, and user-friendly interface for Costa Rican farmers.
