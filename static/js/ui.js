/* ALERTS */
const alertElement = document.getElementById('alert')

let alertActive = false;

function sendAlert(type, text) {
    const wordsPerMinute = text.split(/\s+/).length;
    const delay = (wordsPerMinute / 150) * 60 * 1000;

    if (alertActive) {
        setTimeout(() => {
            sendAlert(type, text);
        }, delay + 350);

        return
    }

    alertElement.innerHTML = `
        <div class="alert-${type}">
            ${text}
        </div>
    `;

    alertElement.classList.add('show');

    alertActive = true;

    setTimeout(() => {
        alertElement.classList.remove('show');
        alertActive = false;
    }, delay);
}


/* RESOURCES */
const resourceIndicators = {
    clock: document.getElementById('clock'),
    day: document.getElementById('day'),
    skillPoints: document.getElementById('skill-points'),
    gold: document.getElementById('gold'),
    citizens: document.getElementById('citizens'),
    unemployed: document.getElementById('unemployed'),
    happiness: document.getElementById('happiness'),
    wood: document.getElementById('wood'),
    berry: document.getElementById('berry'),
    stone: document.getElementById('stone'),
    iron: document.getElementById('iron'),
}

function updateResource(type, amount, overwrite=false) {
    userResources[type] = overwrite ? amount : userResources[type] + amount;

    updateIndicator(type, userResources[type])
}

function updateIndicator(id, value) {
    if (id === "clock") {
        value = value.toString().padStart(2, '0');
    }

    const indicator = resourceIndicators[id];

    indicator.innerText = value
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
    if (price > userResources.skillPoints) {
        sendAlert('error', 'error inc')
        
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

        activeTile = null // might break stuff

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
        case "buildable":
            addDescription("You can build on this plot.")
            addAction("build")

            break;
        case "collecting":
            addDescription("This item is currently getting collected.")
            addStatus("collecting")

            break;
        case "building":
            addDescription("A new building is being built here.")
            addStatus("building")

            break;
        case "built":
            addDescription(buildingDescriptions[activeTile.getAttribute('type')])
            addBuildingData(activeTile.id)

            break;

        case "stage-1":
        case "stage-2":
        case "stage-3":
            addDescription("A new plant is growing here.")

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

function addBuildingData(buildingId) {
    const buildingData = userBuildings.find(building => building.id === buildingId);

    let citizenHTML = ''

    buildingData.citizens.forEach(citizenId => {
        citizen = userCitizens.find(citizen => citizen.id === citizenId)

        citizenHTML += `<li>${citizen.name} ${citizen.surname}`

        if (buildingId.includes('house')) {
            citizenHTML += ` (${citizen.age})`
        } else {
            citizenHTML += ` (${citizen.status}) <button onclick="removeCitizen('${citizenId}')">Remove</button>`
        }

        citizenHTML += '</li>'
    })

    let addCitizen = ''

    if (buildingData.citizens.length < buildingData.max_citizens && buildingData.add_citizen) {
        addCitizen = `<button onclick="addCitizen('${buildingId}')">Add citizen</button>`
    }

    itemMenu.querySelector('.status').innerHTML += `
        <ul>
            ${citizenHTML}
        </ul>
        ${addCitizen}
    `
}

/* BUILD MENU */
const buildMenu = document.getElementById('build-menu')

function toggleBuildMenu() {
    disableMovement = !disableMovement

    buildMenu.style.bottom = `${itemMenu.offsetHeight + 50}px`
    buildMenu.classList.toggle('active')
}