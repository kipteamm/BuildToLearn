// building
function hasIdleBuilder() {
    return userBuildings.some(building => building.id.startsWith("buildersHut") && building.function.unavailable_citizens.length < building.citizens.length);
}

function buildBuilding(tile, type, time) {
    const buildersHut = userBuildings.find(building => building.id.startsWith("buildersHut") && building.function.unavailable_citizens.length < building.citizens.length);

    if (buildersHut === undefined) {
        sendAlert('error', "You have no builders available.")

        return
    }

    const citizenId = buildersHut.citizens[0]

    buildersHut.citizens.shift()
    buildersHut.function.unavailable_citizens.push(citizenId)

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

        buildersHut.citizens.push(citizenId)
        buildersHut.function.unavailable_citizens.splice(buildersHut.function.unavailable_citizens.indexOf(citizenId), 1)
    }, time * 1000)
}

// lumber 
function startLumberCamp(building) {
    if (building.citizens.length < 1) {
        return
    }

    if (building.status !== "working") {
        sendAlert('error', building.status)

        return
    }

    const availableCitizens = Array.from(building.citizens)
    const tiles = getTilesInRadius(building.x, building.y, building.function.radius).sort(() => Math.random() - 0.5)

    const duration = (dayDuration / 4) + (Math.floor(radius / 2))

    if (duration >= (dayDuration / 2)) {
        building.function.status = "Trees are too far away."
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