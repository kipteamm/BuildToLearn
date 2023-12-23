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
    const type = activeTile.getAttribute('type')
    
    if (type === 'grass') {
        return
    }

    activeTile.setAttribute('status', 'collecting')
    activeTile.setAttribute('status-start', new Date().getTime())
    activeTile.setAttribute('status-duration', 15)

    updateActionsMenu()

    setTimeout(() => {
        activeTile.setAttribute('class', `tile grass-tile-${Math.floor(Math.random() * 3) + 1}`)
        activeTile.setAttribute('type', 'grass')
        activeTile.setAttribute('status', '')

        updateActionsMenu()

        updateResource(type, 1)
    }, 15000)
}