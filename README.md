# Multi Search Context Menu Plus - Firefox Extension

Search selected or custom text on configurable websites via context menu or hotkey.

## Features

- Right-click on selected text to search on multiple sites
- Hotkey (Alt+Shift+S) to search custom or selected text
- Group multiple sites and open them all at once
- Fully configurable search sites and groups
- Custom URL patterns with `{searchTerm}` placeholder
- Enable/disable individual search sites and groups
- Simple and clean interface

## Configuration

1. Right-click the extension icon in Firefox toolbar
2. Select "Manage Extension"
3. Click on "Preferences" or "Options"
4. Add, edit, or remove search sites
5. Add, edit, or remove groups
6. Click "Save Settings"

> **Tip:** The hotkey can be changed under `about:addons` → ⚙️ → **"Manage Extension Shortcuts"**

### URL Pattern

Use `{searchTerm}` as placeholder in the URL where the selected text should be inserted.

**Examples:**
- Google: `https://www.google.com/search?q={searchTerm}`
- Wikipedia: `https://en.wikipedia.org/wiki/Special:Search?search={searchTerm}`
- YouTube: `https://www.youtube.com/results?search_query={searchTerm}`

## Usage

### Hotkey Search
1. Press **Alt+Shift+S** on any webpage
2. A floating popup appears
3. Enter your search text (or it auto-fills with selected text)
4. Click on a 🌐 group or individual site
5. Results open in new tabs

### Single Site Search
1. Select any text on a webpage
2. Right-click on the selection
3. Navigate to "Search with..." in the context menu
4. Click on your desired search site
5. A new tab opens with the search results

### Group Search
1. Select any text on a webpage
2. Right-click on the selection
3. Navigate to "Search with..." in the context menu
4. Click on a 🌐 group
5. All sites in the group open simultaneously in new tabs

## Groups

Groups allow you to search multiple sites at once with a single click.

- Create a group with a custom name
- Assign up to **10 sites** per group
- Groups are shown with 🌐 in the context menu
- Enable/disable groups individually

**Example groups:**
- 🌐 Research → Google + Wikipedia + DuckDuckGo
- 🌐 Dev → GitHub + StackOverflow + MDN

## Default Search Sites

The extension comes pre-configured with:
- Google
- Wikipedia (English)
- YouTube

You can modify, disable, or remove these in the settings.

## Browser Compatibility

- **Firefox**: 57+ (manifest v2)

## License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.