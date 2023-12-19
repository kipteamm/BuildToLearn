/* RESOURCES */
const resourceIndicators = {
    wood: document.getElementById('wood'),
    planks: document.getElementById('planks'),
    berry: document.getElementById('berry'),
    papyrus: document.getElementById('papyrus'),
    stone: document.getElementById('stone'),
    iron: document.getElementById('iron'),
}

function updateResource(type, amount) {
    const indicator = resourceIndicators[type];

    if (indicator) {
        userResources[type] += amount;
        indicator.innerText = userResources[type];
    }
}

/* MENU */
const menu = document.getElementById('menu')

let activeMenu = "loading";

function toggleMenu(menuId) {
    if (menuId === activeMenu) {
        menu.classList.remove('active')

        activeMenu = "loading"

        return
    }

    menu.classList.add('active')

    document.getElementById(`${activeMenu}-menu`).classList.remove('active')

    document.getElementById(`${menuId}-menu`).classList.add('active')

    activeMenu = menuId
}

let activeSkill = "foraging";

function buySkill(skill, price) {
    if (price > userSkillPoints) {
        alert('error inc')
        
        return
    }

    getSkill(activeSkill).push(skill.id)
}

/* ITEM MENU */
const itemMenu = document.getElementById('item-menu')

let activeTile = null

function openActionMenu(tile) {
    if (activeTile === tile) {
        itemMenu.style.display = 'none';

        activeTile = null

        return
    }

    if (!tile.classList.contains('tile')) {
        return
    }

    if (activeMenu !== "loading") {
        toggleMenu(activeMenu)

        return
    }

    if (activeTile !== null) {
        activeTile.classList.remove('active')
    }

    activeTile = tile

    itemMenu.style.display = 'block'

    updateActionsMenu()

    tile.classList.add('active')
}

function closeActionMenu() {
    itemMenu.style.display = 'none'

    if (activeTile !== null) {
        activeTile.classList.remove('active')
    }
}

function updateActionsMenu() {
    itemMenu.querySelector('.status').innerHTML = '';

    itemMenu.querySelector('span.title').innerText = activeTile.getAttribute('type')

    switch (activeTile.getAttribute('status')) {
        case "collectable":
            addDescription("This item is ready to be collected.")
            addAction("collect")

            break;
        case "collecting":
            addDescription("This item is currently getting collected.")
            addStatus("collecting")

            break;
    }
}

function addDescription(description) {
    const descriptionWrapper = document.createElement('p')

    descriptionWrapper.innerText = description

    itemMenu.querySelector('.status').appendChild(descriptionWrapper)
}

function addAction(actionId) {
    const actionWrapper = document.createElement('button')

    actionWrapper.setAttribute('onclick', `action('${actionId}')`)
    actionWrapper.classList.add('action')
    actionWrapper.innerText = actionId

    itemMenu.querySelector('.status').appendChild(actionWrapper)
}

function addStatus(statusId) {
    const statusWrapper = document.createElement('div');

    statusWrapper.classList.add('status-bar');
    statusWrapper.innerText = statusId;

    const start = parseFloat(activeTile.getAttribute('status-start'))
    const duration = parseInt(activeTile.getAttribute('status-duration'))

    statusWrapper.style.transition = `width ${duration}s linear`;
    statusWrapper.style.width = `${((new Date().getTime() - start) / (duration * 1000)) * 100}%`;

    itemMenu.querySelector('.status').appendChild(statusWrapper);

    void statusWrapper.offsetWidth;

    statusWrapper.style.width = '100%';
}