// building
function startBuilding() {
    const buildersHut = buildingsArray.find(building => building.id.startsWith("buildersHut") && building.function.status === "idle");
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

        console.log(tile)

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