let activeTab = "loading"

window.onload = function() {
    let tab = new URLSearchParams(location.search).get('t');

    if (tab === null) {
        tab = 'city';
    }

    loadTab(tab);
}

function loadTab(tabId) {
    if (tabId === activeTab) {
        return
    }

    loadTabContents(tabId);

    document.querySelector(".tab.active").classList.remove("active");

    const tab = document.getElementById(`${tabId}-tab`);

    tab.classList.add("active")
    
    activeTab = tabId;
}

function loadTabContents(tabId) {
    if (tabId === 'city') {
        generateMap(1)

        for (const [key, val] of Object.entries(userResources)) {
            updateResource(key, 0)
        }
    }
    
    return
}