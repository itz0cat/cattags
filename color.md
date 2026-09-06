CatTags — Brand & UI Theme Specification

Use this exact visual identity throughout the CatTags Minecraft mod, web dashboard, backend dashboard, documentation, GitHub assets, and any future CatTags ecosystem UI.

Brand

Product name: CatTags

Brand/Creator: ItzCat

Mod ID: "cattags"

Tagline:

«Team identity, everywhere.»

Brand personality

CatTags should feel:

- Modern
- Clean
- Premium
- Competitive
- Minecraft-friendly
- PvP/community oriented
- Technical
- Fast
- Trustworthy

Avoid making the design overly cute despite the "Cat" name. The cat should primarily appear as a subtle mascot/logo element.

---

COLOR SYSTEM

Use the following colors as the official CatTags palette.

Primary

Electric Blue

"#3B82F6"

Use for:

- Primary buttons
- Active navigation
- Links
- Important UI elements
- Focus states
- Selected elements
- Main brand accents
- Progress indicators
- Interactive elements

---

Dark Primary

Deep Blue

"#1D4ED8"

Use for:

- Button hover states
- Active/pressed states
- Strong accents
- Dark blue gradients
- Important emphasis

---

Bright Primary

Light Blue

"#60A5FA"

Use for:

- Hover highlights
- Secondary accents
- Glow effects
- Highlighted text
- Icons
- Small visual details

---

Background

CatTags Night

"#080B12"

Use as the primary application background.

This should be the main background of:

- Web dashboard
- Configuration UI
- Documentation website
- Mod menus where possible

---

Surface

CatTags Surface

"#111827"

Use for:

- Cards
- Panels
- Menus
- Modals
- Navigation
- Settings sections
- Dashboard components

---

ADDITIONAL COLORS

Use these supporting colors to complete the design system.

Surface Elevated

"#172033"

Use for elements sitting above normal surfaces.

Examples:

- Dropdowns
- Tooltips
- Elevated cards
- Dialogs

---

Border

"#1F2937"

Use for subtle borders and separators.

Avoid bright borders unless an element is actively selected.

---

Border Active

"#3B82F6"

Use for:

- Focused inputs
- Selected cards
- Active settings
- Important interactive states

---

Primary Glow

Use the equivalent of:

"rgba(59, 130, 246, 0.25)"

for subtle blue glows.

Do NOT overuse glow effects.

The design should remain clean.

---

TEXT COLORS

Primary Text

"#F9FAFB"

Use for:

- Headings
- Important text
- Team names
- Primary information

---

Secondary Text

"#D1D5DB"

Use for:

- Normal body text
- Descriptions
- Secondary information

---

Muted Text

"#9CA3AF"

Use for:

- Hints
- Metadata
- Timestamps
- Disabled information

---

Disabled Text

"#6B7280"

Use for disabled controls.

---

STATUS COLORS

Do not use blue for every status.

Use distinct semantic colors.

Success

"#22C55E"

Warning

"#F59E0B"

Error

"#EF4444"

Info

"#38BDF8"

These should only be used where their semantic meaning is relevant.

---

BRAND GRADIENT

CatTags' official gradient:

"#1D4ED8 → #3B82F6 → #60A5FA"

Use primarily for:

- Logo
- Hero sections
- Major branding
- Marketing pages
- Special highlights

Do NOT use gradients on every button or piece of text.

---

OPTIONAL BLUE-CYAN GRADIENT

For special branding effects, this gradient may be used:

"#3B82F6 → #06B6D4"

This is optional and should be less common than the official blue gradient.

Use it for:

- Special promotional graphics
- Logo effects
- Rare premium visual elements

---

DESIGN RULES

Dark-first design

CatTags should be designed as a dark-first application.

The primary visual experience should use:

"#080B12"

as the background.

Do not make the interface look like a generic light-mode SaaS dashboard.

---

Blue should be an accent

Do not fill huge portions of the interface with blue.

Use blue strategically for:

- Actions
- Selection
- Branding
- Interactive elements
- Important information

The dark background should dominate.

---

UI STYLE

Use:

- Rounded corners
- Clean spacing
- Subtle borders
- Soft shadows
- Minimal gradients
- Small blue highlights
- Modern typography
- Clear hierarchy

Avoid:

- Excessive glassmorphism
- Excessive neon
- Excessive shadows
- Huge rounded cards everywhere
- Excessive animations
- Rainbow UI
- Generic AI-generated dashboard appearance

The interface should feel like a real established gaming infrastructure product.

---

CORNER RADIUS

Recommended:

Small

"6px"

For:

