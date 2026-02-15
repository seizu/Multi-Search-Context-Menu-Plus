// Inject floating search popup into the current page

const POPUP_ID = "mscm-search-popup";

// Listen for message from background script
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "show-search-popup") {
    showPopup();
  }
});

// Show or focus the popup
async function showPopup() {
  // Remove existing popup if already open
  const existing = document.getElementById(POPUP_ID);
  if (existing) {
    existing.remove();
    return;
  }

  // Load sites and groups from storage
  const { searchSites } = await browser.storage.local.get("searchSites");
  const { searchGroups } = await browser.storage.local.get("searchGroups");

  const sites = searchSites || [];
  const groups = searchGroups || [];

  // Build and inject popup
  const popup = buildPopup(sites, groups);
  document.body.appendChild(popup);

  // Focus the text input
  popup.querySelector("#mscm-input").focus();
}

// Build the popup DOM element
function buildPopup(sites, groups) {
  const overlay = document.createElement("div");
  overlay.id = POPUP_ID;

  // Close on overlay click (outside popup box)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const box = document.createElement("div");
  box.className = "mscm-box";

  // Header
  const header = document.createElement("div");
  header.className = "mscm-header";
  header.textContent = "🔍 Multi Search";

  const closeBtn = document.createElement("button");
  closeBtn.className = "mscm-close";
  closeBtn.textContent = "✕";
  closeBtn.addEventListener("click", () => overlay.remove());
  header.appendChild(closeBtn);

  // Text input
  const input = document.createElement("input");
  input.id = "mscm-input";
  input.className = "mscm-input";
  input.type = "text";
  input.placeholder = "Enter search text...";

  // Pre-fill with selected text on page if any
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) input.value = selectedText;

  // Site list
  const list = document.createElement("div");
  list.className = "mscm-list";

  // Add groups first
  groups.forEach((group, groupIndex) => {
    if (!group.enabled || !group.sites || group.sites.length === 0) return;

    const item = document.createElement("button");
    item.className = "mscm-item mscm-group";
    item.textContent = `🌐 ${group.name}`;
    item.title = `Opens ${group.sites.length} site(s) simultaneously`;

    item.addEventListener("click", () => {
      const text = input.value.trim();
      if (!text) { input.focus(); input.classList.add("mscm-error"); return; }
      browser.runtime.sendMessage({ action: "open-group", groupIndex, text });
      overlay.remove();
    });

    list.appendChild(item);
  });

  // Add separator if both groups and sites exist
  const enabledGroups = groups.filter(g => g.enabled && g.sites && g.sites.length > 0);
  const enabledSites = sites.filter(s => s.enabled);
  if (enabledGroups.length > 0 && enabledSites.length > 0) {
    const separator = document.createElement("div");
    separator.className = "mscm-separator";
    list.appendChild(separator);
  }

  // Add individual sites
  sites.forEach((site, siteIndex) => {
    if (!site.enabled) return;

    const item = document.createElement("button");
    item.className = "mscm-item";
    item.textContent = site.name;

    item.addEventListener("click", () => {
      const text = input.value.trim();
      if (!text) { input.focus(); input.classList.add("mscm-error"); return; }
      browser.runtime.sendMessage({ action: "open-site", siteIndex, text });
      overlay.remove();
    });

    list.appendChild(item);
  });

  // Remove error styling on input
  input.addEventListener("input", () => input.classList.remove("mscm-error"));

  // Close on ESC key
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Escape") overlay.remove();
  });

  // Enter key triggers first item in list
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const firstItem = list.querySelector(".mscm-item");
      if (firstItem) firstItem.click();
    }
  });

  box.appendChild(header);
  box.appendChild(input);
  box.appendChild(list);
  overlay.appendChild(box);

  return overlay;
}