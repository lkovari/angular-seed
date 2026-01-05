# TODO to become complete seed app

## Recently Completed

### ESLint Configuration (Completed)
- Migrated from `.eslintrc.json` to modern ESLint 9+ flat config format (`eslint.config.mjs`)
- Added comprehensive rule set including:
  - Base JavaScript rules (no-console, no-debugger, complexity, max-depth, etc.)
  - TypeScript best practices (consistent-type-imports, no-floating-promises, etc.)
  - Angular-specific rules (component-selector, prefer-standalone, etc.)
  - Custom deprecated detection rule with enhanced features
- All rules from legacy config migrated with proper options
- Configuration verified: lint, build, and tests all passing
- See `README.md` for full ESLint configuration documentation

## Phase 1: Core Infrastructure

1. Environment Configuration
2. HTTP Client Base Configuration (Base URL, Interceptors)
3. Authentication Service & Guards
4. Token Management & Interceptor

## Phase 2: Developer Experience

5. API Service Layer Pattern
6. State Management (Signals-based Store)
7. Logging Service
8. Common Utilities

## Phase 3: User Experience

9. Forms & Validation Utilities
10. i18n Support
11. Common UI Components
12. Enhanced Routing (Guards, Resolvers)

## Phase 4: Quality & Polish

13. Testing Utilities
14. Documentation
15. Performance Optimizations
16. Accessibility Improvements

