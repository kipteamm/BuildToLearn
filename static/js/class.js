// let userForaging = []; // default
let userForaging = ['collect']
let userFarming = [];
let userMining = [];

let userResources = {
    skillPoints: 99,
    gold: 0,
    citizens: 2,
    idle: 2,
    wood: 0,
    planks: 0,
    berry: 0,
    parchment: 0,
    stone: 0,
    iron: 0,
    availableVillagers: 2,
}

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

        for ([key, val] of Object.entries(userResources)) {
            updateResource(key, 0)
        }
    }
    
    return
}