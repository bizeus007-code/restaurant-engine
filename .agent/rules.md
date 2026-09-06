# UI/UX Pro Max & Motion Design Standards

## 1. Aesthetic Hierarchy (Obsidian & Champagne Gold)
- **Primary Background:** Deep obsidian space (`#09090b` / `bg-zinc-950`).
- **Surface Elevation:** Translucent dark obsidian cards (`#141417` / `bg-zinc-900/80` with `backdrop-blur-xl`).
- **Accent Tones:** Champagne Gold (`#d4af37`), warm amber hues (`#f59e0b`, `#fbbf24`), subtle incandescent glows (`shadow-[0_0_25px_rgba(212,175,55,0.15)]`).
- **Borders & Dividers:** Micron-thin luxury borders (`border-white/10` or `border-amber-500/20`).

## 2. Motion & Anti-Gravity Physics (motion/react)
- **Zero Gravity (Floating):** Continuous gentle sine-wave floating keyframes on featured items (`y: [0, -6, 0]`, smooth easeInOut curves).
- **Tactile Response:** Instant 3D perspective spring feedback on interaction (`whileTap={{ scale: 0.97, rotateX: 2 }}`).
- **Cinematic Transitions:** Shared layout morphing (`layoutId`) with physics-based spring curves (`stiffness: 350, damping: 28`) for opening dishes.
- **Glassmorphism:** Multi-layered backdrops with specular light reflection edges.

## 3. Ergonomics & Mobile-First UX
- **Thumb Zone Mastery:** Sticky floating bottom navigation bar within thumb reach.
- **Micro-Interactions:** Haptic visual cue states, allergen pills, calorie / preparation badges.
- **Cinematic Media:** Ultra-light, auto-looping silent video previews with graceful poster fallbacks.
- **AR / 3D Experience:** Interactive 3D inspection view toggle for true spatial visualization.
