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

// lumber 
function startLumberCamp(building) {
    if (building.citizens.length < 1) {
        return
    }

    if (building.function.status === "out_of_range") {
        sendAlert('error', "Trees are too far away.")

        return
    }

    const [tiles, duration, radius] = findTiles(building, 'wood')

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

    const [tiles, duration, radius] = findTiles(building, 'berry')

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
        sendAlert('error', "There is no empty space left.")
        
        return;
    }

    const availableCitizens = Array.from(building.citizens)

    availableCitizens.forEach(citizen => {
        let [tiles, duration, radius] = findTiles(building, 'grass')

        tiles = tiles.filter(tile => tile.getAttribute('type') === 'grass');

        if (tiles.length < 2 && (dayDuration / 4) + Math.floor(radius / 2) < dayDuration / 2) {
            tiles.concat(findTiles(building, 'grass', radius).filter(tile => tile.getAttribute('type') === 'grass'));
        } else if (tiles.length > 1) {
            tiles.length = 2
        } else {
            building.function.status = "out_of_range";

            sendAlert('error', "There is no empty space left.")

            return
        }

        citizen.status = 'working'

        tiles.forEach(tile => {
            updateTile(tile, null, false, 'planting', new Date().getTime(), duration)
    
            setTimeout(() => {
                citizen.status = "idle"
    
                updateTile(tile, 'treeSapling', false, 'stage-1');
            }, duration * 1000)
        })
    })
}

// market
function hasEaten() {
    if (!userBuildings.some(building => building.id.includes('foodMarket_') && building.citizens.length === 1)) return false

    if (userResources.berry === 0) return false

    updateResource('berry', -2)

    return true
}