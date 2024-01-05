function action(actionId) {
    const skill = getSkill(null)

    if (!skill.includes(actionId)) {
        sendAlert('error', `You cannot perform this action.`)
        
        return
    }

    if (userResources.idle - 1 < 0) {
        sendAlert('error', `You don't have an available villager.`)
        
        return
    }

    switch (actionId) {
        case "collect":
            collect()

            break;

        case "build":
            toggleBuildMenu()

            break;
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

        case "grass":
            return ['build']
    }

    return []
}

function collect() {
    const tile = activeTile
    const type = tile.getAttribute('type')
    
    if (type === 'grass') {
        return
    }

    updateResource('idle', -1)

    tile.setAttribute('status', 'collecting')
    tile.setAttribute('status-start', new Date().getTime())
    tile.setAttribute('status-duration', 15)

    updateActionsMenu()

    setTimeout(() => {
        tile.setAttribute('class', `tile grass-tile-${Math.floor(Math.random() * 3) + 1}`)
        tile.setAttribute('type', 'grass')
        tile.setAttribute('status', 'buildable')

        updateActionsMenu()

        updateResource(type, 1)
        updateResource('idle', 1)
    }, 15000)
}

function build(type) {
    const tile = activeTile;

    let requirements = {};
    let builder = true

    switch (type) {
        case "buildersHut":
            builder = false

            break;

        case "lumberCamp":
            requirements.wood = 5

            break;

        case "house":
            requirements.wood = 20

            break;
    }

    for (const [key, val] of Object.entries(requirements)) {
        if (userResources[key] < val) {
            sendAlert('error', `You don't have enough ${key}.`)

            return
        }

        updateResource(key, val * -1)
    }

    if (builder) {
        startBuilding(tile)

        return
    }

    toggleBuildMenu()
    updateResource('idle', -1)

    tile.setAttribute('status', 'building')
    tile.setAttribute('status-start', new Date().getTime())
    tile.setAttribute('status-duration', 15)

    updateActionsMenu()

    setTimeout(() => {
        const id = `${type}-${new Date().getTime().toString().replace('.', '')}`.replace('-', '_')

        tile.setAttribute('class', `tile ${type}-tile`)
        tile.setAttribute('type', type)
        tile.setAttribute('status', 'built')
        tile.id = id

        userBuildings.push(getBuildingData(type, id, parseInt(tile.getAttribute('pos-x')), parseInt(tile.getAttribute('pos-y'))))
        
        if (type === 'buildersHut') {
            buildersHuts.push(id)
        }

        updateActionsMenu()

        updateResource('idle', 1)
    }, 15000)
}

function getBuildingData(type, id, x, y) {
    switch(type) {
        case "buildersHut":
            return {
                id: id,
                x: x,
                y: y,
                citizens: [],
                max_citizens: 3,
                add_citizen: true,
                function: {
                    status: "idle"
                }
            }

        case "lumberCamp":
            return {
                id: id,
                x: x,
                y: y,
                citizens: [],
                max_citizens: 3,
                add_citizen: true,
                function: {
                    radius: 1,
                    status: "idle",
                    onDayStart: (building) => {
                        startLumberCamp(building)
                    },
                }
            }

        case "house":
            return {
                id: id,
                x: x,
                y: y,
                citizens: [],
                max_citizens: 8,
                add_citizen: false
            }
    }
}

function addCitizen(buildingId) {
    const buildingData = userBuildings.find(building => building.id === buildingId)
    
    if (buildingData.citizens.length > buildingData.max_citizens || !buildingData.add_citizen) {
        sendAlert('error', "You cannot add any citizens to this building.")

        return
    }

    if (userCitizens.find(citizen => citizen.employment === null) === 'undefined') {
        sendAlert('error', "You have no more unemployed citizens.")

        return
    }

    const citizen = getRandomElement(userCitizens.filter(citizen => citizen.employment === null));

    buildingData.citizens.push(citizen);

    citizen.employment = buildingId;

    updateResource('idle', -1)
    updateActionsMenu();
} 