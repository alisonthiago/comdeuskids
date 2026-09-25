---
name: Com Deus Kids Desktop
colors:
  surface: '#f8f9ff'
  surface-dim: '#d6dae4'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4fd'
  surface-container: '#eaeef8'
  surface-container-high: '#e4e8f2'
  surface-container-highest: '#dee2ec'
  on-surface: '#171c23'
  on-surface-variant: '#594139'
  inverse-surface: '#2c3138'
  inverse-on-surface: '#edf1fb'
  outline: '#8d7168'
  outline-variant: '#e1bfb5'
  surface-tint: '#ab3500'
  primary: '#ab3500'
  on-primary: '#ffffff'
  primary-container: '#ff6b35'
  on-primary-container: '#5f1900'
  inverse-primary: '#ffb59d'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#005ac2'
  on-tertiary: '#ffffff'
  tertiary-container: '#6198ff'
  on-tertiary-container: '#002f6c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59d'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#832600'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#171c23'
  surface-variant: '#dee2ec'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: Plus Jakarta Sans
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
  gutter-lg: 2rem
  margin: 2.5rem
  margin-xl: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an ultra-clean, serene, and premium environment tailored for family, faith, and educational stewardship. It bridges the modern minimalism of elite enterprise SaaS with the calm clarity and polished precision of top-tier consumer fintech. 

The aesthetic is luminous, expansive, and orderly:
- **Atmosphere:** 85–90% white and off-white negative space where whitespace functions as an active structural element, cultivating focus, safety, and modern sophistication.
- **Emotional Response:** Inspires trust, calm competence, and joyful engagement without falling into chaotic, overly bright cartoon tropes. It treats parents, educators, and children with mutual visual respect.
- **Style Blend:** Minimalist structure combined with soft, warm tactile cues—employing crisp typography, whisper-light architectural lines, and radiant, disciplined coral and amber accents.

## Colors

The palette operates under a strict hierarchy of restraint. Color is preserved as an intentional beacon rather than ambient decoration.

- **Canvas & Surfaces:**
  - App Background: `#FBFBFC` provides an imperceptible, soft paper foundation.
  - Surface & Card Background: Pure `#FFFFFF` elevates active workspace regions.
  - Neutral Substrates: `#F3F4F6` for subtle chip fills and disabled segments.
- **Text & Hierarchy:**
  - Primary Text: `#1E232A` (deep charcoal) for high-contrast, effortless legibility.
  - Secondary Text: `#737A87` (soft slate gray) for metadata, labels, and secondary actions.
  - Muted / Inactive Text: `#A0A6B2` for placeholder values and deactivated states.
- **Accent Philosophy (Used Sparingly):**
  - **Primary Warm Coral (`#FF6B35` / `#FF8A3D`):** Reserved strictly for high-impact interactions: primary buttons, active stepper states, and core progression triggers.
  - **Fresh Emerald (`#10B981`):** Applied to success confirmations, completion tags, and active participation indicators.
  - **Sky Blue (`#3B82F6`):** Used for educational highlights, informational badges, and auxiliary selections.
- **Borders:**
  - Border Hairline: `rgba(30, 35, 42, 0.06)` for whisper-quiet definition between layered whites.

## Typography

Typographic choices rely exclusively on **Plus Jakarta Sans**, balancing contemporary geometric precision with soft humanist terminals.

- **Hierarchy Rules:** 
  - Headlines leverage `-0.01em` to `-0.02em` tracking for a tight, high-end editorial presence.
  - Body copy retains a loose line-height (`1.5` to `1.6`) to preserve readability across rich educational paragraphs and parent dashboards.
  - Labels and meta indicators adopt uppercase or semi-bold weights with slight positive tracking (`+0.01em` to `+0.03em`) to anchor navigational elements.
- **Discipline:** Avoid stacking multiple font families. Distinctions in informational importance are achieved purely through weight shifts (`400`, `500`, `600`, `700`) and the transition from charcoal (`#1E232A`) to slate (`#737A87`).

## Layout & Spacing

The architecture operates on a baseline 8px module, engineered for a desktop canonical resolution of **1440px** with fluid scaling upward:

