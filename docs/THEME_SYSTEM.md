# Comprehensive Theme System Documentation

## Overview

The Jenga app features a comprehensive theme system with **Bitcoin yellow (#F7931A) theming** and **full dark mode support**. The system ensures consistent styling across all components while maintaining excellent accessibility and user experience.

## 🎨 Color Palette

### Bitcoin-Themed Colors
- **Bitcoin Orange**: `#F7931A` (hsl(27, 87%, 54%))
- **Bitcoin Light**: Lighter variant for hover states
- **Bitcoin Dark**: Darker variant for active states
- **Bitcoin Muted**: Subtle background variant

### Theme Variables

#### Light Mode
```css
:root {
  --bitcoin: hsl(27, 87%, 54%);
  --bitcoin-foreground: hsl(0, 0%, 100%);
  --bitcoin-light: hsl(27, 87%, 64%);
  --bitcoin-dark: hsl(27, 87%, 44%);
  --bitcoin-muted: hsl(27, 87%, 94%);
  --shadow-bitcoin: hsl(27, 87%, 54%, 0.1);
  --shadow-bitcoin-strong: hsl(27, 87%, 54%, 0.2);
}
```

#### Dark Mode
```css
.dark {
  --bitcoin: hsl(27, 87%, 54%); /* Same as light */
  --bitcoin-foreground: hsl(0, 0%, 100%);
  --bitcoin-light: hsl(27, 87%, 64%);
  --bitcoin-dark: hsl(27, 87%, 44%);
  --bitcoin-muted: hsl(27, 87%, 8%);
  --shadow-bitcoin: hsl(27, 87%, 54%, 0.15);
  --shadow-bitcoin-strong: hsl(27, 87%, 54%, 0.25);
}
```

## 🔧 Component Theming

### Button Variants

#### Standard Variants
- `default` - Primary Bitcoin orange button
- `outline` - Outlined button with Bitcoin hover effects
- `ghost` - Transparent button with Bitcoin hover effects
- `secondary` - Muted background button

#### Bitcoin-Specific Variants
- `bitcoin` - Full Bitcoin orange styling with shadows
- `bitcoin-outline` - Bitcoin orange outline with hover effects
- `bitcoin-ghost` - Transparent with Bitcoin orange text

```typescript
// Usage examples
<Button variant="bitcoin">Create Group</Button>
<Button variant="bitcoin-outline">Browse Groups</Button>
<Button variant="bitcoin-ghost">Learn More</Button>
```

### Badge Variants

#### Standard Variants
- `default` - Primary Bitcoin orange badge
- `secondary` - Muted background badge
- `outline` - Outlined badge with theme-aware borders

#### Bitcoin-Specific Variants
- `bitcoin` - Full Bitcoin orange styling
- `bitcoin-outline` - Bitcoin orange outline
- `bitcoin-muted` - Subtle Bitcoin-themed background

```typescript
// Usage examples
<Badge variant="bitcoin">Active</Badge>
<Badge variant="bitcoin-outline">Pending</Badge>
<Badge variant="bitcoin-muted">Completed</Badge>
```

### Card Enhancements
- Enhanced shadows with hover effects
- Dark mode shadow adjustments
- Smooth transitions for theme switching

### Input Enhancements
- Bitcoin orange focus rings
- Theme-aware border colors
- Smooth hover transitions

## 🌙 Dark Mode Implementation

### Theme Provider
The app uses a custom theme provider that supports:
- **Light mode**
- **Dark mode** 
- **System preference** (automatic)

```typescript
import { ThemeProvider } from "@/components/theme-provider";

// Wrap your app
<ThemeProvider defaultTheme="system" storageKey="bitcoin-rosca-theme">
  <App />
</ThemeProvider>
```

### Theme Toggle Component
A comprehensive theme toggle with Bitcoin styling:

```typescript
import { ThemeToggle } from "@/components/theme-toggle";

// Add to any page
<ThemeToggle />
```

Features:
- Animated sun/moon icons
- Dropdown with Light/Dark/System options
- Bitcoin-themed hover effects
- Keyboard accessible

## 🎯 Usage Guidelines

### 1. Consistent Bitcoin Theming
Use Bitcoin-themed variants for primary actions:
```typescript
// Primary actions
<Button variant="bitcoin">Create Group</Button>
<Badge variant="bitcoin">Active</Badge>

// Secondary actions
<Button variant="bitcoin-outline">Browse</Button>
<Badge variant="bitcoin-outline">Pending</Badge>
```

### 2. Dark Mode Considerations
Always test components in both themes:
```typescript
// Good - uses theme-aware classes
className="text-gray-900 dark:text-gray-100"

// Good - uses CSS variables
className="text-foreground bg-background"
```

### 3. Accessibility
- Maintain proper contrast ratios in both themes
- Use semantic color meanings (success = green, error = red)
- Ensure focus states are visible in both themes

## 🚀 Custom Animations

### Bitcoin Pulse Animation
Special animation for Bitcoin-themed elements:
```css
@keyframes bitcoin-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

Usage:
```typescript
className="animate-bitcoin-pulse"
```

### Shadow Effects
Bitcoin-themed shadows for enhanced depth:
```typescript
className="shadow-bitcoin hover:shadow-bitcoin-strong"
```

## 📱 Responsive Design

The theme system is fully responsive:
- Mobile-first approach
- Touch-friendly interactive elements
- Proper spacing across all screen sizes
- Theme toggle accessible on all devices

## 🔍 Testing Themes

### Manual Testing
1. Toggle between light/dark modes
2. Check all interactive states (hover, focus, active)
3. Verify contrast ratios meet WCAG guidelines
4. Test on different screen sizes

### Automated Testing
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Run component tests
npm test

# Build for production
npm run build
```

## 🎨 Customization

### Adding New Bitcoin Variants
1. Add CSS variables to `index.css`
2. Update `tailwind.config.ts` with new colors
3. Add variants to component files
4. Update documentation

### Example: Adding Bitcoin Success Variant
```css
/* index.css */
:root {
  --bitcoin-success: hsl(142, 76%, 36%);
  --bitcoin-success-foreground: hsl(0, 0%, 100%);
}
```

```typescript
// tailwind.config.ts
colors: {
  'bitcoin-success': {
    DEFAULT: 'var(--bitcoin-success)',
    foreground: 'var(--bitcoin-success-foreground)',
  }
}
```

## 🏆 Best Practices

1. **Consistency**: Use Bitcoin theming for primary actions
2. **Accessibility**: Always test in both light and dark modes
3. **Performance**: Use CSS variables for theme switching
4. **User Experience**: Respect system preferences by default
5. **Maintainability**: Document any custom theme additions

The theme system provides a cohesive, professional Bitcoin-themed experience while maintaining excellent usability and accessibility standards across all devices and user preferences.
