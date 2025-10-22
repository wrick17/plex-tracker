# Plex Tracker - Usage Guide

## Getting Started

### 1. First Time Setup

1. Start the development server:
   ```bash
   bun dev
   ```

2. Open your browser to `http://localhost:3000`

3. You'll see the login page with the Plex Tracker branding

### 2. Authentication

1. Click the **"Sign in with Plex"** button
2. A popup window will open with Plex's authentication page
3. Log in with your Plex credentials
4. Grant the app permission to access your watchlist
5. The popup will close automatically once authenticated
6. You'll be redirected to the main app

**Note**: Your authentication token is stored securely in your browser's localStorage and will persist across sessions.

### 3. Main Interface

Once logged in, you'll see:

#### Header (Top Bar)
- **App Title**: "Plex Tracker"
- **Your Username**: Displayed next to the title (on larger screens)
- **Auto-Refresh Toggle**: Click to enable/disable automatic updates (blue when active)
- **Manual Refresh Button**: Click to immediately refresh your watchlist
- **Theme Toggle**: Click to cycle through Light → Dark → System themes
- **Logout Button**: Sign out of your account

#### Show Groups

Your shows are automatically organized into three groups:

1. **Latest Season Currently Airing**
   - Shows with episodes that aired in the last 90 days
   - These are actively releasing new episodes

2. **Latest Season Not Yet Aired**
   - Shows with upcoming seasons/episodes
   - Future content you're waiting for

3. **Latest Season Finished Airing**
   - Shows that completed airing more than 90 days ago
   - Completed seasons ready to binge

#### Show Cards

Each show displays:
- **Poster Image**: The show's artwork
- **Title**: Show name
- **Year & Episode Count**: Release year and number of episodes
- **Air Date Badge**: When the latest episode aired or will air

### 4. Features

#### Theme Switching
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Easy on the eyes in low light
- **System Mode**: Automatically matches your OS theme preference

Click the theme icon in the header to cycle through modes. Your preference is saved.

#### Auto-Refresh
- Click the auto-refresh button (spinning arrows) to toggle
- When **enabled** (blue): Watchlist refreshes every 5 minutes
- When **disabled**: Only refreshes when you click the manual refresh button
- Great for leaving the app open and staying up-to-date

#### Manual Refresh
- Click the refresh button at any time to update your watchlist
- Useful when you just added shows to Plex
- Shows a spinning animation while loading

### 5. Responsive Design

The app automatically adapts to your screen size:

- **Mobile** (< 640px): 2 columns of shows
- **Tablet** (640px - 1024px): 3-4 columns
- **Desktop** (> 1024px): 5-6+ columns

Rotate your device or resize your browser to see the responsive design in action.

### 6. Managing Your Watchlist

#### Adding Shows
1. Go to Plex (web, mobile, or TV app)
2. Find a show you want to watch
3. Add it to your Watchlist
4. Refresh Plex Tracker to see it appear

#### Removing Shows
1. Go to Plex
2. Remove the show from your Watchlist
3. Refresh Plex Tracker to see it removed

**Note**: Plex Tracker is read-only. You manage your watchlist in Plex itself.

### 7. Keyboard Shortcuts

While keyboard shortcuts aren't implemented yet, you can:
- Use **Tab** to navigate between buttons
- Press **Enter** to activate focused buttons
- Use **Escape** to close the Plex auth popup (if stuck)

### 8. Troubleshooting

#### Shows Not Loading
- Check your internet connection
- Make sure you're logged into Plex
- Try the manual refresh button
- Check browser console for errors (F12)

#### Authentication Failed
- Make sure you have a valid Plex account
- Try logging out and back in
- Clear browser localStorage and try again
- Check if the popup was blocked by your browser

#### Images Not Showing
- Some shows may not have poster images in Plex
- This is normal and depends on Plex's metadata

#### Theme Not Changing
- Try clicking the theme button multiple times (it cycles)
- Check if your browser supports localStorage
- Try refreshing the page

#### Auto-Refresh Not Working
- Make sure the toggle is blue (enabled)
- Check if the page is still active (not in background)
- The interval is 5 minutes, so wait a bit

### 9. Privacy & Security

- **Authentication**: Uses official Plex OAuth flow
- **Data Storage**: Only auth token and preferences stored locally
- **No Backend**: All requests go directly to Plex servers
- **No Tracking**: No analytics or third-party services
- **Secure**: Token never leaves your browser

### 10. Tips & Tricks

1. **Keep It Open**: Enable auto-refresh and leave the tab open to stay updated
2. **Dark Mode**: Use dark mode when watching shows at night
3. **Mobile Friendly**: Add to your phone's home screen for quick access
4. **Organization**: Shows automatically sort by most recent air date
5. **Binge Planning**: Check "Finished Airing" group for complete seasons

## Common Questions

**Q: Can I edit my watchlist in Plex Tracker?**
A: No, you manage your watchlist in Plex itself. This app is for viewing and tracking.

**Q: How often does the watchlist update?**
A: With auto-refresh enabled, every 5 minutes. Otherwise, manually refresh.

**Q: Why are some shows in the wrong group?**
A: The grouping is based on air dates from Plex metadata. Some shows may have incomplete data.

**Q: Can I use this without a Plex account?**
A: No, you need a Plex account and watchlist to use this app.

**Q: Is my data shared with anyone?**
A: No, everything stays between your browser and Plex servers.

**Q: Can I customize the refresh interval?**
A: Not currently in the UI, but it's in the code and could be added.

## Support

For issues, questions, or feature requests:
1. Check the browser console for errors
2. Verify your Plex account is working
3. Try logging out and back in
4. Clear browser cache and localStorage

## Enjoy!

Happy tracking! 🎬 📺 🍿

