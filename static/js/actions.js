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
            return userFarming

        case "grass":
            return ['build']
    }

    return []
}

function collect() {
    if (currentHour > nightTime || currentHour < dayTime) {
        sendAlert('error', "Your citizens are currently asleep.")

        return
    }

    const availableCitizen = userCitizens.find(citizen => citizen.employment === null && citizen.status === "idle")

    if (availableCitizen === undefined) {
        sendAlert('error', `You don't have an available villager.`)
        
        return
    }

    const tile = activeTile
    let type = tile.getAttribute('type')
    
    if (type === 'grass') {
        return
    }

    availableCitizen.status = "collecting"

    updateResource('unemployed', -1)

    updateTile(tile, null, false, 'collecting', new Date().getTime(), 15, null)

    updateActionsMenu()

    setTimeout(() => {
        if (type === 'berry') {
            updateTile(tile, 'berrySeeds', false, 'stage-1', null, null, null)
        } else {
            updateTile(tile, 'grass', true, 'buildable', null, null, null)
        }

        updateActionsMenu()

        updateResource(type, 1)
        updateResource('unemployed', 1)

        availableCitizen.status = "idle"
    }, 15000)
}

function build(type) {
    if (currentHour > nightTime || currentHour < dayTime) {
        sendAlert('error', "Your builders are asleep.");

        return
    }
    
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

    updateTile(tile, 'buildersHut', false, 'built', null, null, 'no')

    tile.id = id;

    const neighbouringTiles = getTilesInRadius(parseInt(tile.getAttribute('pos-x')), parseInt(tile.getAttribute('pos-y')), 1)

    neighbouringTiles.forEach(neighbouringTile => {
        if (neighbouringTile.getAttribute('growable') === "yes") {
            neighbouringTile.setAttribute('growable', 'no')
        }
    })

    userBuildings.push(getBuildingData(type, id, parseInt(tile.getAttribute('pos-x')), parseInt(tile.getAttribute('pos-y'))));

    updateActionsMenu();
}

function addCitizen(buildingId) {
    const buildingData = userBuildings.find(building => building.id === buildingId)
    
    if (buildingData.citizens.length > buildingData.max_citizens || !buildingData.add_citizen) {
        sendAlert('error', "You cannot add any citizens to this building.")

        return
    }

    const citizen = getRandomElement(userCitizens.filter(citizen => citizen.employment === null && citizen.status === "idle" && citizen.age >= employmentAge));

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

function unemployCitizen(citizenId) {
    const citizen = userCitizens.find(citizen => citizen.id === citizenId)

    if (citizen.employment === null) return

    if (citizen.status !== 'idle') {
        sendAlert('error', "Wait for this citizen to finish.")

        return
    }

    const buildingData = userBuildings.find(building => building.id === citizen.employment)

    buildingData.citizens = buildingData.citizens.filter(_citizenId => _citizenId !== citizenId);

    citizen.employment = null;

    updateResource('unemployed', 1)
    updateActionsMenu();
}