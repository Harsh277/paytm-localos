# AGENTS.md - Agentic Coding Guidelines

## Project Overview

Paytm LocalOS Landing Page — a React + Tailwind CSS project serving as the entry point for India's business infrastructure for small merchants. Dark navy aesthetic (#0a1628) with Paytm blue accent (#00BAF2).

## Build, Lint & Test Commands

### Development
```bash
npm run dev          # Start Vite dev server with HMR (default: localhost:5173)
npm run preview      # Preview production build locally
```

### Build
```bash
npm run build        # Production build to dist/
npm run build -- --mode staging  # Build for staging environment
```

### Linting
```bash
npm run lint                    # Run ESLint on entire codebase
npm run lint -- --fix            # Auto-fix ESLint issues
npm run lint src/pages/Landing.jsx  # Lint specific file
```

### Testing
- **No test framework configured** — Do not add tests until a test framework is added to package.json

## Code Style Guidelines

### Language & Framework
- JavaScript with JSX (not TypeScript)
- React 19 with functional components and hooks
- Vite as the build tool

### Imports
- Use `.jsx` extension for React components
- Use relative imports: `import MyComponent from './components/MyComponent'`
- Order: React → external libraries → internal components → styles
- Example:
```javascript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MyComponent from './components/MyComponent'
import './index.css'
```

### File Naming
- Components: `PascalCase` (e.g., `Landing.jsx`, `MerchantDashboard.jsx`)
- Utils/hooks: `camelCase` (e.g., `useAuth.js`, `formatCurrency.js`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_ENDPOINTS.js`)
- CSS files: `camelCase` matching component (e.g., `Landing.css`)

### Component Structure
- Use functional components with hooks
- Prefer arrow functions for simple components
- Use explicit `export default` at end of file
- Keep components focused and small (< 200 lines)
```javascript
function Landing({ title, onNavigate }) {
  const [state, setState] = useState(false)

  useEffect(() => {
    // effect logic
  }, [])

  return (
    <div className="container">
      <h1>{title}</h1>
    </div>
  )
}

export default Landing
```

### Hooks
- `useState` for local component state
- `useEffect` for side effects (fetching, subscriptions)
- Custom hooks: prefix with `use` (e.g., `useAuth`, `useMap`)
- ESLint enforces `react-hooks` rules

### Tailwind CSS
- Use utility classes in `className`
- Avoid custom CSS when Tailwind can achieve same result
- Keep custom CSS in separate `.css` files
- Use arbitrary values for specific colors: `bg-[#0a1628]`, `text-[#00BAF2]`
- Example: `<div className="flex items-center justify-between p-4">`

### State Management
- Use React `useState` for local component state
- Use React Router `useNavigate` for programmatic navigation
- Avoid over-engineering; add context/redux only when needed

### Error Handling
- Use React Error Boundaries for catching component errors
- Handle async errors with try/catch in useEffect callbacks
- Display user-friendly error messages in UI
- Log errors appropriately (console.error for dev, analytics for prod)

### Naming Conventions
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- CSS classes: follow Tailwind conventions (kebab-case in HTML)

### Accessibility
- Use semantic HTML elements (`<button>`, `<nav>`, `<section>`)
- Add `alt` text to images
- Use `aria-label` for icon-only buttons
- Include `role="presentation"` on decorative SVGs

### ESLint Configuration
The project uses ESLint 9 with these rules:
- React Hooks: `eslint-plugin-react-hooks` (recommended config)
- React Refresh: `eslint-plugin-react-refresh` for safe HMR
- Unused vars: allowed if starting with `_` or `UPPER_CASE`
- Custom rule: `'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]`

## Visual Design

### Colors
- Background: `#0a1628` (dark navy)
- Primary accent: `#00BAF2` (Paytm blue)
- Secondary text: `#9CA3AF` (gray-400)

### Typography
- Font: Inter (Google Fonts)
- Headings: Bold, tight tracking
- Body: Regular weight, relaxed line-height

### Aesthetic
- Stripe Dashboard meets Zerodha Kite
- Depth from spacing and type weight, not gradients or glow
- Professional product that exists — not a startup poster

## Project Structure
```
/src
  /pages      - Route components (Landing, Merchant, FSE)
  /components - Reusable UI components
  /utils      - Utility functions
  App.jsx     - Routes configuration
  main.jsx    - Entry point
```

## Routes
- `/` → Landing page
- `/merchant` → Merchant dashboard (placeholder)
- `/fse` → FSE dashboard (placeholder)

## Environment Variables
- Create `.env` file in project root for any API keys
- Use `import.meta.env.VITE_*` for client-side env variables
- Never commit `.env` to version control

## What NOT to Do
- Do NOT use `class` instead of `className`
- Do NOT add test files without test framework
- Do NOT commit `node_modules/` or `dist/`
- Do NOT use CSS-in-JS libraries (styled-components, emotion, etc.)
- Do NOT add real API integrations without user confirmation
