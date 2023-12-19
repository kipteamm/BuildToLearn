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

    itemMenu.querySelector('.actions').innerHTML = '';

    activeTile = tile

    const type = tile.getAttribute("type")

    itemMenu.querySelector('span.title').innerText = type

    itemMenu.style.display = 'block'

    if (['tree', 'stone', 'bush', 'iron', 'papyrus'].includes(type)) {
        addAction('collect')
    }
}

function closeActionMenu() {
    itemMenu.style.display = 'none'
}

function addAction(actionId) {
    const actionWrapper = document.createElement('button')

    actionWrapper.setAttribute('onclick', `action('${actionId}')`)
    actionWrapper.classList.add('action')
    actionWrapper.innerText = 'Collect'

    itemMenu.querySelector('.actions').appendChild(actionWrapper)
}

function action(actionId) {
    const skill = getSkill(null)

    if (!skill.includes(actionId)) {
        alert('error inc')
        
        return
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

        case "bush" || "papyrus":
            return userFarming

        case "stone" || "iron":
            return userMining
    }
}