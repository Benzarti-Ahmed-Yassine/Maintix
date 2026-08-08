# Maintix Frontend

This repository contains the frontend application for Maintix, an AI Decision Intelligence extension for ERP, MES, CMMS, SCADA and IoT.

## Architecture

- Feature First Architecture
- React + TypeScript + Vite
- TailwindCSS for styling
- React Router v6 for routing
- React Query for server state handling
- Zustand for local client state
- Framer Motion for UI motion
- React Three Fiber for the Digital Twin scene

## Folder structure

- `src/app` - top-level application composition
- `src/routes` - route definitions and route-based features
- `src/layouts` - authenticated and app layout shells
- `src/features` - feature directories by domain
- `src/components` - shared UI and navigation components
- `src/hooks` - reusable custom hooks
- `src/services` - API and integration service contracts
- `src/types` - shared TypeScript models and feature types
- `src/contexts` - global state hooks and context wrappers

## Available scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run format`

## Conventions

- Use feature-first folders for new domain areas
- Keep UI elements and reusable components separate from page-level composition
- No business logic should be implemented in the scaffold
- Use typed services and mock contracts for integration points
- Style using Tailwind utility classes and semantic component wrappers

## Next steps

- Add API integration to `src/services`
- Expand feature pages with real domain components
- Add route guards and auth middleware
- Add design system tokens and accessibility review
