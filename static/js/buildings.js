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

        updateTile(tile, type, false, 'built')

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

// resource collectors
function collectResources(building, type) {
    if (building.citizens.length < 1) return;

    if (currentHour > nightTime || currentHour < dayTime) return;

    if (building.function.status === "out_of_range") {
        sendAlert('error', "Trees are too far away.")

        return
    }

    if (building.function.storage >= building.function.max_storage) {
        sendAlert('error', `${building} ran out of storage space.`)

        return
    }

    const availableCitizens = Array.from(building.citizens);

    let tiles = [];
    let searchTiles = true;
    let searchRadius = 1;

    while (availableCitizens.length > 0) {
        if (searchTiles) {
            tiles = getTilesInRadius(parseInt(building.x), parseInt(building.y), searchRadius);

            searchTiles = false;
        }

        const tile = tiles.find(tile => tile.getAttribute('type') === type && tile.getAttribute('status') === 'collectable')

        if (tile === undefined) {
            searchRadius++;

            searchTiles = true;

            continue;
        }

        const duration = (dayDuration / 4) + Math.floor(searchRadius / 2);

        if (duration >= dayDuration / 2) {
            building.function.status = "out_of_range";
            
            break;
        }

        const citizenId = availableCitizens.shift();
        const citizen = userCitizens.find(citizen => citizen.id === citizenId);

        collectResource(tile, citizen, duration, type);

        building.function.storage += 1;
    }

    console.log('finished', building);

    collectResources();
}

// reforestation camp
function startReforestationCamp(building) {
    if (building.citizens.length < 1) {
        return
    }

    if (building.function.status === "out_of_range") {
        sendAlert('error', "Trees are too far away.")

        return
    }

    const availableCitizens = Array.from(building.citizens);

    let tiles = [];
    let searchTiles = true;
    let searchRadius = 1;

    while (availableCitizens.length > 0) {
        if (searchTiles) {
            tiles = getTilesInRadius(parseInt(building.x), parseInt(building.y), searchRadius);

            searchTiles = false;
        }

        const tile = tiles.find(tile => tile.getAttribute('type') === 'grass' && tile.getAttribute('status') === 'buildable')

        if (tile === undefined) {
            searchRadius++;

            searchTiles = true;

            continue;
        }

        const duration = (dayDuration / 4) + Math.floor(searchRadius / 2);

        if (duration >= dayDuration / 2) {
            building.function.status = "out_of_range";
            
            break;
        }

        const citizenId = availableCitizens.shift();
        const citizen = userCitizens.find(citizen => citizen.id === citizenId);

        updateTile(tile, null, false, 'planting', new Date().getTime(), duration)

        citizen.status = "working"
    
        setTimeout(() => {
            citizen.status = "idle"
    
            updateTile(tile, building.function.tree_type, false, 'stage-1');
        }, duration * 1000)
    }

    console.log('finished', building);
}

// market
function stockBuilding(building, type) {
    if (building.citizens.length < 1) return;

    if (currentHour > nightTime || currentHour < dayTime) return;

    if (building.function.storage > building.function.max_storage) {
        sendAlert('error', `${building.id} ran out of storage space.`)

        return
    }

    const supplier = userBuildings.filter(building => building.id.includes(type === "wood"? 'lumberCamp_' : 'gatherersHut') && building.function.storage > 0).sort((a, b) => a.function.storage - b.function.storage)[0];
    const max_capacity = Math.min(building.function.max_storage - building.function.storage, supplier.function.storage);

    supplier.function.storage -= max_capacity;
    building.function.storage += max_capacity;

    console.log('finished', building);
}

function hasEaten() {
    const building = userBuildings.find(building => building.id.includes('foodMarket_') && building.citizens.length === 1 && building.function.storage > 1);

    if (building === undefined) return false

    updateResource('berry', -2)

    building.function.storage -= 2

    return true
}