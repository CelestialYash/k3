---
name: GeoStratum Intelligence
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#434655'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006d30'
  on-secondary: '#ffffff'
  secondary-container: '#92f5a4'
  on-secondary-container: '#007233'
  tertiary: '#824500'
  on-tertiary: '#ffffff'
  tertiary-container: '#a65900'
  on-tertiary-container: '#ffede1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#95f8a7'
  secondary-fixed-dim: '#79db8d'
  on-secondary-fixed: '#00210a'
  on-secondary-fixed-variant: '#005323'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-xl:
    fontFamily: Source Sans 3
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-mobile: 1rem
  margin-tablet: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
This design system powers an enterprise-grade AI geological, mining, and regulatory reporting intelligence platform built for senior geologists, mining engineers, surveyors, and institutional executives (CMPDI / Coal India Limited). 

The emotional tone balances high-precision institutional authority with modern serenity—borrowing the clean, uncluttered spatial discipline of Linear, the intellectual warmth of Notion, and the operational clarity of Stripe. The user interface eschews harsh, saturated industrial paradigms in favor of a soft, luminous palette with pastel fills, high-contrast slate typography, and tranquil geological tones.

Key characteristics:
- **Design Philosophy:** Tactile-Modern Minimalist. Clean planes, crisp hairline borders, gentle pastel tinting for functional categorization, and generous negative space.
- **Accessibility & Senior Ergonomics:** Generous touch/click targets (minimum 44px), high contrast ratios (WCAG AAA compliant for critical data), and explicit label-plus-icon pairings to ensure immediate recognition in high-stakes operational environments.
- **Data Verifiability:** AI-derived interpretations, bore-hole stratigraphy analyses, and automated reporting cards incorporate prominent confidence indicators and source verification tags.

## Colors
The system operates exclusively in light mode to provide a calm, reflective workspace for intensive reading, mapping, and tabular cross-examination.

- **Canvas & Surfaces:** 
  - Root Page Canvas: `#F8FAFC` (Slate 50)
  - Card & Container Fill: `#FFFFFF` (Pure White) and `#FAF9F6` (Warm Ivory for sidebars, inspector panes, and document viewers)
- **Primary Accent (Muted Sky Blue):** 
  - Primary Base: `#2563EB` (Interactive actions, focal points)
  - Interactive Hover: `#1D4ED8`
  - Pastel Fills: `#EEF5FB` (Surface tint), `#DCEAF7` (Hover states, subtle tags), `#AFCBE5` (Delicate structural dividers)
- **Geological & Success Accent (Soft Sage / Mint):** 
  - Base Accent: `#15803D` (Verified status, active exploration strata, environmental compliance)
  - Pastel Fills: `#E6F1E9` (Badge backgrounds), `#DDEBDD` (Highlight containers)
- **Functional Warning / Conflict (Soft Amber):**
  - Base Accent: `#D97706` (Discrepancies, unverified seam scans, safety advisories)
  - Pastel Fill: `#FEF3C7` (Notice banners, attention badges)
- **Secondary Domain Pastel Accents:**
  - Soft Lavender (`#EAE5F4`): AI synthesis, remote sensing, hyperspectral imaging layers.
  - Pale Peach (`#F7E9DE`): Core sampling metadata, borehole thermal metrics.
- **Typography & Text Contrast:**
  - Headings & KPI Values: `#1E293B` (Slate Navy, high visual grounding)
  - Body & Form Values: `#334155` (Deep Slate, optimized for eye strain mitigation)
  - Secondary Metadata & Captions: `#64748B` (Muted Slate)
  - Hairline Borders: `#E2E8F0`

## Typography
The typography strategy prioritizes senior legibility and systematic data inspection. 

- **Headlines (Hanken Grotesk):** Delivers clean, structured authority without feeling severe. Tight tracking gives reports and dashboards a curated, executive tone.
- **Body & Continuous Text (Source Sans 3):** Standardized with a base size of 16px to 18px for narrative reports, borehole logs, and statutory summaries to drastically reduce cognitive fatigue. Open counters ensure optimal clarity on varied display hardware.
- **Labels, Telemetry & Coordinate Data (JetBrains Mono):** Reserved for spatial coordinates, seam depths, chemical assays, run times, and AI confidence percentages to maintain tabular column alignment.

## Layout & Spacing
The layout follows a responsive 12-column fluid grid structured for dense information panels, geographic maps, and document-comparison views.

