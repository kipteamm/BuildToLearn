function getBuildingData(type, id, x, y) {
    const building = Object.create(buildingTypes[type]);

    building.init(id, x, y);
    
    return building;
}

// builder
function hasIdleBuilder() {
    return userBuildings.some(building => building.id.startsWith("buildersHut") && building.function.available_citizens.length > 0);
}

function buildBuilding(tile, type, time) {
    const buildersHut = userBuildings.find(building => building.id.startsWith("buildersHut") && building.function.available_citizens.length > 0);

    if (buildersHut === undefined) {
        sendAlert('error', "You have no builders available.")

        return
    }

    const citizenId = buildersHut.function.available_citizens[0]

    buildersHut.function.available_citizens.shift()

    tile.setAttribute('status', 'building')
    tile.setAttribute('status-start', new Date().getTime())
    tile.setAttribute('status-duration', time)

    updateActionsMenu()

    setTimeout(() => {
        const id = `${type}-${new Date().getTime().toString().replace('.', '')}`.replace('-', '_')

        tile.setAttribute('class', `tile ${type}-tile`)
        tile.setAttribute('type', type)
        tile.setAttribute('status', 'built')
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
    }, time * 1000)
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

        tile.setAttribute('status', 'collecting')
        tile.setAttribute('status-start', new Date().getTime())
        tile.setAttribute('status-duration', duration)

        setTimeout(() => {
            citizen.status = "idle"
            
            tile.setAttribute('class', `tile grass-tile-${Math.floor(Math.random() * 3) + 1}`)
            tile.setAttribute('type', 'grass')
            tile.setAttribute('status', 'buildable')

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
        return
    }

    if (building.function.status === "out_of_range") {
        sendAlert('error', "Bushes are too far away.")

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

        if (tile.getAttribute('type') !== 'berry') continue;

        const citizen = userCitizens.find(citizen => citizen.id === availableCitizens[0])

        availableCitizens.shift()

        citizen.status = "working"

        tile.setAttribute('status', 'collecting')
        tile.setAttribute('status-start', new Date().getTime())
        tile.setAttribute('status-duration', duration)

        setTimeout(() => {
            citizen.status = "idle"
            
            tile.setAttribute('class', `tile grass-tile-${Math.floor(Math.random() * 3) + 1}`)
            tile.setAttribute('type', 'grass')
            tile.setAttribute('status', 'buildable')

            updateResource('berry', 4)
        }, duration * 1000)
    }

    if (availableCitizens.length > 0) {
        building.function.radius += 1
    }
}

// market
function hasEaten(citizen) {
    if (!userBuildings.some(building => building.id.includes('foodMarket_') && building.citizens.length === 1)) return false

    if (userResources.berry === 0) return false

    updateResource('berry', -1)

    return true
}