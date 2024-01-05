// lumber 
function startLumberCamp(building) {
    if (building.citizens.length < 1) {
        return
    }

    const availableCitizens = Array.from(building.citizens)
    const tiles = getTilesInRadius(building.x, building.y, building.function.radius).sort(() => Math.random() - 0.5)

    for (var i = 0; i < tiles.length; i ++) {
        if (availableCitizens.length === 0) break;
        
        const tile = tiles[i]

        if (tile.getAttribute('type') !== 'wood') continue;

        console.log(tile)

        const citizen = userCitizens[availableCitizens[0]]

        availableCitizens.shift()

        citizen.status = "working"

        tile.setAttribute('status', 'collecting')
        tile.setAttribute('status-start', new Date().getTime())
        tile.setAttribute('status-duration', (dayDuration / 2))

        setTimeout(() => {
            citizen.status = "idle"
            
            tile.setAttribute('class', `tile grass-tile-${Math.floor(Math.random() * 3) + 1}`)
            tile.setAttribute('type', 'grass')
            tile.setAttribute('status', 'buildable')

            updateResource('wood', 3)
        }, (dayDuration / 2) * 1000)
    }

    if (availableCitizens.length > 0) {
        building.function.radius += 1
    }

    console.log(building)
}