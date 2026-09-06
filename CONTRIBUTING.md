# Contributing to CatTags

Thank you for contributing to CatTags!

## Development Guidelines

1. **Minecraft Target**: Specifically target **Minecraft 1.21.11 (Fabric)** on Java 21. Do not break compatibility with 1.21.x APIs.
2. **Performance First**: Never make synchronous HTTP requests on the Minecraft rendering thread. Always use asynchronous processing and the `TeamCacheManager`.
3. **Security**: Do not commit secrets, tokens, or environment credentials.
4. **Offline Compatibility**: All features must function without requiring Microsoft OAuth.
5. **Code Style**:
   - Fabric Mod: Standard Java conventions with Yarn mappings.
   - Backend/Web: TypeScript strict mode with ESLint/Prettier formatting.

## Pull Requests

1. Fork the repository and create your feature branch: `git checkout -b feature/my-feature`.
2. Run backend tests: `npm run test --workspace=backend`.
3. Run mod tests: `cd mod && gradle test`.
4. Submit your pull request with clear description and screenshots/logs.