- **Sidebar Anchor:** A permanent, clean white sidebar (fixed width `260px` or `280px`) hugs the left edge, visually separated by a 1px border (`rgba(30, 35, 42, 0.05)`), keeping primary navigation static.
- **Main Canvas:** Structured with a 12-column fluid grid, standardizing on a `24px` gutter (`gutter`) expanding to `32px` (`gutter-lg`) on ultra-wide viewports. Outer canvas margins sit at `40px` (`margin`) to `56px` (`margin-xl`), ensuring content never touches screen boundaries.
- **Rhythm & Densities:** 
  - Generous internal container padding (`24px` to `32px`) protects content from cramped layouts.
  - Component stacks utilize `space-md` (`16px`) for closely related items and `space-xl` (`40px`) for macro section division.

## Elevation & Depth

Visual hierarchy uses ethereal depth layering instead of heavy, dark shadows. The objective is to make pure white surfaces float delicately over the `#FBFBFC` canvas.

- **Card & Panel Shadows:**
  - Base Rest: `box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02);`
  - Interactive Hover: `box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.03);`
- **Ghost Outlines:** Every card or elevated container combines ambient elevation with a hairline border: `border: 1px solid rgba(0, 0, 0, 0.05)`.
- **Modals & Overlays:** Overlays apply a clean white-frosted effect: `backdrop-filter: blur(8px); background-color: rgba(251, 251, 252, 0.8)`. Floating dialogue cards utilize elevated containment: `box-shadow: 0 24px 48px -12px rgba(30, 35, 42, 0.08)`.

## Shapes

The shape vocabulary emphasizes welcoming, organic geometry without appearing childlike or undisciplined.

- **Standard Elements:** Buttons, inputs, and interactive badges implement `rounded-lg` (approximately `12px` to `16px`) for tactile ease.
- **Cards & Primary Modules:** Core content panels adopt generous soft corners ranging from `18px` to `24px` (`rounded-xl` equivalent). This high radius softens data density and enhances focus on central tasks.
- **Pill Elements:** Status tags, active filters, and avatar frames use full pill geometry (`9999px`) to maintain crisp, contained silhouettes alongside card geometries.

## Components

### Buttons
- **Primary:** Solid `#FF6B35` coral background, `#FFFFFF` text, `font-weight: 600`, subtle inset highlight. Hover transitions smoothly to `#FF8A3D` with an ambient glow (`box-shadow: 0 4px 14px rgba(255, 107, 53, 0.25)`). Height: `44px`, padding: `0 24px`, radius: `12px`.
- **Secondary / Ghost:** `#FFFFFF` background, `1px solid rgba(0, 0, 0, 0.08)`, `#1E232A` text. Hover shifts to `#FBFBFC` with border darkening to `rgba(0, 0, 0, 0.12)`.
- **Tertiary:** Transparent background, `#737A87` text. On hover, `#1E232A` text with an invisible background pad.

### Input Fields
- **Container:** Pure `#FFFFFF` surface, height: `44px`, radius: `12px`, border: `1px solid rgba(0, 0, 0, 0.08)`.
- **Typography:** `#1E232A` typed value, `#A0A6B2` placeholder, size: `14px`.
- **States:** Focus replaces default borders with `1px solid #FF6B35` accompanied by a whisper ring: `box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.12)`.

### Cards & Modules
- Pure white `#FFFFFF` body resting on `#FBFBFC`. 
- Border: `1px solid rgba(0, 0, 0, 0.05)`, radius: `20px`, internal padding: `24px` to `32px`.
- Sub-sections within cards are segmented by faint hair lines or soft `#F8F9FA` inner inset containers with `14px` radius.

### Chips & Badges
- **Status Pills:** Height: `28px`, padding: `0 12px`, radius: `9999px`, font-size: `12px`, weight: `600`.
- **Emerald (Active / Complete):** Background `#ECFDF5`, text `#065F46`.
- **Sky Blue (Info / Module):** Background `#EFF6FF`, text `#1E40AF`.
- **Coral (Pending / Milestone):** Background `#FFF7ED`, text `#C2410C`.

### Lists & Tables
- Borderless table rows separated by `1px solid rgba(0, 0, 0, 0.03)` dividers.
- Hover states on list elements highlight with a clean `#FBFBFC` wash without hard color shifts.

### Checkboxes & Radios
- Size: `20px x 20px`, radius: `6px` (checkbox) or `50%` (radio).
- Inactive: `1.5px solid rgba(0, 0, 0, 0.15)` over `#FFFFFF`.
- Active: Background `#FF6B35`, border: `#FF6B35`, white micro-check or inner circular pip.