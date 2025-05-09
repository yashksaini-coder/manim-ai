# Manim AI (v0 Animation)

v0 Manim uses AI to create beautiful mathematical animations from simple text prompts.

## Features

- AI-powered generation of Manim code from natural language prompts
- Automatic rendering of animations as videos
- Chat interface for iterative refinement of animations
- Support for multiple AI models (OpenAI and Groq)
- History tracking of all generated animations
- User authentication via Clerk

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Python (Manim server)
- **Database**: Convex 
- **Authentication**: Clerk
- **AI**: OpenAI, Groq
- **Animation Engine**: Cairo/OpenGL

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Python 3.9+
- Docker (for Manim server)
- Convex database

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yashksaini-coder/manim-ai
   cd manim-ai
   ```

2. Install frontend dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
    # Deployment used by `npx convex dev`
    CONVEX_DEPLOYMENT=dev:your-deployment-id # team: your-team-name, project: your-project-name

    NEXT_PUBLIC_CONVEX_URL=https://your-deployment-id.convex.cloud

    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key

    NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-clerk-frontend-api-url
    DATABASE_URL=postgresql://username:password@your-database-host/your-database-name?sslmode=require

    # SERVER APIs
    NEXT_PUBLIC_SERVER_PROCESSOR=http://127.0.0.1:5000
    PORT=5000

    OPENAI_API_KEY=your_openai_api_key
    GROQ_API_KEY=your_groq_api_key

    USE_LOCAL_STORAGE=true
    BASE_URL=http://localhost:5000/

    # Digital ocean space
    DO_SPACES_ACCESS_KEY=your_do_spaces_access_key
    DO_SPACES_ACCESS_SECRET=your_do_spaces_access_secret
    DO_SPACES_REGION=your_do_spaces_region
    DO_SPACES_BUCKET=your_do_spaces_bucket
    DO_SPACES_ENDPOINT=https://your-bucket.your-region.digitaloceanspaces.com

    FLASK_APP=app.py
   ```

4. Set up the database with convex:
   ```bash
   npx convex dev
   pnpx convex dev
   ```

### Running the Manim Server

1. Navigate to the manim-server directory:
   ```bash
   cd manim-server
   ```

2. Start the Docker container:
   ```bash
   docker-compose up -d
   ```

### Running the Frontend

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Adding New AI Models

To add support for new AI models:

1. Add the API key to your `.env` file
2. Create a new integration in `src/lib/ai-models.ts`
3. Update the UI in `src/components/chat/ChatInput.tsx` to include the new model