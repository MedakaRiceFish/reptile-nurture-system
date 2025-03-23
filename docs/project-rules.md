
# Project Rules

## Code Style and Formatting

### TypeScript Standards
- Use TypeScript strict mode for all new code
- Explicitly define types for function parameters and return values
- Use interfaces for object shapes and type aliases for unions and primitives
- Prefer readonly properties when objects shouldn't be mutated
- Utilize TypeScript utility types (Partial, Pick, Omit, etc.) where appropriate

### Naming Conventions
- **Components**: PascalCase (e.g., `AnimalCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAnimalData.ts`)
- **Utilities**: camelCase (e.g., `formatWeight.ts`)
- **Interfaces/Types**: PascalCase (e.g., `AnimalProfile`)
- **Constants**: UPPER_SNAKE_CASE for truly constant values
- **Files**: Match the primary export name in PascalCase for components, camelCase for utilities

### Component Structure
- One component per file (except for small, tightly related components)
- Export components as named exports, not default exports
- Place related components in the same directory
- Organize imports in order: React/libraries, project imports, styles
- Sort imports alphabetically within each group

## Best Practices

### Component Design
- Create small, focused components (preferably under 100 lines)
- Separate container components (logic) from presentational components (UI)
- Use composition over inheritance for component relationships
- Implement proper prop validation
- Avoid anonymous functions in render methods where performance matters

### State Management
- Keep state as local as possible
- Use React Query for server state
- Use local state (useState) for UI state
- Implement context sparingly and only for truly global state
- Follow immutable update patterns

### Performance Considerations
- Memoize expensive computations with useMemo
- Optimize re-renders with React.memo for pure components
- Use useCallback for functions passed to child components
- Implement virtualization for long lists
- Avoid unnecessary renders through proper component composition

### Error Handling
- Implement error boundaries at appropriate levels
- Handle async errors with try/catch blocks
- Provide user-friendly error messages
- Log errors for debugging purposes
- Implement fallback UI for error states

## Project Structure

### Directory Organization
- Group related files together
- Create subdirectories when a directory exceeds ~7 files
- Keep directory nesting to maximum 3 levels deep
- Use barrel files (index.ts) for cleaner imports
- Separate UI components from business logic

### Modules and Boundaries
- Define clear module boundaries
- Avoid circular dependencies
- Maintain explicit import paths (no wildcard imports)
- Document public APIs for each module
- Design for composition and reusability

## Testing Standards

### Test Coverage Requirements
- All components must have at least one render test
- Business logic functions must have unit tests
- Critical user flows must have integration tests
- Focus on testing behavior, not implementation details

### Testing Patterns
- Use Testing Library for component tests
- Implement mock services for API testing
- Write readable test descriptions that describe behavior
- Follow AAA pattern (Arrange, Act, Assert)
- Use setup functions for common test scenarios

## Code Review Process

### Pull Request Guidelines
- Keep PRs small and focused (< 400 lines when possible)
- Include descriptive PR titles and descriptions
- Link PRs to related issues or tickets
- Include screenshots for UI changes
- Update documentation when changing functionality

### Review Checklist
- Code meets style and best practice guidelines
- Tests are included and passing
- No performance regressions
- Accessibility standards maintained
- Security considerations addressed
- No unnecessary code included

## Documentation Requirements

### Code Documentation
- Document complex functions with JSDoc comments
- Explain "why" not just "what" in comments
- Keep comments up-to-date with code changes
- Document any non-obvious algorithms or business logic
- Use meaningful variable and function names as self-documentation

### Component Documentation
- Document props with descriptive comments
- Include examples for complex components
- Document state and effects
- Note any performance considerations
- Explain component relationships and composition patterns

## Performance Requirements

### Load Time Targets
- Initial page load under 2 seconds on broadband
- Time to Interactive under 3.5 seconds
- First Contentful Paint under 1 second
- Bundle size under 200KB for critical path (gzipped)

### Runtime Performance
- Maintain 60fps for animations and interactions
- No input delay over 100ms
- Efficiently handle large datasets with pagination or virtualization
- Optimize long lists and complex UI operations

## Accessibility Standards

### Compliance Requirements
- Meet WCAG 2.1 AA standards
- Implement proper semantic HTML
- Ensure keyboard navigation for all interactions
- Maintain color contrast ratios (4.5:1 minimum)
- Provide text alternatives for non-text content

### Testing Procedures
- Use axe-core or similar tools for automated checks
- Perform keyboard navigation testing
- Check screen reader compatibility
- Verify color contrast and text sizing
- Test with actual assistive technologies when possible

## Commit Message Standards

### Format
- Use conventional commits format: type(scope): message
- Keep subject line under 72 characters
- Use imperative mood in commit messages
- Provide detailed descriptions in commit body when needed

### Types
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Formatting changes
- refactor: Code changes that neither fix bugs nor add features
- test: Adding or updating tests
- chore: Changes to build process or tools
