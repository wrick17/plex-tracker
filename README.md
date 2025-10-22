# Plex Tracker

A modern web application to track your Plex watchlist and organize shows by their airing status.

## Features

- 🔐 **Plex OAuth Authentication** - Secure login with your Plex account
- 📺 **Watchlist Management** - View all shows from your Plex watchlist
- 📊 **Smart Grouping** - Shows organized by:
  - Currently Airing
  - Not Yet Aired
  - Finished Airing
- 🌓 **Theme Support** - Light, Dark, and System themes
- 🔄 **Auto-refresh** - Manual and automatic watchlist updates
- 📱 **Responsive Design** - Beautiful UI for mobile, tablet, and desktop

## Tech Stack

- React 19
- TanStack Query (React Query) - Server state management
- Zustand - Client state management
- Tailwind CSS v4 - Styling
- Rsbuild - Build tool
- Biome - Linter and formatter

## Setup

Install the dependencies:

```bash
bun install
```

## Development

Start the dev server, and the app will be available at [http://localhost:3000](http://localhost:3000):

```bash
bun dev
```

Build the app for production:

```bash
bun build
```

Preview the production build locally:

```bash
bun preview
```

## Code Quality

Run the linter:

```bash
bun biome check src/
```

Auto-fix linting issues:

```bash
bun biome check --write src/
```

## How It Works

1. Sign in with your Plex account using OAuth
2. The app fetches your watchlist from Plex
3. Shows are automatically grouped by their latest season's airing status
4. Enable auto-refresh to keep your watchlist up-to-date
5. Switch between light and dark themes based on your preference
