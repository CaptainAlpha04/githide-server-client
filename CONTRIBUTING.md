# Contributing to githide-server-client

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a branch: `git checkout -b feat/your-feature`

## Development Setup

```bash
# Server
cd server && npm install && cp .env.example .env
npm run dev

# Web
cd web && npm install && cp .env.example .env.local
npm run dev
```

## Submitting Changes

- Keep commits focused — one logical change per commit
- Run `npm run lint` in the web directory before opening a PR
- Test both server and web locally before submitting

## Reporting Bugs

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

## Security Issues

Do **not** open a public issue for security vulnerabilities. Email the maintainers directly.

## License

By contributing, you agree your contributions will be licensed under the [MIT License](LICENSE).
