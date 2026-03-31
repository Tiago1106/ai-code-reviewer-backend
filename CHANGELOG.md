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
- Runtime dependencies: `@nestjs/config`, `@nestjs/swagger`, `class-validator`, `class-transformer`, `uuid`
- Dev dependency: `@types/uuid`
- `main.ts` configured with:
  - `NestExpressApplication` type for Express-specific APIs
  - Body parser limit of 200KB (JSON)
  - Global `ValidationPipe` (whitelist, forbidNonWhitelisted, transform)
  - CORS restricted to `WEB_ORIGIN` env var (default `http://localhost:3000`)
  - Swagger UI at `/docs` (title: AI Code Reviewer API, version 0.1.0)
  - Port configurable via `PORT` env var (default 3001)
- `AppModule` configured with `ConfigModule.forRoot({ isGlobal: true })`
- `.env` file with `PORT`, `WEB_ORIGIN`, `REVIEW_TTL_MS`, `REVIEW_CLEANUP_INTERVAL_MS`
- `.env.example` template with documented defaults
- `ReviewsModule` with full MVP API:
  - `POST /reviews` — validates DTO, creates review with UUID, returns `{ id }`
  - `GET /reviews/:id` — returns review result or 404 if not found/expired
  - `ReviewsService` with in-memory `Map` storage, configurable TTL, and periodic cleanup via `setInterval`
  - `OnModuleDestroy` implemented to clear cleanup interval (prevents leaks in tests/hot reload)
  - Mock fixture returning a rich review result (summary, 2 positives, 3 issues with diffs, 3 suggestions, 2 questions, score 6)
- Types: `Language` enum (javascript, typescript, python, go, java), `ReviewResult`, `ReviewRecord` interfaces
- DTOs: `CreateReviewDto` (with class-validator decorators), `CreateReviewResponseDto`, `GetReviewResponseDto` (with Swagger decorators)
- Swagger annotations: `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiParam`, `@ApiProperty` on all endpoints and DTOs

### Removed
- Default `AppController`, `AppService`, and `AppController` spec (replaced by ReviewsModule)
