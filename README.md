# Plex Tracker

A modern web application to track your Plex watchlist and organize titles by airing status or media type.

## Features

- 🔐 **Plex OAuth Authentication** - Secure login with your Plex account
- 📺 **Watchlist Management** - View movies and shows from your Plex watchlist
- 📊 **Smart Grouping** - Titles organized by:
  - Currently Airing
  - Not Yet Aired
  - Recently Ended
  - Finished Airing
- 🎛️ **View Controls** - Floating controls for filters, sorting, and grouping:
  - All, Movies, TV Shows, Anime, Anime Movies
  - Airing date, title, or rating / popularity sorting
  - Airing-date or media-type grouping
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
bun run dev
```

Build the app for production:

```bash
bun run build
```

Preview the production build locally:

```bash
bun run preview
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
2. The app fetches your full watchlist from Plex
3. Titles are automatically classified as Movies, TV Shows, Anime, or Anime Movies
4. Enable auto-refresh to keep your watchlist up-to-date
5. Switch between light and dark themes based on your preference

## Maintenance Notes

- Cached watchlist data renders immediately on app load, then currently airing shows get one background season refresh per authenticated token. This prevents the cache write from retriggering the same Plex `children` requests indefinitely.
- Filter categories are exact and non-overlapping: anime uses Plex genre metadata when available, then falls back to the media type so every title has one category.
- The watchlist API is paginated; keep pagination intact so "All" really means the full watchlist.
- Use `bun run test`, `bun run lint`, and `bun run build` before shipping changes.
