const MAX_SITES_PER_GROUP = 10;

async function loadSettings() {
  const { searchSites } = await browser.storage.local.get("searchSites");
  const { searchGroups } = await browser.storage.local.get("searchGroups");

  renderSites(searchSites || [{ name: "", url: "", enabled: true }]);
  renderGroups(searchGroups || []);
}

function renderSites(sites) {
  const container = document.getElementById("sites-container");
  container.innerHTML = "";
  sites.forEach((site, index) => container.appendChild(createSiteItem(site, index)));
}

function createSiteItem(site, index) {
  const div = document.createElement("div");
  div.className = "site-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = site.enabled !== false;
  checkbox.title = "Enable/Disable";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Name (e.g., Google)";
  nameInput.value = site.name || "";

  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.placeholder = "URL with {searchTerm}";
  urlInput.value = site.url || "";

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.className = "btn-remove";
  removeBtn.addEventListener("click", () => {
    div.remove();
    refreshGroupCheckboxes();
  });

  div.appendChild(checkbox);
  div.appendChild(nameInput);
  div.appendChild(urlInput);
  div.appendChild(removeBtn);

  return div;
}

function collectSites() {
  const items = document.querySelectorAll("#sites-container .site-item");
  const sites = [];

  items.forEach(item => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    const inputs = item.querySelectorAll('input[type="text"]');

    if (inputs[0].value.trim() && inputs[1].value.trim()) {
      sites.push({
        name: inputs[0].value.trim(),
        url: inputs[1].value.trim(),
        enabled: checkbox.checked
      });
    }
  });

  return sites;
}

function renderGroups(groups) {
  const container = document.getElementById("groups-container");
  container.innerHTML = "";
  groups.forEach((group, index) => container.appendChild(createGroupItem(group, index)));
}

function createGroupItem(group, index) {
  const sites = collectSites();

  const div = document.createElement("div");
  div.className = "group-item";

  const header = document.createElement("div");
  header.className = "group-header";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = group.enabled !== false;
  checkbox.title = "Enable/Disable group";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Group name (e.g., Research)";
  nameInput.value = group.name || "";
  nameInput.style.width = "100%";

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.className = "btn-remove";
  removeBtn.addEventListener("click", () => div.remove());

  header.appendChild(checkbox);
  header.appendChild(nameInput);
  header.appendChild(removeBtn);

  const sitesWrapper = document.createElement("div");

  const sitesLabel = document.createElement("div");
  sitesLabel.style.fontSize = "13px";
  sitesLabel.style.color = "#555";
  sitesLabel.style.marginBottom = "6px";
  sitesLabel.textContent = "Select sites for this group (max 10):";

  const sitesContainer = document.createElement("div");
  sitesContainer.className = "group-sites";
  sitesContainer.dataset.groupIndex = index;

  const counter = document.createElement("div");
  counter.className = "group-counter";

  sites.forEach((site, siteIndex) => {
    if (!site.name) return;

    const label = document.createElement("label");
    label.className = "group-site-checkbox";

    const siteCheckbox = document.createElement("input");
    siteCheckbox.type = "checkbox";
    siteCheckbox.value = siteIndex;
    siteCheckbox.checked = group.sites ? group.sites.includes(siteIndex) : false;

    siteCheckbox.addEventListener("change", () => {
      const checked = sitesContainer.querySelectorAll('input[type="checkbox"]:checked');
      if (checked.length > MAX_SITES_PER_GROUP) {
        siteCheckbox.checked = false;
      }
      updateCounter(sitesContainer, counter);
    });

    label.appendChild(siteCheckbox);
    label.appendChild(document.createTextNode(site.name));
    sitesContainer.appendChild(label);
  });

  updateCounter(sitesContainer, counter);

  sitesWrapper.appendChild(sitesLabel);
  sitesWrapper.appendChild(sitesContainer);
  sitesWrapper.appendChild(counter);

  div.appendChild(header);
  div.appendChild(sitesWrapper);

  return div;
}

function updateCounter(sitesContainer, counter) {
  const checked = sitesContainer.querySelectorAll('input[type="checkbox"]:checked').length;
  counter.textContent = `${checked} / ${MAX_SITES_PER_GROUP} sites selected`;
  counter.className = checked >= MAX_SITES_PER_GROUP ? "group-counter limit" : "group-counter";
}

function collectGroups() {
  const items = document.querySelectorAll("#groups-container .group-item");
  const groups = [];

  items.forEach(item => {
    const checkbox = item.querySelector('.group-header input[type="checkbox"]');
    const nameInput = item.querySelector('.group-header input[type="text"]');
    const siteCheckboxes = item.querySelectorAll('.group-sites input[type="checkbox"]:checked');

    if (nameInput.value.trim()) {
      const selectedSites = Array.from(siteCheckboxes).map(cb => parseInt(cb.value));
      groups.push({
        name: nameInput.value.trim(),
        enabled: checkbox.checked,
        sites: selectedSites
      });
    }
  });

  return groups;
}

function refreshGroupCheckboxes() {
  const groups = collectGroups();
  renderGroups(groups);
}

async function saveSettings() {
  const sites = collectSites();
  const groups = collectGroups();

  if (sites.length === 0) {
    showStatus("Please add at least one search site.", false);
    return;
  }

  const invalidSites = sites.filter(site => !site.url.includes("{searchTerm}"));
  if (invalidSites.length > 0) {
    showStatus("Error: All URLs must contain {searchTerm} placeholder.", false);
    return;
  }

  await browser.storage.local.set({ searchSites: sites });
  await browser.storage.local.set({ searchGroups: groups });
  showStatus("Settings saved successfully!", true);
}

function showStatus(message, isSuccess) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = isSuccess ? "status success" : "status error";
  setTimeout(() => { status.style.display = "none"; }, 3000);
}

document.getElementById("add-site").addEventListener("click", () => {
  const container = document.getElementById("sites-container");
  container.appendChild(createSiteItem({ name: "", url: "", enabled: true }, container.children.length));
});

document.getElementById("add-group").addEventListener("click", () => {
  const container = document.getElementById("groups-container");
  container.appendChild(createGroupItem({ name: "", enabled: true, sites: [] }, container.children.length));
});

document.getElementById("save").addEventListener("click", saveSettings);

loadSettings();