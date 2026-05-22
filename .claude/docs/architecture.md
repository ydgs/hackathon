# Architecture

## Principle
Use the simplest architecture that can deliver a stable demo in 16 hours.

## Recommended Structure

```txt
src/
  frontend/
  backend/
  shared/        # optional
```

or, for a single app:

```txt
src/
  components/
  pages/
  services/
  models/
  api/
```

## Build Order
1. App shell
2. Main entity model
3. Create flow
4. List flow
5. Detail flow
6. Status/action flow
7. P1 feature
8. One wow feature

## Avoid
- Complex microservices
- Unnecessary authentication complexity unless required
- Premature generic frameworks
- Multiple databases
- Too many AI features
