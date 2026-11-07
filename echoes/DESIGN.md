---
{
  "name": "Elsewhere",
  "description": "A modern park field guide for familiar feelings in new places.",
  "colors": {
    "green": "#2d6048",
    "green-dark": "#224c39",
    "mint": "#e8efe6",
    "paper": "#f7f9f6",
    "white": "#fff",
    "ink": "#233d32",
    "muted": "#64746a",
    "line": "#dfe5dc",
    "water": "#d6e5e5",
    "supporting-copy": "#586b54",
    "map-key-ink": "#566f54",
    "quality-fill": "#e6eee0",
    "quality-ink": "#385733",
    "chip-fill": "#f0f4eb",
    "chip-ink": "#637b55",
    "secondary-fill": "#edf2e6",
    "secondary-ink": "#4b6a3d",
    "dialog-surface": "#fbfcf8",
    "focus": "#789e77"
  },
  "typography": {
    "display": {
      "fontFamily": "Manrope, sans-serif",
      "fontSize": "48px",
      "fontWeight": 500,
      "lineHeight": "1",
      "letterSpacing": "-0.04em"
    },
    "headline": {
      "fontFamily": "Manrope, sans-serif",
      "fontSize": "30px",
      "fontWeight": 550,
      "lineHeight": "36px",
      "letterSpacing": "-0.03em"
    },
    "title": {
      "fontFamily": "Manrope, sans-serif",
      "fontSize": "20px",
      "fontWeight": 600,
      "lineHeight": "28px",
      "letterSpacing": "-0.03em"
    },
    "section": {
      "fontFamily": "Manrope, sans-serif",
      "fontSize": "16px",
      "fontWeight": 650,
      "lineHeight": "24px",
      "letterSpacing": "-0.02em"
    },
    "body": {
      "fontFamily": "Manrope, sans-serif",
      "fontSize": "14px",
      "fontWeight": 400,
      "lineHeight": "20px"
    },
    "body-large": {
      "fontFamily": "Manrope, sans-serif",
      "fontSize": "16px",
      "fontWeight": 400,
      "lineHeight": "24px"
    },
    "label": {
      "fontFamily": "Manrope, sans-serif",
      "fontSize": "12px",
      "fontWeight": 500,
      "lineHeight": "16px"
    },
    "note": {
      "fontFamily": "Manrope, sans-serif",
      "fontSize": "12px",
      "fontWeight": 400,
      "lineHeight": "20px"
    }
  },
  "rounded": {
    "small": "4px",
    "control": "8px",
    "surface": "12px",
    "dialog": "16px",
    "circle": "50%"
  },
  "spacing": {
    "4": "4px",
    "8": "8px",
    "12": "12px",
    "16": "16px",
    "24": "24px",
    "32": "32px",
    "40": "40px",
    "48": "48px"
  },
  "components": {
    "button-primary": {
      "backgroundColor": "{colors.green}",
      "textColor": "{colors.white}",
      "rounded": "{rounded.control}",
      "padding": "12px 24px",
      "height": "48px"
    },
    "button-primary-hover": {
      "backgroundColor": "{colors.green-dark}",
      "textColor": "{colors.white}"
    },
    "button-secondary": {
      "backgroundColor": "{colors.secondary-fill}",
      "textColor": "{colors.secondary-ink}",
      "rounded": "{rounded.control}",
      "padding": "12px 16px",
      "height": "48px"
    },
    "button-text": {
      "textColor": "{colors.green}",
      "padding": "4px 0"
    },
    "button-icon": {
      "backgroundColor": "{colors.white}",
      "textColor": "#61795e",
      "rounded": "{rounded.control}",
      "height": "40px",
      "width": "40px"
    },
    "field": {
      "textColor": "#263d2f",
      "padding": "0",
      "typography": "{typography.body-large}"
    },
    "nav-item": {
      "textColor": "#6a776e",
      "rounded": "{rounded.control}",
      "padding": "8px 16px",
      "height": "40px"
    },
    "nav-item-selected": {
      "backgroundColor": "{colors.mint}",
      "textColor": "{colors.green-dark}"
    },
    "quality": {
      "backgroundColor": "#f9fbf7",
      "textColor": "#61735e",
      "rounded": "{rounded.control}",
      "padding": "12px 16px",
      "height": "48px"
    },
    "quality-selected": {
      "backgroundColor": "{colors.quality-fill}",
      "textColor": "{colors.quality-ink}"
    },
    "quality-chip": {
      "backgroundColor": "{colors.chip-fill}",
      "textColor": "{colors.chip-ink}",
      "rounded": "{rounded.small}",
      "padding": "4px 8px"
    },
    "result-card": {
      "backgroundColor": "{colors.white}",
      "textColor": "{colors.ink}",
      "rounded": "{rounded.surface}"
    },
    "dialog": {
      "backgroundColor": "{colors.dialog-surface}",
      "textColor": "{colors.ink}",
      "rounded": "{rounded.dialog}",
      "width": "min(560px, calc(100% - 32px))"
    }
  }
}
---

