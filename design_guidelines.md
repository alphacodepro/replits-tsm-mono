# Tuition Management System - Design Guidelines

## Design Approach: Material Design System (Dashboard-Focused)

**Rationale**: This is a utility-focused, data-dense management application prioritizing efficiency, clarity, and learnability. Material Design provides excellent patterns for dashboards, data tables, and form-heavy interfaces.

**Key Principles**:
- Information hierarchy through elevation and spacing
- Clear data visualization and table layouts
- Intuitive form patterns for data entry
- Responsive grid system for dashboard widgets

---

## Color Palette

### Light Mode
- **Primary**: 217 91% 60% (Professional blue for actions, CTAs)
- **Primary Variant**: 217 91% 45% (Hover states, emphasis)
- **Background**: 0 0% 98% (Main background)
- **Surface**: 0 0% 100% (Cards, tables, elevated components)
- **Surface Variant**: 0 0% 96% (Alternate rows, subtle sections)
- **Success**: 142 71% 45% (Positive actions, payment received)
- **Warning**: 38 92% 50% (Pending payments, alerts)
- **Error**: 0 72% 51% (Errors, critical warnings)
- **Text Primary**: 0 0% 13%
- **Text Secondary**: 0 0% 46%

### Dark Mode
- **Primary**: 217 91% 65%
- **Primary Variant**: 217 91% 50%
- **Background**: 0 0% 10%
- **Surface**: 0 0% 14%
- **Surface Variant**: 0 0% 18%
- **Success**: 142 71% 50%
- **Warning**: 38 92% 55%
- **Error**: 0 72% 56%
- **Text Primary**: 0 0% 95%
- **Text Secondary**: 0 0% 70%

---

## Typography

**Font Stack**: System fonts for optimal performance
- Primary: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- Monospace: "SF Mono", Monaco, "Cascadia Code" (for IDs, codes)

**Scale**:
- Display (Dashboard headers): text-3xl (30px) font-bold
- Headings (Section titles): text-xl (20px) font-semibold
- Subheadings (Card titles): text-lg (18px) font-medium
- Body (Default text): text-base (16px) font-normal
- Labels/Captions: text-sm (14px) font-medium
- Helper text: text-xs (12px) font-normal

---

## Layout System

**Spacing Primitives**: Use tailwind units of 2, 4, 6, and 8 consistently
- Micro spacing: p-2, gap-2 (8px) - Between related elements
- Standard spacing: p-4, gap-4 (16px) - Default component padding
- Section spacing: p-6, gap-6 (24px) - Between sections
- Major spacing: p-8, gap-8 (32px) - Page margins, major sections

**Grid System**:
- Dashboard widgets: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Stat cards: 4-column on desktop, 2 on tablet, 1 on mobile
- Content max-width: max-w-7xl mx-auto
- Sidebar: w-64 fixed on desktop, slide-over on mobile

---

## Component Library

### Navigation
- **Sidebar Navigation**: Fixed left sidebar (desktop), collapsible drawer (mobile)
  - Logo/Brand at top (h-16)
  - Navigation items with icons (py-3 px-4)
  - Active state: bg-primary/10 with accent border-l-4
  - User profile section at bottom
- **Top Bar**: Sticky header with breadcrumbs, search, notifications, profile dropdown

### Dashboard Widgets
- **Stat Cards**: Elevated cards (shadow-sm) with icon, label, value, and trend indicator
  - Icon in colored circle (top-left)
  - Large number (text-3xl font-bold)
  - Label below (text-sm text-secondary)
  - Optional percentage change indicator
- **Chart Cards**: Elevated containers with header, chart area, and optional filters
  - Card header: title + action button/dropdown
  - Padding: p-6
  - Responsive height: h-80 for charts

### Data Tables
- **Structure**: 
  - Sticky header row with sort indicators
  - Alternating row colors (bg-surface-variant on even rows)
  - Hover state: bg-surface-variant/50
  - Row height: h-14 for comfortable touch targets
  - Pagination footer with items-per-page selector
- **Cell Types**:
  - Text: left-aligned, truncate with tooltip
  - Numbers/Currency: right-aligned, monospace
  - Status badges: inline-flex with colored backgrounds
  - Actions: icon buttons in right column

### Forms
- **Input Fields**:
  - Border: border-2 with focus:ring-2 ring-primary/20
  - Height: h-11 for comfortable interaction
  - Spacing: space-y-4 between fields
  - Labels: text-sm font-medium mb-2
  - Error state: border-error with text-error message below
- **Buttons**:
  - Primary: bg-primary text-white (h-11 px-6)
  - Secondary: border-2 border-primary text-primary
  - Icon buttons: h-10 w-10 rounded-full
- **Date Picker**: Material-style calendar dropdown
- **Dropdowns**: Elevated menu with shadow-lg

### Modals & Dialogs
- **Structure**: 
  - Backdrop: bg-black/50
  - Container: max-w-2xl centered, rounded-lg shadow-xl
  - Header: flex justify-between items-center border-b p-6
  - Body: p-6 max-h-[70vh] overflow-y-auto
  - Footer: flex justify-end gap-4 border-t p-6

### Special Components
- **QR Code Display**: 
  - Centered card with p-8
  - QR code: size 256x256
  - Share button group below
  - Copy link input field
- **Payment Statement Table**:
  - Compact rows (h-12)
  - Columns: Date | Amount Paid | Remaining | Status
  - Running total row highlighted
- **Empty States**:
  - Centered icon (text-6xl text-secondary/30)
  - Heading + description
  - Primary CTA button

### Status Badges
- **Paid**: bg-success/10 text-success border border-success/20
- **Pending**: bg-warning/10 text-warning border border-warning/20
- **Overdue**: bg-error/10 text-error border border-error/20
- Size: px-3 py-1 text-xs font-medium rounded-full

### Charts
- Use Chart.js or Recharts for data visualization
- Line charts for trends (fees over time)
- Bar charts for batch comparisons
- Donut charts for distribution (students per batch)
- Colors: Use primary and success colors, avoid excessive palette

---

## Animations

**Minimal & Purposeful**:
- Page transitions: None (instant navigation)
- Modal/drawer: slide-in (300ms ease-out)
- Button hover: scale-[1.02] (subtle)
- Loading states: Skeleton screens (no spinners)
- Toast notifications: slide-down from top

---

## Responsive Breakpoints
- Mobile: < 768px - Single column, drawer navigation
- Tablet: 768px - 1024px - 2-column grids, collapsed sidebar
- Desktop: > 1024px - 4-column grids, fixed sidebar

---

## Images
No hero images required - this is a dashboard application focused on data display and management.