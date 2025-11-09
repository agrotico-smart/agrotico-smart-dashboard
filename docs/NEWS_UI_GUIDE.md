# Agricultural News Module - UI Guide

## Visual Design Overview

### Newspaper-Style Header
```
┌──────────────────────────────────────────────────────────────┐
│ 📰 Noticias Agrícolas                         [Actualizar] │
│ Costa Rica • Información Confiable para el Agricultor        │
├══════════════════════════════════════════════════════════════┤
│ ÚLTIMA ACTUALIZACIÓN              Miércoles, 8 de nov. 2023 │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Large, bold headline ("Noticias Agrícolas") in newspaper style
- Subtitle with location and purpose
- Refresh button with icon (spinning animation when loading)
- Date banner showing last update in Spanish locale
- Professional black borders mimicking newspaper layout

### News Cards Grid

#### Desktop Layout (3 columns)
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  [IMAGE]         │  │  [IMAGE]         │  │  [IMAGE]         │
│                  │  │                  │  │                  │
│ 🏷️ La Nación     │  │ 🏷️ CRHoy        │  │ 🏷️ La Nación     │
│                  │  │                  │  │                  │
│ Headline in Bold │  │ Another Headline │  │ Third Headline   │
│ Large Font       │  │ Goes Here        │  │ For Article      │
│                  │  │                  │  │                  │
│ Brief descriptn  │  │ Brief descriptn  │  │ Brief descriptn  │
│ of the article   │  │ of the article   │  │ of the article   │
│ goes here...     │  │ goes here...     │  │ goes here...     │
│                  │  │                  │  │                  │
│ 📅 hace 2 horas  │  │ 📅 hace 5 horas  │  │ 📅 hace 1 día    │
│           Leer→  │  │           Leer→  │  │           Leer→  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Color Palette

#### Brand Colors
- **Primary Blue**: #0057a3 (Agrotico brand color)
- **Hover Blue**: #2563eb
- **Text Blue**: #1d4ed8

#### Neutral Colors
- **Dark Text**: #0f172a (slate-900)
- **Medium Text**: #334155 (slate-700)
- **Light Text**: #64748b (slate-500)
- **Borders**: #e2e8f0 (slate-200)
- **Background**: #f8fafc (slate-50)
- **Cards**: #ffffff (white)

### Interactive Elements

#### Hover Effects
- **Card**: Shadow increases (hover:shadow-xl)
- **Image**: Scales up 105% with smooth transition
- **Headline**: Changes to blue color
- **"Leer más"**: Gap increases between text and icon
- **Refresh Button**: Background darkens

### Responsive Breakpoints

```
Mobile:    < 768px  → 1 column
Tablet:    768px+   → 2 columns  
Desktop:   1024px+  → 3 columns
```

### Accessibility Features

- ✅ Semantic HTML (article, header, nav)
- ✅ ARIA labels for icons
- ✅ Keyboard navigation support
- ✅ Focus visible states
- ✅ High contrast ratios (WCAG AA)
- ✅ Screen reader friendly
- ✅ Alt text for images
- ✅ Descriptive link text
