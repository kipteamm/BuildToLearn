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

    switch (type) {
        case "lumberCamp":
            requirements.wood = 5

            break;

        case "house":
            requirements.wood = 20

            break;
    }

    if (type !== "buildersHut") {
        if (!hasIdleBuilder()) {
            sendAlert('error', "You have no builders available.")

            return
        }

        if (!hasResources(requirements)) {
            return
        }

        startBuilding(tile)
    }

    toggleBuildMenu()

    const id = `buildersHut_${new Date().getTime().toString().replace('.', '')}`

    tile.setAttribute('class', `tile buildersHut-tile`)
    tile.setAttribute('type', 'buildersHut')
    tile.setAttribute('status', 'built')
    tile.id = id

    userBuildings.push(getBuildingData(type, id, parseInt(tile.getAttribute('pos-x')), parseInt(tile.getAttribute('pos-y'))))

    updateActionsMenu()
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
                    status: "unstaffed",
                    onDayStart: (building) => {},
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
                    status: "unstaffed",
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
                add_citizen: false,
                function: {
                    onDayStart: (building) => {},
                }
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
    buildingData.function.status = 'idle'

    citizen.employment = buildingId;

    updateResource('idle', -1)
    updateActionsMenu();
} 