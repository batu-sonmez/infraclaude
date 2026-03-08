# Contributing to InfraClaude

Thank you for your interest in contributing to InfraClaude!

## Development Setup

```bash
git clone https://github.com/batu-sonmez/infraclaude.git
cd infraclaude
npm install
npm run dev  # Watch mode
```

## Project Structure

- `src/tools/` — MCP tool implementations (K8s, Docker, Prometheus, etc.)
- `src/resources/` — MCP resources (cluster info, service health)
- `src/prompts/` — MCP prompts (guided workflows)
- `src/safety/` — Safety layer (command guard, RBAC, audit)
- `hooks/` — Claude Code hook scripts
- `skills/` — Custom skill definitions
- `tests/` — Unit and integration tests

## Adding a New Tool

1. Create the tool implementation in the appropriate `src/tools/` subdirectory
2. Register the tool in the subdirectory's `index.ts`
3. Add a risk classification in `src/safety/command_guard.ts`
4. Write tests in `tests/unit/tools/`
5. Document the tool in `docs/tools-reference.md`

## Running Tests

```bash
npm run test          # Unit tests
npm run test:coverage # With coverage
npm run typecheck     # Type checking
```

## Code Style

- TypeScript strict mode
- Meaningful variable and function names
- Error messages should be user-friendly
- All tools must return formatted strings (not raw JSON)

## Pull Request Process

1. Create a feature branch
2. Write tests for new functionality
3. Ensure all tests pass
4. Update documentation
5. Submit a pull request with a clear description
