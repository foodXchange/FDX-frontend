# FDX-frontend Codex Context

This is the React 18 + TypeScript frontend for the FoodXchange B2B sourcing platform.

## Tech Stack
- React 18
- TypeScript
- Material UI (MUI v5)
- Zustand (planned, not yet implemented)
- ESLint, Prettier, craco.config.js for build overrides
- GitHub Actions CI/CD

## Key Project Paths
- `/src/` → Main source code
  - `/components/` → Shared UI
  - `/features/` → Functional modules (RFQ, compliance, logistics, etc.)
  - `/store/` → Zustand (planned)
- `/public/` → Static assets

## UX/UI Branding
- Font: Causten (planned)
- Colors:
  - Teal: `#0d9aa2`
  - Orange: `#fc8a10`
- Design: Modern MUI component system (not Tailwind)

## Integration Notes
- Uses WebSocket (planned)
- Allergen, compliance, and label validation modules under `/features/`
