# Dig Dug Channel - Sprite Guide

This guide defines the image assets needed for the Dig Dug channel.

## Directory
All images should be placed in: `src/channels/dig-dug/images/`

---

## MINIMUM REQUIRED SPRITES (Start Here)

### Character
**Dimensions:** 24px width × 32px height

**Essential:**
- `character-right.png` - Character facing right (can be flipped for left)

**Notes:**
- Character stands on ground at y-position ~150px
- Should be recognizable as Dig Dug digger
- Will be flipped horizontally for left-facing

### Enemies
**Dimensions:** 16px × 16px (base size, will scale up during inflation)

**Essential:**
- `pooka.png` - Orange/red balloon enemy
- `fygar.png` - Green dragon enemy

**Notes:**
- Base sprites will be scaled larger during inflation animation
- Walk back and forth on the ground

### Collectibles
**Dimensions:** 16px × 16px

**Essential (pick 1-2):**
- `carrot.png` - Orange carrot

**Notes:**
- Start with just one type, can add variety later
- These spawn on ground when donations occur

### Background
**Dimensions:** 1092px × 332px (full channel size)

**Essential:**
- `ground-background.png` - Complete background with sky (top half) and ground (bottom half)

**Design:**
- **Top half (166px):** Sky - light blue (#5599ff)
- **Bottom half (166px):** Ground/dirt - brown (#8b6f47)
- **Ground line:** Horizontal line at y=166px

---

## OPTIONAL SPRITES (Add Later)

### Character (Additional States)
- `character-left.png` - Dedicated left-facing sprite
- `character-pump-right.png` - Pumping action facing right
- `character-pump-left.png` - Pumping action facing left

### Enemies (Inflation Stages)
- `pooka-inflate-1.png`, `pooka-inflate-2.png`, `pooka-inflate-3.png`
- `fygar-inflate-1.png`, `fygar-inflate-2.png`, `fygar-inflate-3.png`

### Collectibles (Variety)
- `turnip.png` - White/purple turnip
- `mushroom.png` - Brown/red mushroom
- `cucumber.png` - Green cucumber
- `eggplant.png` - Purple eggplant

## Color Palette Reference

For consistency with the placeholder graphics:

- **Sky Blue:** `#5599ff`
- **Dirt Brown:** `#8b6f47`
- **Dark Brown:** `#654321`
- **Character Blue:** `#4287f5`
- **Character Accent Red:** `#ff4444`
- **Pooka Orange:** `#ff8844`
- **Fygar Green:** `#44ff88`

## Technical Notes

- All sprites should have transparent backgrounds (PNG format)
- Pixel art style preferred (no anti-aliasing on edges)
- High contrast for visibility on stream
- Consider retro/arcade aesthetic to match Dig Dug theme

## Animation States

### Character:
- Walking left (animates between two frames if we add walk cycle)
- Walking right (animates between two frames if we add walk cycle)
- Pumping left (static while pumping)
- Pumping right (static while pumping)

### Enemies:
- Walking (can animate between frames)
- Inflating (progresses through 3 stages based on pump progress)
- Pop (handled by code effect, no sprite needed)

### Collectibles:
- Static (no animation needed)
