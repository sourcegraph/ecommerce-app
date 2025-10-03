# Theme Structure

This theme is organized into a modular, maintainable structure following Chakra UI best practices.

## Directory Structure

```
theme/
├── index.ts                    # Main theme export
├── tokens.ts                   # Type-safe token exports for use in components
├── foundations/
│   ├── colors.ts              # Raw color palette (sand, ink, charcoal)
│   ├── semantic-tokens.ts     # Semantic color mappings (bg.page, text.primary, etc.)
│   ├── typography.ts          # Font families and text styles
│   └── spacing.ts             # Breakpoints, border radii, shadows
└── components/
    ├── button.ts              # Button component theme
    ├── input.ts               # Input component theme
    ├── form.ts                # Form components (Select, Textarea, Checkbox, Radio, Switch)
    ├── typography.ts          # Typography components (Heading, Text, Link)
    ├── layout.ts              # Layout components (Container)
    ├── feedback.ts            # Feedback components (Badge, Tag, Alert, Skeleton, Tooltip)
    ├── overlay.ts             # Overlay components (Modal, Drawer, Popover, Menu)
    └── tabs.ts                # Tabs component theme
```

## Usage Guidelines

### Preferred: Use Semantic Tokens

Always use semantic tokens instead of raw color values:

```tsx
// Good ✓
<Box bg="bg.page" color="text.primary" borderColor="border.subtle" />
<Button variant="accent">Add to Cart</Button>

// Also Good ✓ - Using exported constants
import { COLORS } from '@/theme/tokens';
<Box bg={COLORS.bg.page} color={COLORS.text.primary} />
```

### Avoid: Raw Color References

Don't use raw color values directly:

```tsx
// Bad ✗
<Box bg="sand.50" color="ink.900" borderColor="ink.200" />
<Box bg="#FAFAF9" color="#0B1220" />
```

### Button Variants

- `solid` - Primary actions (charcoal background)
- `accent` - Secondary CTAs (slate blue background)
- `outline` - Tertiary actions
- `ghost` - Minimal actions

```tsx
<Button variant="solid">Buy Now</Button>
<Button variant="accent">Add to Cart</Button>
<Button variant="ghost">Cancel</Button>
```

## Semantic Token Reference

### Background Colors

- `bg.page` - Page background (warm off-white)
- `bg.surface` - Card/surface backgrounds (white)
- `bg.card` - Card backgrounds
- `bg.subtle` - Subtle fill areas

### Text Colors

- `text.primary` - Primary text (ink.900)
- `text.secondary` - Secondary text (ink.500)
- `text.muted` - Muted text (ink.400)

### Border Colors

- `border.subtle` - Subtle borders (ink.200)
- `border.default` - Default borders (ink.300)

### Button Colors

- `button.primary.bg` - Primary button background (charcoal)
- `button.primary.hover` - Primary button hover
- `button.primary.active` - Primary button active
- `button.secondary.bg` - Secondary button background (slate blue)
- `button.secondary.hover` - Secondary button hover
- `button.secondary.active` - Secondary button active

### Focus States

- `focus.ring` - Focus ring color (ink.600)

## Shadows

- `card` - Default card shadow
- `cardHover` - Card hover shadow
- `header` - Header shadow
- `dropdown` - Dropdown/menu shadow
- `modal` - Modal shadow

## Border Radii

- `sm` - Small (6px)
- `md` - Medium (10px)
- `lg` - Large (14px)

## Breakpoints

- `sm` - 30em (480px)
- `md` - 48em (768px)
- `lg` - 62em (992px)
- `xl` - 80em (1280px)

## Adding New Components

To add a new component theme:

1. Create a new file in `components/` (e.g., `accordion.ts`)
2. Define the component style using Chakra's style config
3. Import and add to `components` object in `index.ts`

```ts
// components/accordion.ts
export const Accordion = {
  baseStyle: {
    container: {
      borderColor: "border.subtle",
    },
  },
};

// index.ts
import { Accordion } from "./components/accordion";

export default extendTheme({
  // ...
  components: {
    Accordion,
    // ...
  },
});
```

## Modifying Colors

1. **Raw colors**: Edit `foundations/colors.ts`
2. **Semantic mappings**: Edit `foundations/semantic-tokens.ts`
3. Update `tokens.ts` if adding new semantic tokens

This separation allows you to change the entire color scheme by just updating the semantic token mappings without touching component code.
