<!-- a8c13fff-1209-4715-b988-050ded08c562 ae622bfe-17b8-43a5-92f2-c9ca1624ed2e -->
# Plex Tracker Implementation Plan

## Architecture Overview

- Pure client-side React 19 app with Plex OAuth authentication
- Zustand for client state (auth, theme, UI state)
- TanStack Query for server state (Plex API data)
- shadcn/ui components with Tailwind CSS
- Manual + auto-refresh capabilities

## Implementation Steps

### 1. Dependencies & Setup

Install required packages:

- `@tanstack/react-query` - server state management
- `zustand` - client state management
- `shadcn/ui` - initialize with button, card, skeleton, switch, badge components
- Configure shadcn/ui with Tailwind v4 compatibility

### 2. Theme System

Create theme provider supporting light/dark/system modes:

- `src/providers/ThemeProvider.jsx` - theme context with localStorage persistence
- `src/stores/themeStore.js` - Zustand store for theme state
- Update `src/index.jsx` to wrap app with providers

### 3. Plex OAuth Authentication

Implement Plex OAuth flow:

- `src/services/plexAuth.js` - OAuth helpers (login URL generation, token exchange)
- `src/stores/authStore.js` - Zustand store for auth state (token, user info)
- `src/components/auth/LoginButton.jsx` - Plex login component
- OAuth callback handler in App.jsx

### 4. Plex API Service Layer

Create API service for Plex watchlist:

- `src/services/plexApi.js` - fetch watchlist, show details, metadata
- Use TanStack Query hooks for data fetching with caching
- `src/hooks/usePlexWatchlist.js` - custom hook with auto-refresh logic

### 5. Show Grouping Logic

Implement show categorization:

- `src/utils/groupShows.js` - group shows by season status:
- Latest season finished airing
- Latest season currently airing
- Latest season not yet aired
- Parse air dates and determine status

### 6. UI Components

Build component hierarchy:

- `src/components/layout/Header.jsx` - app header with theme toggle, refresh button
- `src/components/shows/ShowCard.jsx` - individual show card (title, season, air date, poster)
- `src/components/shows/ShowGroup.jsx` - grouped show list with header
- `src/components/shows/ShowList.jsx` - main list container
- `src/components/auth/AuthGuard.jsx` - protect authenticated routes

### 7. Main App Layout

Update `src/App.jsx`:

- Conditional rendering based on auth state
- Display grouped show lists
- Loading and error states
- Responsive grid layout (mobile: 1 col, tablet: 2 cols, desktop: 3+ cols)

### 8. Styling & Responsiveness

Apply Tailwind CSS:

- Mobile-first responsive design
- Smooth transitions and animations
- Accessible color contrast for both themes
- Modern card-based layout with shadows

### 9. Auto-refresh Feature

Implement refresh controls:

- Manual refresh button in header
- Auto-refresh toggle with configurable interval (default: 5 minutes)
- Visual indicator when refreshing
- Store preference in localStorage

## Key Files to Create/Modify

- `src/App.jsx` - main app component
- `src/providers/ThemeProvider.jsx`
- `src/stores/{authStore, themeStore}.js`
- `src/services/{plexAuth, plexApi}.js`
- `src/hooks/usePlexWatchlist.js`
- `src/utils/groupShows.js`
- `src/components/` - multiple component files
- `components.json` - shadcn/ui config

### To-dos

- [ ] Install dependencies: @tanstack/react-query, zustand, and initialize shadcn/ui
- [ ] Create theme provider and store with light/dark/system mode support
- [ ] Implement Plex OAuth authentication flow and auth store
- [ ] Build Plex API service layer with TanStack Query integration
- [ ] Create show grouping logic based on season airing status
- [ ] Build UI components (ShowCard, ShowGroup, ShowList, Header, AuthGuard)
- [ ] Update App.jsx with responsive layout and state management
- [ ] Implement manual and auto-refresh with configurable interval