- Inputs
- Small buttons
- Tags

Medium

"10px"

For:

- Buttons
- Cards
- Panels

Large

"14px"

For:

- Major dashboard cards
- Modals
- Hero sections

Do not make everything extremely rounded.

---

TYPOGRAPHY

Use a modern sans-serif font.

Preferred:

Inter

Fallback:

"system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif"

For Minecraft-specific UI, respect Minecraft's native visual language where appropriate rather than forcing a web font into every Minecraft screen.

---

LOGO DIRECTION

Create a minimal CatTags logo combining:

1. A simplified cat silhouette/face
2. A Minecraft-style name tag/badge concept

The logo should be recognizable even at small sizes.

Avoid:

- Detailed cat illustrations
- Cartoon mascots
- Excessive gradients
- Complex shapes
- Generic paw icons

The cat should be subtle and modern.

Primary logo colors should use:

"#3B82F6"

with optional:

"#1D4ED8"

and

"#60A5FA"

---

ICON STYLE

Use simple modern icons.

Preferred characteristics:

- Minimal
- Geometric
- Consistent stroke width
- Easy to recognize at small sizes

Icons should generally use:

"#9CA3AF"

and become:

"#3B82F6"

when active.

---

MINECRAFT TEAM TAG STYLE

The in-game team tag should remain visually readable and unobtrusive.

Example:

"[NOVA] ItzCat"

Default CatTags styling:

- Prefix: "#3B82F6"
- Player name: normal Minecraft name color
- Optional logo: small and subtle

Do not make team tags so large that they obstruct gameplay.

---

TEAM COLORS

IMPORTANT:

The official CatTags brand colors are NOT restrictions on registered teams.

Teams should be able to choose their own:

- Primary color
- Secondary color
- Gradient
- Logo

For example:

NOVA:

"#3B82F6 → #06B6D4"

VOID:

"#8B5CF6 → #EC4899"

FROST:

"#67E8F9 → #E0F2FE"

etc.

CatTags itself should remain blue-themed.

---

ANIMATION

Animations should be subtle.

Use approximately:

"120ms – 250ms"

for UI transitions.

Examples:

- Button hover
- Navigation changes
- Modal opening
- Dropdowns
- Preview updates

Avoid excessive bouncing, scaling, or flashy animations.

Minecraft rendering should prioritize performance over animation.

---

ACCESSIBILITY

Maintain sufficient contrast.

Do not rely solely on color to communicate state.

For example:

Instead of:

🔵 = verified

also provide:

✓ Verified

Team tags should remain readable for users with color-vision deficiencies.

---

RESPONSIVE WEB DESIGN

The dashboard must work on:

- Desktop
- Laptop
- Tablet
- Mobile

Do not simply shrink the desktop UI.

Navigation should adapt appropriately.

---

COMPONENT STYLE

Create reusable components for:

- Buttons
- Inputs
- Selects
- Cards
- Modals
- Dropdowns
- Tabs
- Team badges
- Team previews
- Status indicators
- Toast notifications
- Tables
- Avatar/logo components

All components must use the CatTags design tokens.

Do not hard-code random colors throughout the project.

Create centralized theme variables/tokens.

---

CSS DESIGN TOKENS

Use variables similar to:

--ct-primary: #3B82F6;
--ct-primary-dark: #1D4ED8;
--ct-primary-bright: #60A5FA;

--ct-background: #080B12;
--ct-surface: #111827;
--ct-surface-elevated: #172033;

--ct-border: #1F2937;
--ct-text: #F9FAFB;
--ct-text-secondary: #D1D5DB;
--ct-text-muted: #9CA3AF;
--ct-text-disabled: #6B7280;

--ct-success: #22C55E;
--ct-warning: #F59E0B;
--ct-error: #EF4444;
--ct-info: #38BDF8;

Use the same conceptual tokens throughout the project even if the implementation technology differs.

---

BRAND CONSISTENCY

The following should always feel like the same product:

- Minecraft mod
- Mod configuration screen
- Web dashboard
- Team registration page
- Team profile
- Backend admin panel
- GitHub README
- Documentation
- Error pages
- Login page
- Release pages

The visual language should remain consistent.

---

OVERALL VISUAL TARGET

The final result should feel like:

A professional Minecraft PvP/community infrastructure platform with a premium dark UI and electric-blue identity.

Think:

Minecraft + modern esports + developer infrastructure

rather than:

cute cat gaming website.

The primary visual identity is:

"#3B82F6"

on:

"#080B12"

with supporting:

"#1D4ED8"

and

"#60A5FA".

Keep the design restrained, premium, and recognizable.
