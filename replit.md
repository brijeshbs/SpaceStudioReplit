# SpaceStudio

## Overview

SpaceStudio is an AI-powered office planning web application. Users can upload floorplans, and the system uses AI to detect architectural features (walls, windows, columns) and generate optimized office layouts. The application provides KPI scoring for layouts based on space efficiency, cost, carbon footprint, productivity, and collaboration metrics.

The stack follows a monorepo structure with a React frontend (Vite), Express backend, PostgreSQL database with Drizzle ORM, and integrations with OpenAI for AI-powered features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens (CSS variables for theming)
- **Canvas Editor**: Konva.js with react-konva for the 2D floorplan editor
- **File Upload**: react-dropzone for drag-and-drop floorplan uploads

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Authentication**: Replit Auth via OpenID Connect with Passport.js
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` with models split into `shared/models/`
- **Migrations**: Drizzle Kit with `db:push` command

### Key Data Models
- **Users**: Authentication and profile data (Replit Auth integration)
- **Projects**: Container for floorplans, linked to users with company metadata
- **Floorplans**: Uploaded floor plan images with detected architectural features
- **Layouts**: Generated office layouts with zoning, furniture, and KPI scores
- **Conversations/Messages**: AI chat history storage

### Build System
- **Development**: `tsx` for running TypeScript directly
- **Production Build**: Custom script using esbuild for server bundling, Vite for client
- **Output**: Server bundles to `dist/index.cjs`, client to `dist/public/`

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components
    hooks/        # React Query hooks for API calls
    pages/        # Route pages
    lib/          # Utilities
server/           # Express backend
  replit_integrations/  # Auth, chat, image AI modules
shared/           # Shared types, schemas, route definitions
  models/         # Database model definitions
  schema.ts       # Main Drizzle schema
  routes.ts       # API route contracts with Zod
```

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, configured via `DATABASE_URL` environment variable
- **Session Table**: Required `sessions` table for Replit Auth (auto-managed)

### Authentication
- **Replit Auth**: OpenID Connect integration using Replit as identity provider
- **Environment Variables**: `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`

### AI Services
- **OpenAI API**: Used for chat completions and image generation
- **Environment Variables**: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
- **Features**: Chat interface, image generation, floor plan feature detection

### Development Tools
- **Replit Plugins**: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner (dev only)

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Server state management
- `zod`: Runtime validation for API contracts
- `passport` / `openid-client`: Authentication
- `react-konva` / `konva`: Canvas-based floor plan editor
- `recharts`: KPI visualization charts