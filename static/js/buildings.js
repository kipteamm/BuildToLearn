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

    const availableCitizens = Array.from(building.citizens)
    const tiles = getTilesInRadius(building.x, building.y, building.function.radius).sort(() => Math.random() - 0.5)

    const duration = (dayDuration / 4) + (Math.floor(building.function.radius / 2))

    if (duration >= (dayDuration / 2)) {
        building.function.status = "out_of_range"
    }

    for (var i = 0; i < tiles.length; i ++) {
        if (availableCitizens.length === 0) break;
        
        const tile = tiles[i]

        if (tile.getAttribute('type') !== 'wood') continue;

        const citizen = userCitizens.find(citizen => citizen.id === availableCitizens[0])

        availableCitizens.shift()

        citizen.status = "working"

        updateTile(tile, null, false, 'collecting', new Date().getTime(), duration)

        setTimeout(() => {
            citizen.status = "idle"

            updateTile(tile, 'grass', false, 'buildable')

            updateResource('wood', 3)
        }, duration * 1000)
    }

    if (availableCitizens.length > 0) {
        building.function.radius += 1
    }
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

    let tiles = [];
    let radius = 1;

    while (true) {
        duration = (dayDuration / 4) + Math.floor(radius / 2);

        if (duration >= dayDuration / 2) {
            building.function.status = "out_of_range";
            return;
        }

        tiles = getTilesInRadius(building.x, building.y, radius).sort(() => Math.random() - 0.5);

        if (tiles.some(tile => tile.getAttribute('type') === 'berry')) {
            break;
        }

        radius += 1;
    }
    
    const availableCitizens = Array.from(building.citizens);

    tiles.forEach(tile => collectBerries(tile, availableCitizens, duration));
}

function collectBerries(tile, availableCitizens, duration) {
    if (availableCitizens.length === 0 || tile.getAttribute('type') !== 'berry') {
        return;
    }

    const citizenId = availableCitizens.shift();
    const citizen = userCitizens.find(c => c.id === citizenId);

    citizen.status = "working";
    updateTile(tile, null, false, 'collecting', new Date().getTime(), duration);

    setTimeout(() => {
        citizen.status = "idle";
        updateTile(tile, 'berrySeeds', true, 'stage-1');
        updateResource('berry', 4);
    }, duration * 1000);
}

// market
function hasEaten() {
    if (!userBuildings.some(building => building.id.includes('foodMarket_') && building.citizens.length === 1)) return false

    if (userResources.berry === 0) return false

    updateResource('berry', -1)

    return true
}