# Photographer Management API

Backend API for the Photographer Management System, built with NestJS.

This API handles core business logic including show management, user roles, scheduling, financial calculations, and reporting.

## Installation

```bash
npm install
```

## Running the app

```bash
# development (with watch mode)
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# test coverage
npm run test:cov

# e2e tests
npm run test:e2e
```

## Project Structure

- `src/`: Main application code
  - `main.ts`: Application entry point
  - `app.module.ts`: Root application module
  - `app.controller.ts`: Basic app controller (can be removed later)
  - `app.service.ts`: Basic app service (can be removed later)
  - `core/`: Core modules (e.g., authentication, configuration, database)
  - `shared/`: Shared utilities, constants, types, etc.
  - `modules/`: Feature modules (e.g., shows, users, finance)
- `test/`: Test files (unit and e2e)

## Stay in touch

- Author - [Your Name/Studio Name] // TODO: Update Author Name

## License

Nest is [MIT licensed](LICENSE).
