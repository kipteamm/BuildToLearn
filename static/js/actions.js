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
        case "house":
            requirements.wood = 20

            break;
        
        case "lumberCamp":
            requirements.wood = 5

            break;
    }

    for (const [key, val] of Object.entries(requirements)) {
        if (userResources[key] < val) {
            sendAlert('error', `You don't have enough ${key}.`)

            return
        }

        updateResource(key, val * -1)
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

        userBuildings[id] = getBuildingData(type, id)

        updateActionsMenu()

        updateResource('idle', 1)
    }, 15000)
}

function getBuildingData(type, id) {
    switch(type) {
        case "lumberCamp":
            return {
                id : id,
                citizens: [],
                max_citizens: 3,
                add_citizen: true,
                function: {
                    onDayStart: (id) => {
                        startLumberCamp(id)
                    },
                }
            }

        case "house":
            return {
                citizens: [],
                max_citizens: 8,
                add_citizen: false
            }
    }
}

function addCitizen(buildingId) {
    const buildingData = userBuildings[buildingId]
    
    if (buildingData.citizens.length > buildingData.max_citizens || !buildingData.add_citizen) {
        sendAlert('error', "You cannot add any citizens to this building.")
    }

    if (userUnemployedCitizens.length === 0) {
        sendAlert('error', "You have no more unemployed citizens.")
    }
 
    const citizen = getRandomElement(userUnemployedCitizens);

    userUnemployedCitizens.splice(userUnemployedCitizens.indexOf(citizen), 1);

    buildingData.citizens.push(citizen);

    userCitizens[citizen].employment = buildingId;

    updateActionsMenu();
} 