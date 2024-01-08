function action(actionId) {
    const skill = getSkill(null)

    if (!skill.includes(actionId)) {
        sendAlert('error', `You cannot perform this action.`)
        
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

            case "trading":
                return userTrading
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
    const availableCitizen = userCitizens.find(citizen => citizen.employment === null && citizen.status === "idle")

    if (availableCitizen === undefined) {
        sendAlert('error', `You don't have an available villager.`)
        
        return
    }

    const tile = activeTile
    const type = tile.getAttribute('type')
    
    if (type === 'grass') {
        return
    }

    availableCitizen.status = "collecting"

    updateResource('unemployed', -1)

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
        updateResource('unemployed', 1)

        availableCitizen.status = "idle"
    }, 15000)
}

function build(type) {
    const tile = activeTile;

    toggleBuildMenu();

    if (type !== "buildersHut") {
        const { skill, resources, time } = buildingRequirements[type];

        if (skill !== null && !getSkill(skill).includes(type)) {
            sendAlert('error', "You don't know how to build that.");
            return;
        }

        if (!hasResources(resources)) {
            return;
        }

        if (!hasIdleBuilder()) {
            sendAlert('error', "You have no builders available.");
            return;
        }

        useResources(resources);
        buildBuilding(tile, type, time);

        return;
    }

    const id = `buildersHut_${new Date().getTime().toString().replace('.', '')}`;

    tile.setAttribute('class', `tile buildersHut-tile`);
    tile.setAttribute('type', 'buildersHut');
    tile.setAttribute('status', 'built');
    tile.id = id;

    userBuildings.push(getBuildingData(type, id, parseInt(tile.getAttribute('pos-x')), parseInt(tile.getAttribute('pos-y'))));

    updateActionsMenu();
}

function addCitizen(buildingId) {
    const buildingData = userBuildings.find(building => building.id === buildingId)
    
    if (buildingData.citizens.length > buildingData.max_citizens || !buildingData.add_citizen) {
        sendAlert('error', "You cannot add any citizens to this building.")

        return
    }

    const citizen = getRandomElement(userCitizens.filter(citizen => citizen.employment === null && citizen.status === "idle"));

    if (citizen === undefined) {
        sendAlert('error', "There is no one available right now.")

        return
    }

    if (buildingId.includes('buildersHut_')) {
        buildingData.function.available_citizens.push(citizen.id)
    }

    buildingData.citizens.push(citizen.id);
    buildingData.function.status = 'idle'

    citizen.employment = buildingId;

    updateResource('unemployed', -1)
    updateActionsMenu();
} 