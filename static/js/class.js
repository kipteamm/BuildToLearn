let activeTab = "loading"
let loaded = false;

let seedData;

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

async function loadTabContents(tabId) {
    if (tabId === 'city') {
        await fetchNames()

        seedData = customRandom(1)

        for (var i = 0; i < 10; i++) {
            spawnCitizen()
        }

        generateMap()
        generateBerries()

        for (const [key, val] of Object.entries(userResources)) {
            updateResource(key, 0)
        }

        newWorkDay()
    }
    
    return
}