# Design System: Elsewhere

## Overview

**Creative North Star: "The Modern Park Field Guide"**

Elsewhere borrows the calm clarity of modern park visitor guides: pine green ink, a mist-green shell, pale blue map water, real place photography, and Manrope throughout. Its tone is welcoming and curious; controls remain recognizable and labels stay compact.

The system is a working guide. Borders, restrained tonal fills, and clear typography organize comparison without competing with geography or photographs. Motion marks interaction and loading, while reduced-motion preferences remove travel and breathing effects.

**Key Characteristics:**
- Pine green actions and ink on cool, lightly tinted surfaces.
- One Manrope family, compact labels, and generous principal headings.
- Real place photography and maps carry the sense of location.
- Familiar inputs, buttons, tabs, cards, and centered native dialogs.

## Colors

The palette uses pine greens for action and selection, cool near-whites for surfaces, and pale blue-green water for geographic context. The frontmatter is the normative color source.

### Primary

- **Pine Green** (`green`): filled primary actions, text actions, input carets, and the brand compass.
- **Deep Pine** (`green-dark`): primary hover and selected navigation text.
- **Mist Green** (`mint`): selected navigation and source suggestion hover.
- **Quality Green** (`quality-fill`, `quality-ink`): selected preference surfaces and their text.
- **Quiet Leaf** (`chip-fill`, `chip-ink`): compact shared-quality labels.
- **Soft Leaf** (`secondary-fill`, `secondary-ink`): secondary actions.

### Neutral

- **Cool Paper** (`paper`): the page shell.
- **White** (`white`): cards, search fields, and floating controls.
- **Pine Ink** (`ink`): body and principal heading text.
- **Muted Ink** (`muted`): ordinary secondary descriptions, including the introductory subtitle.
- **Guide Line** (`line`): shared dividers and shell boundaries; individual component borders use closely related authored tints.
- **Map Water** (`water`): the map canvas fallback. Google map styling has its own pale-water and land tints in the map component.
- **Supporting Copy** (`supporting-copy`): final reviewed text for the introductory aside, empty states, information dialog lead paragraphs, and collection-note paragraphs.
- **Map Key Ink** (`map-key-ink`): final reviewed map legend text.
- **Dialog Paper** (`dialog-surface`): softly tinted modal interiors.
- **Focus Green** (`focus`): visible keyboard focus outlines.

**The Green State Rule.** Use deeper green for primary actions and pale green for selected controls; retain text or icon state cues alongside color.

**The Supporting Copy Rule.** Use the final supporting-copy and map-key-ink tokens for their assigned roles; do not restore the lighter values replaced by the finish review.

## Typography

**Display Font:** Manrope, with a sans-serif fallback.
**Body Font:** Manrope, with a sans-serif fallback.

The single family gives the interface a clear, contemporary guidebook character. Heading letter spacing tightens gently while small labels remain plain sentence case. The wordmark is heavier than ordinary headings.

### Hierarchy

- **Display:** principal app heading; desktop role uses the frontmatter display token, then becomes (36px / 40px) at the (1250px) breakpoint.
- **Headline:** information dialog heading; place detail headings use the same scale with a firmer weight (600), becoming (24px / 32px) on mobile.
- **Title:** result-section and empty-state headings. The source title uses a firmer weight (650); mobile result-card titles use the title scale.
- **Section:** preference and compact result-card headings.
- **Body:** ordinary interface copy; detail paragraphs relax to a (24px) line height.
- **Body Large:** introductory and detail descriptions; search values use this size with weight (600).
- **Label:** compact field labels; buttons and navigation vary weight by emphasis.
- **Note:** explanatory hints, footnotes, and compact descriptions.

**The Working Guide Rule.** Use Manrope for both headings and controls. Keep the large heading light enough to feel inviting and the small interactive labels firm enough to scan.

## Layout

The desktop shell is centered with a maximum width (1536px), a header (80px), horizontal gutters (48px), and main top padding (40px). The search bar uses three columns (1.15fr 1fr auto). The workspace pairs a fixed source sidebar (280px) with a flexible discovery area and a gap (32px). Results use three equal columns with gaps (16px). Most internal spacing is drawn from the frontmatter scale, particularly (8px), (12px), (16px), and (24px).

At widths up to (1250px), gutters reduce to (32px), the sidebar to (256px), and the workspace gap to (24px). At widths up to (1000px), the sidebar is (240px), results use two columns with the last card spanning both, and the search action moves to its own row.

At widths up to (760px), gutters are (24px), the header is (72px), search and workspace become single columns, preferences form a two-column grid, and result cards stack. The source card becomes a compact image-and-copy row; phone preferences retain a minimum height (44px). Header actions disappear, but navigation remains. At widths up to (400px), header gutters reduce to (16px). Footer content wraps. Desktop map heights range from (320px) to (400px); the phone map is (300px).