- **Grid Disciplines:** 
  - Standard desktop layouts utilize a 12-column grid with `24px` (`1.5rem`) gutters and `32px` (`2rem`) outer margins.
  - Multi-pane setups (e.g., Map Viewer + Stratigraphic Inspector) split cleanly along 4/8 or 3/6/3 column distributions.
- **Vertical Rhythm:**
  - Structural margins between sections utilize `2.5rem` (`space-xl`).
  - Interior card paddings use `1.5rem` (`space-lg`) to prevent information overcrowding.
  - Interactive item groupings use `0.5rem` (`space-sm`) and `1rem` (`space-md`).
- **Responsive Adaptations:**
  - **Desktop (>=1280px):** Three-tier layout (Global Navigation, Multi-Document/Map Canvas, Inspector Drawer).
  - **Tablet (768px - 1279px):** Inspector transitions into a sliding overlay sheet; gutters reduce to `1rem`.
  - **Mobile (<768px):** Single-column stacked order; canvas margin reduces to `1rem`, tap targets remain strictly >= 44px.

## Elevation & Depth
Depth is expressed through subtle tonal layering and razor-thin outlines rather than heavy drop shadows, reinforcing a light, calm interface:

- **Surface Tiers:**
  - *Tier 0 (Root):* `#F8FAFC` page background.
  - *Tier 1 (Base Cards & Split Views):* Pure `#FFFFFF` surfaces bounded by `#E2E8F0` 1px hairline borders.
  - *Tier 2 (Popovers, Flyouts, Sticky Headers):* `#FFFFFF` elevated with ultra-diffused ambient shadow: `box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03)`.
  - *Tier 3 (Floating Modals, Seam Inspection Viewers):* `#FFFFFF` bounded by `#CBD5E1` with `box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08)`.
- **Soft Pastel Wells:**
  - Embedded data containers, code blocks, and coordinate lists utilize inset background wells (`#FAF9F6` or `#EEF5FB`) with zero shadow, preserving layout flatness.

## Shapes
A unified rounded geometry softens industrial reporting data while maintaining modern precision:

- **Standard Elements (rounded-md / roundedness 2):** Inputs, standard buttons, dropdown menus, and data cells use `0.5rem` (8px).
- **Cards & Data Modules (rounded-lg):** Dashboard summary blocks, AI insight modules, and map viewports use `1rem` (16px) corners.
- **Status Pills & Action Tags:** Fully rounded pill geometry (`9999px`) for confidence ratings, geological status badges, and verification indicators.

## Components

### Buttons & Interactive Controls
- **Primary Button:** `#2563EB` solid fill, white text, 44px minimum height, horizontal padding `1.25rem`, subtle focus ring (`#AFCBE5` at 3px offset).
- **Secondary Button:** Pure `#FFFFFF` background, `#E2E8F0` border, `#334155` text, 44px minimum height. Hover state shifts to `#EEF5FB`.
- **Tertiary / Ghost Button:** Transparent background, `#2563EB` text, paired always with a distinct leading or trailing icon for clarity.

### Inputs & Selection Controls
- **Form Inputs:** 44px minimum height, `#FFFFFF` background, 1px `#E2E8F0` border, `16px` (`body-lg`) text size to prevent iOS zoom and accommodate senior reading. Active focus features a 2px outer glow using `#DCEAF7`.
- **Checkboxes & Radios:** 20px x 20px hit target embedded within a 44px accessible clickable container. Primary accent check mark with clear high-contrast borders.

### Badges, Tags & Verification Chips
- **AI Verification Tag:** Pastel Lavender (`#EAE5F4`) fill, `#4C1D95` label text, featuring a discrete sparkle/verification icon and percentage score.
- **Geological Status Badge:** Soft Sage (`#E6F1E9`) fill, `#15803D` text, 6px solid green status dot.
- **Conflict / Anomaly Badge:** Soft Amber (`#FEF3C7`) fill, `#92400E` text, amber warning icon.

### Data Cards & Reporting Modules
- Clean `#FFFFFF` fill with 1px `#E2E8F0` borders and 16px corner radius.
- Headers separate title from status badges with clear horizontal metadata dividers.
- Footer actions consistently align right, with explicit primary and secondary visual weight.

### Specialized Platform Components
- **Borehole Stratigraphy Strip:** Segmented vertical data track with distinct pastel layer indicators, paired with monospaced depth markers and tooltip inspection cards.
- **Confidence Meter:** Horizontal 4px bar with `#DDEBDD` track and `#15803D` progress fill, accompanied by monospaced tabular confidence values.