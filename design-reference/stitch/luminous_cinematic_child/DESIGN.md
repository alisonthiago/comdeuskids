---
name: Luminous Cinematic Child
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#7bd0ff'
  on-tertiary: '#00354a'
  tertiary-container: '#009bd1'
  on-tertiary-container: '#002d40'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '800'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.75rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system sets an immersive, cinematic standard for faith-based children's digital entertainment. It balances the visual gravitas of world-class video streaming applications with an uplifting, wonder-filled warmth tailored for younger audiences and discerning parents. 

The aesthetic is dark-first and atmosphere-rich, evoking the enchantment of an evening cinema while keeping interactions tactile, joyful, and completely approachable. Instead of cold utilitarian edges, elements possess soft geometry, luminous purple accents, and warm celestial gold highlights that cue safety, delight, and moral inspiration.

### Visual Pillars
- **Cinematic Submersion:** Pitch-deep background canvas levels focus all visual weight on high-fidelity poster art and 16:9 thumbnails, eliminating dashboard clutter.
- **Luminous Radiance:** Translucent glassmorphism with high-saturation violet edge lights creates depth without visual friction.
- **Gentle Tactility:** Generously rounded touch targets, plush cards, and friendly micro-interactions make navigation intuitive for children while preserving premium execution for parents.

## Colors

The color palette anchors the interface in deep nocturnal space so vivid cover art can breathe, using an ascending tier of dark tones paired with an energetic violet spectrum and celestial gold.

### Color Hierarchy
- **Canvas (`#0B0B0D`):** The ground level. Complete absence of bright glare for evening viewing.
- **Surface Elevation (`#141419` & `#1A1A24`):** Middle and high layers for drawers, rails, navigation bars, and empty states.
- **Brand Violet (`#8B5CF6` primary, `#7C3AED` hover/pressed, `#A855F7` glow):** Sparks action, active navigation tabs, interactive focus rings, and primary CTAs.
- **Celestial Gold (`#F59E0B`):** Reserved for achievements, biblical badges, star ratings, and milestone streaks.
- **Text Layers:** Pure white (`#FFFFFF`) for primary titles and active labels; soft cool gray (`#D1D5DB`) for loglines and metadata; subtle mute (`#9CA3AF`) for runtimes, episode markers, and inactive states.

## Typography

The design system exclusively adopts Plus Jakarta Sans for its geometric precision, open counters, and inherently friendly, approachable demeanor. 

### Usage Guidelines
- Titles and Hero banners use bold to extra-bold weights with tight letter spacing to deliver cinematic punch.
- Metadata, age tags, and badges use uppercase weights (`label-badge`) to maintain rapid legibility on TV and touch screen devices.
- Body text remains comfortable and readable in low-contrast ambient dark environments by maintaining generous line height.

## Layout & Spacing

A flexible rail-and-carousel layout architecture prioritizes edge-to-edge content streaming while preserving ergonomic touch margins.

### Grid & Breakpoints
- **Mobile (< 768px):** 4-column flow with continuous horizontal carousels bleeding off-screen to the right margin. Carousels show 2.2 poster cards or 1.2 landscape video cards at a time to cue swiping.
- **Tablet (768px - 1024px):** 8-column layout. Carousels display 3.5 cards.
- **Desktop & Smart TV (> 1024px):** 12-column structure with fixed side navigation dock. Rows accommodate 5 to 6 poster cards with arrow navigation overlays on hover.

### Spacing Rhythm
- Section headings maintain a `space-sm` gap to their carousel track.
- Vertical space between discrete media carousels is set to `space-xl` to prevent accidental clicks when browsing titles.

## Elevation & Depth

Visual depth is achieved through ambient glass overlays, deep layered backdrops, and saturated perimeter glows, eliminating heavy flat drop shadows.

### Elevation Planes
- **Ground (Z0):** `#0B0B0D` with hero backdrops that seamlessly fade into the background via multi-stop linear and radial alpha masks.
- **Rail/Carousel Level (Z1):** Default resting state for poster and 16:9 cards. Soft ambient glow when focused or hovered (`rgba(139, 92, 246, 0.35)` with 24px blur).
- **Glass Floating Overlays (Z2):** Floating header navigation, media control toolbars, and episode drawers use frosted glass: background `#1A1A24` at 65% opacity, backdrop blur of 20px, and a subtle upper-edge border of `rgba(255, 255, 255, 0.08)`.
- **Modals & Spotlight Previews (Z3):** Darkened background scrim (`rgba(11, 11, 13, 0.85)`) with card elements utilizing elevated specular borders (`rgba(168, 85, 247, 0.25)`).

## Shapes

The interface embraces a modern, friendly rounded profile (`roundedness: 2`). This geometry removes the strictness of adult streaming platforms, providing a welcoming touch that is naturally resistant to harsh corners.

### Component Radii
- **Thumbnail & Poster Cards:** 16px corner radius (`rounded-lg`) creates soft, picture-frame borders that protect artwork margins.
- **Pills, Badges & Age Ratings:** Fully rounded pill radius for instant glanceability.
- **Interactive Action Buttons:** 12px to 16px radius, matching the curvature of adjacent media cards.
- **Video Player Interface:** Bottom play-bar and floating quick-action docks feature 24px corner radii.

## Components

### Hero Billboard & Spotlight
- Full-bleed or inset banner with a gentle vertical gradient fade to canvas (`to bottom, transparent 60%, #0B0B0D 100%`).
- Includes title art logo, concise logline, celestial star ratings, and dual CTAs: Primary "Assistir Agora" (Play) and secondary "Mais Informações" (More Info).

### Media Cards & Carousels
- **Vertical Posters (2:3 aspect ratio):** Reserved for movies, cartoon series covers, and scripture journeys. Smooth scale up (`scale(1.05)`) on hover/focus with a gentle violet ambient halo.
- **Landscape Thumbnails (16:9 aspect ratio):** Used for individual episodes and "Continuar Assistindo" (Continue Watching). 
- **Watch Progress Bar:** Embedded at the very bottom edge of 16:9 thumbnails; 4px height; background `rgba(255, 255, 255, 0.2)`; active progress fill in luminous purple (`#8B5CF6`) or celestial gold (`#F59E0B`).

### Buttons
- **Primary Play Button:** Solid white (`#FFFFFF`) with dark text (`#0B0B0D`) or solid purple (`#8B5CF6`) with white text. High contrast, bold weight, left-aligned play icon.
- **Glass Action Button:** Background `rgba(255, 255, 255, 0.12)`, border `1px solid rgba(255, 255, 255, 0.16)`, backdrop blur 16px. On hover: background `rgba(255, 255, 255, 0.22)`.
- **Icon Buttons (Favorite, Sound, Subtitles):** 44px circular glass buttons with high-contrast centered SVG glyphs.

### Badges & Metadata Chips
- **Content Rating ("Livre"):** Pill badge with green-emerald accent (`#10B981`) or glass violet, bold uppercase `label-badge`.
- **Faith & Virtue Badges:** Celestial gold pill (`#F59E0B`) with micro-icons (e.g., "Coragem", "Amor", "Família").
- **Quality Badges:** "HD", "4K", "Áudio Bíblico" in subtle translucent containers (`rgba(255, 255, 255, 0.08)`).

### Input Fields & Search
- Rounded surface with `#141419` fill, inner search icon in `#9CA3AF`, clear text inputs in `#FFFFFF`.
- On focus, border highlights with a smooth `#8B5CF6` glow ring.

### Kids Profile Switcher
- Playful circular avatars enveloped with distinct character borders. Active profiles feature an animated celestial pulse in brand violet.