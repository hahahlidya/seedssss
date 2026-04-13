# Design System Strategy: Industrial Precision

## 1. Overview & Creative North Star: "The Kinetic Monolith"
This design system is built for the high-stakes world of heavy machinery and industrial engineering. Our Creative North Star is **"The Kinetic Monolith."** We move away from the "web-app-in-a-browser" look and toward a custom, high-fidelity control interface. 

The aesthetic is characterized by **Structural Asymmetry** and **Tonal Depth**. Instead of a standard grid, we use wide, breathing margins juxtaposed with dense, technical data clusters. We break the "template" feel by overlapping glassmorphic overlays across container boundaries, mimicking the heads-up displays (HUDs) of precision hardware. Every element should feel machined, heavy, and intentional.

---

## 2. Colors: High-Contrast Utility
The palette is rooted in deep, slate-heavy neutrals with high-visibility "Safety" accents. 

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning. Structural boundaries must be defined solely through background shifts. For instance, a `surface_container_low` card should sit on a `surface` background to create a "machined" inset look. 

### Surface Hierarchy & Nesting
Treat the UI as a physical assembly.
- **Base Layer:** `surface` (#111316) or `surface_dim`.
- **Primary Modules:** `surface_container` (#1e2023).
- **Interactive Insets:** Use `surface_container_lowest` for areas where users input data, creating a "carved out" technical feel.
- **Signature Textures:** For main CTAs and Hero sections, use a linear gradient from `primary` (#a3c9ff) to `primary_container` (#1493ff) at a 135-degree angle. This adds a metallic sheen that flat colors lack.

### The "Glass & Gradient" Rule
Use Glassmorphism for floating diagnostics and modal overlays. Apply `surface_container_high` with 60-80% opacity and a `20px` backdrop blur. This ensures the "industrial" background is never lost, maintaining a sense of spatial awareness within the machine’s OS.

---

## 3. Typography: Technical Authority
We pair the geometric precision of **Space Grotesk** for high-level data with the neutral legibility of **Inter** for functional readouts.

- **Display & Headlines (Space Grotesk):** Used for critical machine states and large-scale telemetry. The wide apertures and technical character of Space Grotesk communicate "Advanced Engineering."
- **Body & Labels (Inter):** Used for everything else. Inter’s tall x-height ensures readability even in high-vibration environments or low-light conditions.
- **The Hierarchy Strategy:** Use `label_sm` in all-caps with `0.05em` letter spacing for technical metadata (e.g., SERIAL NO, RPM, TEMP). This mimics industrial plate engraving.

---

## 4. Elevation & Depth: Tonal Layering
We do not use drop shadows to create "pop"; we use them to simulate environmental light.

- **The Layering Principle:** Depth is achieved by "stacking." A `surface_container_high` module placed on a `surface` background creates an immediate perception of elevation without a single line of CSS shadow.
- **Ambient Shadows:** For floating elements like tooltips or modals, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)`. The shadow color must be a tinted version of the background, never pure black.
- **The "Ghost Border" Fallback:** If a container requires a boundary (e.g., in high-density data grids), use the `outline_variant` token at **15% opacity**. This is a "Ghost Border"—it suggests a limit without interrupting the visual flow.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`). Use `rounded_md` (0.375rem) to maintain a "tooled" edge. 
- **Secondary:** Transparent background with a `Ghost Border` and `on_surface` text. 
- **States:** On hover, the `surface_tint` should create a subtle "inner glow" effect.

### Input Fields
- **Styling:** Use `surface_container_lowest` for the field background. Forbid 100% opaque borders; use a bottom-only `outline` at 30% opacity that illuminates to `primary` when focused.
- **Feedback:** Errors must use `error` (#ffb4ab) with a subtle `error_container` glow.

### Cards & Telemetry Blocks
- **Forbid Dividers:** Never use `<hr>` or border-top. Use **Spacing Scale 8** (1.75rem) to separate content groups.
- **Structure:** Use `surface_container_low` for the card body and `surface_container_high` for the header to create a "unibody" look.

### Industrial-Specific Components
- **The "Status Beacon":** A small, circular chip using `secondary` (Industrial Orange) for warnings or `primary` (Electric Blue) for active states. It should have a soft `2px` outer glow (bloom) to simulate an LED.
- **Data Scrubber:** A custom slider with a `surface_bright` track and a `primary` thumb. Use `glassmorphism` for the value tooltip that appears on drag.

---

## 6. Do’s and Don’ts

### Do:
- **Use Asymmetric Layouts:** Place high-level stats (Display LG) off-center to create a dynamic, modern editorial feel.
- **Leverage the Spacing Scale:** Use `24` (5.5rem) for section breathing room to maintain a "premium" feel.
- **Embrace Mono-spacing:** Use `label_sm` for numerical data to ensure columns align perfectly in technical readouts.

### Don’t:
- **Don’t use Rounded Full:** Except for status pips. Buttons and containers should stay between `sm` and `lg` to feel like hardware, not a toy.
- **Don’t use 100% White:** Always use `on_surface` (#e2e2e6) for text. Pure white is too harsh against a `111316` background and causes visual fatigue.
- **Don’t Over-shadow:** If the background shift does the job, delete the shadow. Shadows are for "floating" objects, not "sitting" objects.