The alternate list layout pairs an image column with content: (240px) on wide screens, (160px) at the intermediate breakpoint, and (104px) on phones. Native dialogs remain centered with `margin: auto` and `inset: 0`; they fit within the viewport and scroll internally.

## Elevation & Depth

The resting interface is mostly flat: cool paper, white surfaces, green selection fills, and fine borders supply separation. Soft translucent shadows identify floating or interactive layers. The search bar has a near-imperceptible ambient shadow, cards lift slightly on hover, and dialogs have the strongest shadow plus a dark translucent backdrop. Exact shadows and motion values are recorded in the sidecar.

**The Quiet Depth Rule.** Keep cards largely flat at rest. Use a soft shadow for hover, an anchored menu, a toast, or a modal rather than adding permanent decorative lift.

## Shapes

Small labels, checkboxes, and compact view tabs use the small radius. Buttons, navigation items, map tools, and preference controls use the control radius. Search, cards, map shells, and notices use the surface radius. Dialogs use the dialog radius on desktop and the surface radius on phones. Circular save controls and map pin dots make discrete actions and geographic points easy to recognize.

Cards clip their cover photography at the same outer radius. Borders stay thin (1px); active result cards add a quiet outline rather than changing the whole surface. These shapes support ordinary web controls rather than disguising them as physical objects.

## Components

### Buttons

Primary actions are filled Pine Green with white text, an inline icon, and a control radius. Their standard minimum height is (48px), with padding (12px 24px); the wide-screen search action is (56px) tall. Hover deepens the fill. Secondary actions use Soft Leaf with a light border and padding (12px 16px). Text actions use Pine Green and an underline on hover. Icon buttons are square (40px), white, and softly bordered; map tools become (32px) on phones.

All button-like controls use visible focus with an outline offset (4px). Ordinary focus outlines are (3px), fields use (2px), and enabled press states move down (1px). Color and surface transitions use the shared easing over (200ms). Disabled search actions use a muted green and the loading label.

### Chips

Shared-quality chips are informational, compact, and softly filled, with a small radius and padding (4px 8px). They pair a short text label with a small icon. Preference choices are separate full-width toggle buttons with checks and pressed state; selection changes both fill and border. A minimum of one preference remains selected.

### Cards / Containers

Place cards use white backgrounds, thin pale borders, the surface radius, cover photography, and compact content padding (16px, or 12px in the intermediate desktop layout). Hover adds a soft shadow and firmer border. The active card adds a green border and faint outer ring. Result photos use a gentle scale effect (1.04) over (700ms); the image remains clipped. Image failure produces a calm geographic fallback rather than a broken image element.

### Inputs / Fields

The source combobox and destination select share a white search container and visible labels. Input values are green-black, with minimal individual chrome and an explicit focus outline. A divider separates fields horizontally on desktop and vertically on phones. Source suggestions use a bordered white floating list, a surface radius, and Mist Green hover or keyboard highlight. The error notice uses a distinct pale warm background and readable brown text.

### Navigation

Navigation uses compact icon-and-text buttons, a control radius, and a minimum height (40px). The selected item uses Mist Green with Deep Pine text; hover uses the same pale surface. Labels remain visible on phones, while the smallest breakpoint removes their icons. The map/list switch uses a tinted rail and a white pressed segment with a small shadow.

### Map and dialogs

Geographic lines connect the source to results; selecting a result emphasizes its map point and card. The sample Leaflet map uses dashed connections, numbered result dots, and a lighter source dot. The Google map uses its own map-native points and lines. Phone map pins omit the place-name badge to preserve space. Map tools remain ordinary labeled buttons and attribution remains visible.

Dialogs use native modal behavior, a close button, a dark translucent backdrop, and viewport-bound scrolling. The standard width caps at (560px), place-detail dialogs at (680px), and mobile detail actions stack. Information content uses padding (40px), detail content (32px), with smaller phone insets. Toasts use a dark green fill, light text, a surface radius, and a brief upward entrance; loading cards use a soft opacity pulse. Reduced-motion preferences collapse animation and transition durations and remove smooth scrolling.

## Do's and Don'ts

### Do:

- Do use real place photography with cover crops and keep map and photograph attributions available.
- Do pair selected green fills with explicit labels, checks, pressed state, or active outlines.
- Do preserve visible keyboard focus, native dialog dismissal, and reduced-motion behavior.
- Do reflow the workspace and result cards at the observed breakpoints instead of shrinking desktop controls into the phone layout.

### Don't:

- Don't restore the superseded lighter supporting-copy or map-key text colors.
- Don't use a display family different from Manrope for new app surfaces.
- Don't use shadows as the main boundary between resting cards; retain the light border and tonal hierarchy.
- Don't hide geographic attribution or replace a place photograph with decorative artwork when a real image is available.
