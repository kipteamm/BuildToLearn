function getBuildingData(type, id, x, y) {
    const building = Object.create(buildingTypes[type]);

    building.init(id, x, y);
    
    return building;
}

// builder
function hasIdleBuilder() {
    return userBuildings.some(building => building.id.startsWith("buildersHut") && building.function.available_citizens.length > 0);
}

function buildBuilding(tile, type, duration) {
    const buildersHut = userBuildings.find(building => building.id.startsWith("buildersHut") && building.function.available_citizens.length > 0);

    if (buildersHut === undefined) {
        sendAlert('error', "You have no builders available.")

        return
    }

    const citizenId = buildersHut.function.available_citizens[0]
    const citizen = userCitizens.find(citizen => citizen.id === citizenId)

    citizen.status = 'working'

    buildersHut.function.available_citizens.shift()

    updateTile(tile, null, true, 'building', new Date().getTime(), duration, 'no')

    const neighbouringTiles = getTilesInRadius(parseInt(tile.getAttribute('pos-x')), parseInt(tile.getAttribute('pos-y')), 1)

    neighbouringTiles.forEach(neighbouringTile => {
        if (neighbouringTile.getAttribute('growable') === "yes") {
            neighbouringTile.setAttribute('growable', 'no')
        }
    })

    updateActionsMenu()

    setTimeout(() => {
        const id = `${type}-${new Date().getTime().toString().replace('.', '')}`.replace('-', '_')

        updateTile(tile, type, true, 'built')

        tile.id = id

        userBuildings.push(getBuildingData(type, id, parseInt(tile.getAttribute('pos-x')), parseInt(tile.getAttribute('pos-y'))))

        updateActionsMenu()

        buildersHut.function.available_citizens.push(citizenId)
        citizen.status = 'idle'

        sendAlert('success', `Finished building ${type}`)

        if (type === "house") {
            userCitizens.filter(citizen => citizen.house === null).forEach(citizen => {
                findHouse(citizen)
            })
        }
    }, duration * 1000)
}

// lumber 
function startLumberCamp(building) {
    if (building.citizens.length < 1) {
        return
    }

    if (building.function.status === "out_of_range") {
        sendAlert('error', "Trees are too far away.")

        return
    }

    const [tiles, duration] = findTiles(building, 'wood')

    if (tiles.length < 1) {
        building.function.status = "out_of_range";

        sendAlert('error', "Trees are too far away.")

        return
    }
    
    const availableCitizens = Array.from(building.citizens);

    tiles.forEach(tile => collectResource(tile, availableCitizens, duration, 'wood'));
}

// gatherers hut
function startGatherersHut(building) {
    if (building.citizens.length < 1) {
        return;
    }

    if (building.function.status === "out_of_range") {
        sendAlert('error', "Bushes are too far away.");
        return;
    }

    const [tiles, duration] = findTiles(building, 'berry')

    if (tiles.length < 1) {
        building.function.status = "out_of_range";

        sendAlert('error', "Trees are too far away.")

        return
    }
    
    const availableCitizens = Array.from(building.citizens);

    tiles.forEach(tile => collectResource(tile, availableCitizens, duration, 'berry'));
}

// reforestation camp
function startReforestationCamp(building) {
    if (building.citizens.length < 1) {
        return;
    }

    if (building.function.status === "out_of_range") {
        sendAlert('error', "Bushes are too far away.");
        return;
    }

    const availableCitizens = Array.from(building.citizens)

    for (let i = 0; i < availableCitizens.length; i++) {
        const citizenId = availableCitizens[i]
        const citizen = userCitizens.find(citizen => citizen.id === citizenId)

        let tiles = [];
        let radius = 1;

        while (true) {
            duration = (dayDuration / 4) + Math.floor(radius / 2);

            if (duration >= dayDuration / 2) {
                building.function.status = "out_of_range";

                break;
            }

            tiles = getTilesInRadius(building.x, building.y, radius).sort(() => Math.random() - 0.5);

            if (tiles.filter(tile => tile.getAttribute('type') === 'grass').length > 1) {
                break;
            }

            radius += 1;
        }

        if (tiles.length < 1) {
            continue;
        }

        citizen.status = 'working'

        for (let i = 0; i < 2; i++) {
            updateTile(tile, null, false, 'planting', new Date().getTime(), duration)

            setTimeout(() => {
                citizen.status = "idle"

                updateTile(tile, 'sapling', true, 'stage-1');
            }, duration * 1000)
        }
    }
}

// market
function hasEaten() {
    if (!userBuildings.some(building => building.id.includes('foodMarket_') && building.citizens.length === 1)) return false

    if (userResources.berry === 0) return false

    updateResource('berry', -2)

    return true
}