// let userForaging = []; // default
let userForaging = ['collect']
let userFarming = [];
let userMining = [];

let userSkillPoints = 1000000;

let userResources = {
    wood : 0,
    planks : 0,
    berry : 0,
    parchment : 0,
    stone : 0,
    iron : 0,
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
    }
    
    return
}