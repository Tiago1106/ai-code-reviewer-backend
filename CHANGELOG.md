# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Project documentation (`AGENTS.md`) with full MVP spec, API contracts, mock fixture, and development workflow
- `.gitignore` for Node.js/NestJS project
- `CHANGELOG.md` following Keep a Changelog format
- NestJS 11 project scaffold with TypeScript strict mode
  - `src/` with default AppModule, AppController, AppService
  - `test/` with e2e test config
  - ESLint, Prettier, Jest 30, Supertest configured
  - Scripts: `start:dev`, `build`, `test`, `test:e2e`, `lint`
