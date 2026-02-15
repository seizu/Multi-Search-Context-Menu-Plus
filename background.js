// Default search sites if none configured
const DEFAULT_SITES = [
  { name: "Google", url: "https://www.google.com/search?q={searchTerm}", enabled: true },
  { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Special:Search?search={searchTerm}", enabled: true },
  { name: "YouTube", url: "https://www.youtube.com/results?search_query={searchTerm}", enabled: true }
];

const DEFAULT_GROUPS = [];

// Initialize defaults on installation
browser.runtime.onInstalled.addListener(async () => {
  const { searchSites } = await browser.storage.local.get("searchSites");
  const { searchGroups } = await browser.storage.local.get("searchGroups");

  if (!searchSites) await browser.storage.local.set({ searchSites: DEFAULT_SITES });
  if (!searchGroups) await browser.storage.local.set({ searchGroups: DEFAULT_GROUPS });

  updateContextMenu();
});

// Update context menu when storage changes
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.searchSites || changes.searchGroups)) {
    updateContextMenu();
  }
});

// Create/update context menu items
async function updateContextMenu() {
  await browser.contextMenus.removeAll();

  const { searchSites } = await browser.storage.local.get("searchSites");
  const { searchGroups } = await browser.storage.local.get("searchGroups");

  const sites = searchSites || DEFAULT_SITES;
  const groups = searchGroups || DEFAULT_GROUPS;

  // Create parent menu item
  browser.contextMenus.create({
    id: "search-parent",
    title: "Search with...",
    contexts: ["selection"]
  });

  // Add groups first (with globe emoji)
  groups.forEach((group, index) => {
    if (group.enabled && group.sites && group.sites.length > 0) {
      browser.contextMenus.create({
        id: `group-${index}`,
        parentId: "search-parent",
        title: `🌐 ${group.name}`,
        contexts: ["selection"]
      });
    }
  });

  // Add individual sites
  sites.forEach((site, index) => {
    if (site.enabled) {
      browser.contextMenus.create({
        id: `search-${index}`,
        parentId: "search-parent",
        title: site.name,
        contexts: ["selection"]
      });
    }
  });
}

// Handle context menu clicks
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const { searchSites } = await browser.storage.local.get("searchSites");
  const { searchGroups } = await browser.storage.local.get("searchGroups");

  const sites = searchSites || DEFAULT_SITES;
  const groups = searchGroups || DEFAULT_GROUPS;

  // Handle group click - open all sites in group simultaneously
  if (info.menuItemId.startsWith("group-")) {
    const index = parseInt(info.menuItemId.split("-")[1]);
    const group = groups[index];

    if (group && group.sites) {
      group.sites.forEach(siteIndex => {
        const site = sites[siteIndex];
        if (site) {
          const searchUrl = site.url.replace("{searchTerm}", encodeURIComponent(info.selectionText));
          browser.tabs.create({ url: searchUrl });
        }
      });
    }
  }

  // Handle individual site click
  if (info.menuItemId.startsWith("search-")) {
    const index = parseInt(info.menuItemId.split("-")[1]);
    const site = sites[index];

    if (site) {
      const searchUrl = site.url.replace("{searchTerm}", encodeURIComponent(info.selectionText));
      browser.tabs.create({ url: searchUrl });
    }
  }
});

// Handle hotkey command - send message to content script to show popup
browser.commands.onCommand.addListener(async (command) => {
  if (command === "open-search-popup") {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      browser.tabs.sendMessage(tab.id, { action: "show-search-popup" });
    }
  }
});

// Handle messages from content script (open tabs)
browser.runtime.onMessage.addListener(async (message) => {
  const { searchSites } = await browser.storage.local.get("searchSites");
  const { searchGroups } = await browser.storage.local.get("searchGroups");

  const sites = searchSites || DEFAULT_SITES;
  const groups = searchGroups || DEFAULT_GROUPS;

  // Open single site search
  if (message.action === "open-site") {
    const site = sites[message.siteIndex];
    if (site) {
      const searchUrl = site.url.replace("{searchTerm}", encodeURIComponent(message.text));
      browser.tabs.create({ url: searchUrl });
    }
  }

  // Open all sites in group simultaneously
  if (message.action === "open-group") {
    const group = groups[message.groupIndex];
    if (group && group.sites) {
      group.sites.forEach(siteIndex => {
        const site = sites[siteIndex];
        if (site) {
          const searchUrl = site.url.replace("{searchTerm}", encodeURIComponent(message.text));
          browser.tabs.create({ url: searchUrl });
        }
      });
    }
  }
});

// Initialize menu on startup
updateContextMenu();