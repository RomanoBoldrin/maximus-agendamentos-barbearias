# Design System Document: Rustic Precision

## 1. Overview & Creative North Star

### Creative North Star: "The Modern Craftsman"

This design system rejects the sterile, overly-rounded aesthetics of generic SaaS platforms. Instead, it embraces the "Modern Craftsman" philosophy—a visual identity that feels as sharp as a straight razor and as warm as a leather barber’s chair. It is an editorial-first approach to a digital utility, blending the rugged textures of a traditional barbershop with the high-contrast precision of a premium booking system.

**Editorial Execution:**
We break the "template" look through intentional asymmetry. Elements are not merely placed; they are "anchored." We utilize heavy-weight serif headlines, a strictly rectangular geometry (0px border radius), and a sophisticated dark-mode palette that uses earthy depth rather than flat blacks.

---

## 2. Colors & Surface Philosophy

The palette is rooted in the "Grub-box" aesthetic—rich, tobacco-stained browns, weathered golds, and deep, oaken blacks.

### The "No-Line" Rule

To achieve a premium, high-end feel, **1px solid borders for sectioning are strictly prohibited.** Boundaries must be defined through background color shifts. For example:

- A `surface-container-low` section sitting against a `background` page.
- A `surface-container-high` card nested within a `surface-container-low` section.

### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers of leather and wood.

- **Surface (`#16130c`):** The foundation of the shop.
- **Surface Container Lowest (`#110e08`):** Deep "carved-in" areas, used for inactive states or background wells.
- **Surface Container High (`#2d2a22`):** Primary card surfaces that need to "pop" from the background.
- **Surface Container Highest (`#38342c`):** Interactive hover states or "floating" top-tier elements.

### The "Glass & Gradient" Rule

While the theme is rustic, we maintain modernity through subtle Glassmorphism. For floating navigation or modal overlays, use a semi-transparent `surface` color with a `backdrop-filter: blur(12px)`. To provide "visual soul," primary CTAs should use a subtle linear gradient from `primary` (#e9c349) to `on_primary_container` (#b39016).

---

## 3. Typography

Typography is our primary tool for authority. We pair the intellectual weight of a serif with the utilitarian clarity of a sans-serif.

- **Display & Headline (Newsreader):** A classic, rugged serif. Use `display-lg` for hero statements. It should feel editorial, like a headline in a high-end lifestyle magazine. High-contrast and bold.
- **Title & Body (Work Sans):** A clean, architectural sans-serif. It provides a technical counterpoint to the organic feel of the serif, ensuring booking times and prices are instantly legible.
- **Labels:** Use `label-md` in all-caps with a `0.05em` letter-spacing for a "stamped" leather feel on small metadata.

---

## 4. Elevation & Depth

In this system, elevation is a function of light and tone, not shadows.

- **The Layering Principle:** Depth is achieved by stacking. A `surface-container-high` element should be placed on a `surface` background to create a natural, soft lift.
- **Ambient Shadows:** If a floating effect is required (e.g., a service selection modal), use an ultra-diffused shadow: `box-shadow: 0 20px 50px rgba(17, 14, 8, 0.4)`. The shadow color is never grey; it is a darkened tint of the background wood tones.
- **The "Ghost Border" Fallback:** For accessibility in forms, use the `outline_variant` (#504442) at 20% opacity. Never use a 100% opaque border.
- **Hard Angles:** Every corner in the system is set to `0px`. This communicates precision and a "custom-built" feel.

---

## 5. Components

### Buttons

- **Primary:** `primary` background with `on_primary` text. Hard 0px corners. Use a 2px offset "ghost shadow" of the same color on hover to simulate a tactile press.
- **Secondary:** `surface-container-high` background with `on_surface` text.
- **Tertiary:** No background. Bold `primary` text with an underline that appears only on hover.

### Input Fields

- **Styling:** Use `surface-container-lowest` as the fill. The bottom border should be a 2px solid `outline-variant` that transitions to `primary` on focus.
- **Typography:** Labels use `label-md` in `primary` color for high visibility.

### Cards & Appointment Slots

- **Rule:** Forbid divider lines. Use `surface-container-low` for the card and `surface-container-high` for the "active" or "selected" slot.
- **Spacing:** Use generous vertical white space (32px+) to separate distinct service categories (Haircuts vs. Beard Trims).

### Chips (Service Tags)

- **Visuals:** Rectangular blocks using `secondary_container` with `on_secondary_container` text. These should look like small brass or copper plaques.

### Custom Component: "The Razor's Edge" Divider

Instead of a horizontal line, use a 4px wide vertical pillar of `primary` color to the left of `headline-sm` elements to denote section starts.

---

## 6. Do's and Don'ts

### Do

- **Do** use asymmetrical layouts. If an image is on the right, let the text on the left breathe with wide margins.
- **Do** use `Newsreader` for any text that is meant to be "read" (storytelling, brand value).
- **Do** use tonal shifts to define hierarchy. A darker section is more foundational; a lighter section is more interactive.

### Don't

- **Don't** use border-radius. Even a 2px radius breaks the "Maximus" brand integrity.
- **Don't** use pure white (#FFFFFF). All "white" text should be `on_surface` (#e9e1d6) to maintain the warm, rustic atmosphere.
- **Don't** use standard "Material Design" shadows. They feel too digital and "floaty" for this grounded, earthy brand.
- **Don't** use 1px dividers. They create visual noise that detracts from the premium editorial feel.
