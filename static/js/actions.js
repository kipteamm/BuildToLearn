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
    itemMenu.querySelector('.actions').innerHTML = '';

    const type = activeTile.getAttribute("type")

    itemMenu.querySelector('span.title').innerText = type

    itemMenu.style.display = 'block'

    if (activeTile.getAttribute('status') === "collecting") {
        addStatus('collecting')
    } else {
        if (['tree', 'stone', 'bush', 'iron', 'papyrus'].includes(type)) {
            addAction('collect')
        }
    }
}

function addAction(actionId) {
    const actionWrapper = document.createElement('button')

    actionWrapper.setAttribute('onclick', `action('${actionId}')`)
    actionWrapper.classList.add('action')
    actionWrapper.innerText = actionId

    itemMenu.querySelector('.actions').appendChild(actionWrapper)
}

function addStatus(statusId) {
    const statusWrapper = document.createElement('div');

    statusWrapper.classList.add('status');
    statusWrapper.innerText = statusId;
    statusWrapper.style.transition = `width 15s`;
    statusWrapper.style.width = '0%';

    itemMenu.querySelector('.actions').appendChild(statusWrapper);

    void statusWrapper.offsetWidth;

    statusWrapper.style.width = 'calc(100% - 25px)';
}

function action(actionId) {
    const skill = getSkill(null)

    if (!skill.includes(actionId)) {
        alert(`You cannot collect this item.`)
        
        return
    }

    switch (actionId) {
        case "collect":
            collect()
    }
}

function getSkill(skill=null) {
    if (skill !== null) {
        switch (skill) {
            case "foraging":
                return userForaging
            
            case "farming":
                return userFarming

            case "mining":
                return userMining
        }
    }

    switch (activeTile.getAttribute('type')) {
        case "tree":
            return userForaging

        case "bush":
        case "papyrus":
            return userFarming

        case "stone":
        case "iron":
            return userMining
    }

    return []
}

function collect() {
    const tile = activeTile

    if (tile.getAttribute('type') === 'grass') {
        return
    }

    tile.setAttribute('status', 'collecting')
    tile.setAttribute('type', 'grass')

    updateActionsMenu()

    setTimeout(() => {
        tile.setAttribute('class', `tile grass-tile-${Math.floor(Math.random() * 3) + 1}`)
        tile.setAttribute('status', '')

        updateActionsMenu()

        updateResource(tile.getAttribute('type'))
    }, 15000)
}