function action(actionId) {
    const skill = getSkill(null)

    if (!skill.includes(actionId)) {
        alert(`You cannot collect this item.`)
        
        return
    }

    if (userResources.idle - 1 < 0) {
        alert(`You don't have an available villager.`)
        
        return
    }

    updateResource('idle', -1)

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
        case "wood":
            return userForaging

        case "berry":
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
    const type = tile.getAttribute('type')
    
    if (type === 'grass') {
        return
    }

    tile.setAttribute('status', 'collecting')
    tile.setAttribute('status-start', new Date().getTime())
    tile.setAttribute('status-duration', 15)

    updateActionsMenu()

    setTimeout(() => {
        tile.setAttribute('class', `tile grass-tile-${Math.floor(Math.random() * 3) + 1}`)
        tile.setAttribute('type', 'grass')
        tile.setAttribute('status', '')

        updateActionsMenu()

        updateResource(type, 1)
        updateResource('idle', 1)
    }, 15000)
}