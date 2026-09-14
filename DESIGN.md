---
version: alpha
name: Moobi
description: A bright, friendly fintech and business-assistant system built around a vivid violet accent, clean white space, and bold Inter typography.
colors:
  primary: "#4A3AFF"
  secondary: "#6B5CEB"
  tertiary: "#8E79F5"
  neutral: "#FFFFFF"
  surface: "#F5F3FF"
  on-surface: "#212529"
  text: "#1C1B3A"
  border: "#E6E3F7"
  muted: "#6F6B88"
  success: "#2DBA7D"
  warning: "#FFB547"
  error: "#E5484D"
typography:
  headline-display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0px
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: 700
    lineHeight: 60px
    letterSpacing: 0px
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 700
    lineHeight: 50px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Inter
    fontSize: 25px
    fontWeight: 600
    lineHeight: 30px
    letterSpacing: 0px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 30px
    letterSpacing: 0px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: 0px
  body-md:
    fontFamily: Inter
    fontSize: 15.5px
    fontWeight: 400
    lineHeight: 27.125px
    letterSpacing: 0px
  body-sm:
    fontFamily: Inter
    fontSize: 14.4px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0px
  label-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0.04em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 18px
  xl: 28px
  full: 9999px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 50px
  xl: 68px
  gutter: 30px
  section: 96px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 14px 30px
    height: 51px
  button-primary-hover:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 14px 30px
    height: 51px
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 14px 30px
    height: 51px
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 0px
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 28px 26px
  input:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 14px 16px
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 6px 12px
  badge-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    size: 24px
---

# Moobi

## Overview
Moobi feels like a modern fintech assistant: optimistic, trustworthy, and lightly playful without losing professionalism. The interface is built for Indonesian consumers and small business users who need clarity around personal and business transactions. Visual density stays low, with generous white space, a large hero area, and a strong product-render focus that makes the app feel approachable and app-centric.

## Colors
- **Primary (#4A3AFF):** A vivid violet used for key actions, active states, navigation labels, and brand emphasis. It carries most of the visual identity and should be the default accent for calls to action and selected indicators.
- **Secondary (#6B5CEB):** A softer blue-violet used when the primary needs variation, especially for hover states or layered emphasis.
- **Tertiary (#8E79F5):** A lighter lavender tone for highlights, supporting gradients, and subtle decorative moments.
- **Neutral (#FFFFFF):** The dominant background color. White space is a core part of the brand and should remain the main canvas for content and imagery.
- **Surface (#F5F3FF):** A pale violet-tinted surface for section breaks, chips, and soft tonal layering beneath content.
- **On-surface (#212529):** The main dark text and icon color for body copy, controls, and card content.
- **Text (#1C1B3A):** A deep indigo-black suitable for prominent headlines where stronger contrast is needed.
- **Border (#E6E3F7):** A delicate lavender border used for cards, pills, and outlined buttons to keep the interface airy.
- **Muted (#6F6B88):** A subdued neutral-violet for helper text, tertiary labels, and less prominent copy.
- **Success (#2DBA7D):** A green accent for positive financial status, confirmations, and success badges.
- **Warning (#FFB547):** A warm amber accent for caution states and attention cues.
- **Error (#E5484D):** A clear red used sparingly for destructive actions and validation errors.

## Typography
Inter is the system typeface throughout, matching the clean, contemporary tone of the interface. Headlines are bold and compact, with `headline-display`, `headline-lg`, and `headline-md` carrying the brand’s strongest hierarchy; `headline-sm` and `title-lg` support section titles and supporting labels. Body text stays highly readable at 15.5px to 16px with relaxed line height, while labels use heavier weights for buttons, navigation, and status chips. Letter spacing is mostly neutral, with only the smallest label style using a slight spacing increase for crisp compact UI. Uppercase treatment appears in small navigation and section tags, but it should remain restrained and functional rather than decorative.

## Layout
The layout is spacious and centered, with a hero-first composition and clear horizontal breathing room. Content behaves like a wide desktop landing page rather than a dense dashboard, so sections should use generous outer padding and substantial vertical rhythm between blocks. Use the spacing scale consistently: 8px and 16px for small gaps, 24px for standard component separation, and 50px to 68px for major section spacing and hero-to-section transitions. Cards and panels should feel padded but not bulky, with internal spacing around 28px by 26px in featured containers. Rounded pill controls and floating decorative elements help maintain a soft, promotional feel.

## Elevation & Depth
The system is mostly flat, relying on contrast, whitespace, and subtle borders instead of heavy shadows. When depth is needed, use a gentle violet-tinted shadow for floating elements and a softer neutral shadow for large imagery or hero accents. Cards should prefer the thin `Border (#E6E3F7)` outline over strong elevation. Depth is also communicated through layered shapes, overlapping device mockups, and tonal background waves rather than through stacked surfaces.

## Shapes
The overall shape language is soft and friendly, with a clear preference for full pills on buttons and small circular indicators. Cards use a moderate `18px` radius to stay approachable while still feeling structured. Decorative blobs and hero shapes are organic, but interactive controls remain clean and simplified. This creates a balance between fintech credibility and a startup-style visual warmth.

## Components
Buttons are highly rounded and compact. Use `button-primary` for the main CTA: violet background, white text, 14px by 30px padding, and a 51px overall height. `button-primary-hover` can shift to the secondary violet for interactive feedback. `button-secondary` should stay outlined or transparent with dark text and a full pill radius for secondary actions like “Coba Gratis.” `button-link` is reserved for inline navigation or utility actions and should stay minimal and underlined.

Cards should use `card` with a white background, subtle lavender border, and `rounded.lg`. Keep card content calm and readable, with sufficient padding and little to no shadow. Inputs should match the card language: white background, soft radius, clear text color, and comfortable internal padding so forms feel easy on mobile.

Chips and badges should be compact, pill-shaped, and color-coded. Use `chip` for section tags or filters with a light surface background and primary text. `badge-active` works for active carousel dots or compact status markers, using the primary fill on white. Navigation links are simple, uppercase-friendly, and primarily text-based, with the active state leaning on the primary violet rather than heavy decoration.

## Do's and Don'ts
- Do keep the interface airy with generous whitespace and large content margins.
- Do use Inter with bold headlines and restrained body copy for clarity.
- Do favor violet accents for primary actions, active states, and brand highlights.
- Do use pill-shaped buttons and subtle borders to preserve the soft fintech feel.
- Don't introduce heavy shadows, dark panels, or dense card grids.
- Don't use multiple competing accent colors; the violet primary should dominate.
- Don't over-round every container into a pill; reserve full radius for controls and small indicators.
- Don't crowd the hero section with too many labels, badges, or decorative elements.