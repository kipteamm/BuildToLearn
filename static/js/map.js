const mapContainer = document.getElementById('map-container');
const mapContent = document.getElementById('map-content');

let isDragging = false;
let isMoving = true;
let startX, startY, startTranslateX, startTranslateY;
let accumulatedTranslateX = 0;
let accumulatedTranslateY = 0;
let accumulatedScale = 1; // Initial scale
let disableMovement = false;

let berries = []

mapContent.addEventListener('mousedown', function(e) {
    if (disableMovement) return;

    isDragging = true;
    isMoving = false;

    startX = e.clientX;
    startY = e.clientY;

    // Get the current translation values
    const transformValues = getTransformValues(mapContent);
    startTranslateX = transformValues.translateX;
    startTranslateY = transformValues.translateY;

    e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
    if (disableMovement) return;
    if (!isDragging) return;

    isMoving = true
    
    closeActionMenu()
    toggleMenu(activeMenu)

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Calculate the new translation values
    const newTranslateX = startTranslateX + deltaX;
    const newTranslateY = startTranslateY + deltaY;

    if (Math.abs(newTranslateX) > mapContent.offsetWidth / 2) {
        accumulatedTranslateX = startTranslateX;
    } else if (Math.abs(newTranslateY) > mapContent.offsetHeight / 2) {
        accumulatedTranslateY = startTranslateY;
    } else {
        // Update the accumulated translation values
        accumulatedTranslateX = newTranslateX;
        accumulatedTranslateY = newTranslateY;
    }

    // Apply the updated translation
    mapContent.style.transform = `translate(${accumulatedTranslateX}px, ${accumulatedTranslateY}px) scale(${accumulatedScale})`;
});

document.addEventListener('mouseup', function(e) {
    if (disableMovement) return;

    isDragging = false;

    if (!isMoving) {
        if (e.target === activeTile) {
            closeActionMenu()
        } else {
            openActionMenu(e.target)
        }

        if (e.target.closest('.menu-item') === null) {
            toggleMenu(activeMenu)
        }
    }

    isMoving = false
});

mapContainer.addEventListener('wheel', function(e) {
    if (disableMovement) return;

    e.preventDefault();

    const zoomFactor = 0.1;
    const delta = e.deltaY > 0 ? 1 - zoomFactor : 1 + zoomFactor;

    // Update the accumulated scale
    accumulatedScale *= delta;

    if (accumulatedScale > 2) {
        accumulatedScale = 2
    } else if (accumulatedScale < 0.5) {
        accumulatedScale = 0.5
    }

    // Apply the updated translation and zoom
    mapContent.style.transform = `translate(${accumulatedTranslateX}px, ${accumulatedTranslateY}px) scale(${accumulatedScale})`;

    closeActionMenu()
    toggleMenu(activeMenu)
});

function getTransformValues(element) {
    // Get the current transform value
    const transformValue = window.getComputedStyle(element).getPropertyValue('transform');

    // Check if the transform value is not present or not a matrix
    if (!transformValue || transformValue === 'none') {
        return { translateX: 0, translateY: 0 };
    }

    // Parse the current transform values
    const matrixValues = transformValue.match(/matrix\(([^\)]+)\)/);

    // Check if the matrixValues array is not present or doesn't have enough elements
    if (!matrixValues || matrixValues.length < 2) {
        return { translateX: 0, translateY: 0 };
    }

    // Extract translation values
    const values = matrixValues[1].split(', ');
    const translateX = parseFloat(values[4]) || 0;
    const translateY = parseFloat(values[5]) || 0;

    return { translateX, translateY };
}

window.addEventListener(`contextmenu`, (e) => e.preventDefault());

function customRandom(seed) {
    let state = seed;

    return function() {
        const x = Math.sin(state++) * 10000;
        return x - Math.floor(x);
    };
}

function generateMap() {
    generateTiles()
    generateBerries()
    generateRiver()
}

function generateTiles() {
    const tileTypes = ['grass', 'oak', 'spruce', 'berry'];
    const probabilities = [0.425, 0.275, 0.275, 0.025];

    //console.log(probabilities.reduce((a, b) => a + b, 0));

    for (let rowIndex = 0; rowIndex < 30; rowIndex ++) {
        const row = createTileRow();

        for (let columnIndex = 0; columnIndex < 50; columnIndex ++) {
            const randomValue = seedData();
            let cumulativeProbability = 0;

            for (let j = 0; j < tileTypes.length; j++) {
                cumulativeProbability += probabilities[j];

                if (randomValue <= cumulativeProbability) {
                    row.appendChild(createTile(tileTypes[j], columnIndex, rowIndex));
                    break;
                }
            }
        }

        mapContent.appendChild(row);
    }
}

function createTileRow() {
    const row = document.createElement('div')

    row.classList.add('tile-row')

    return row
}

function createTile(type, posX, posY) {
    const tile = document.createElement('div')

    if (type === "berry" && seedData() > 0.75) {
        berries.push({pos_x: posX, pos_y: posY})
    }

    let status = 'idle'

    if (collectables.includes(type)) {
        status = 'collectable'
    } else if (type === "grass") {
        status = 'buildable'
    }

    explicitType = type

    if (type === "oak" || type === "spruce") {
        explicitType = "wood"
    }

    updateTile(tile, type, true, status, null, null, 'yes', posX, posY, explicitType)

    return tile
}

function generateRiver() {
    const leftSide = document.querySelectorAll('[pos-x="0"]');

    let currentTile = leftSide[Math.floor(seedData() * leftSide.length)];

    updateTile(currentTile, 'water', true, 'water', null, null, 'no');

    let prevX = parseInt(currentTile.getAttribute('pos-x'));
    let prevY = parseInt(currentTile.getAttribute('pos-y'));

    while (parseInt(currentTile.getAttribute('pos-x')) < 49) {
        let x = parseInt(currentTile.getAttribute('pos-x'));
        let y = parseInt(currentTile.getAttribute('pos-y'));

        x += 1

        const yProb = Math.max(0.1, Math.min(0.9, seedData()));
        if (y > 0 && y < 29 && seedData() < yProb) {
            y += seedData() < 0.5 ? -1 : 1;
        }

        const straightProb = seedData();
        if (seedData() < straightProb) {
            y += seedData() < 0.5 ? -1 : 1;
        }

        if ((x !== prevX || y !== prevY) && Math.abs(x - prevX) <= 1 && Math.abs(y - prevY) <= 1 && y > 0 && y < 29) {
            if (y !== prevY) {
                flowTile = document.querySelector(`[pos-x="${x}"][pos-y="${prevY}"]`);

                updateTile(flowTile, 'water', true, 'water', null, null, 'no');
            }

            currentTile = document.querySelector(`[pos-x="${x}"][pos-y="${y}"]`);
        
            updateTile(currentTile, 'water', true, 'water', null, null, 'no');

            prevX = x;
            prevY = y;
        }
    }
}

function generateBerries() {
    berries.forEach(coordinates => {
        getTilesInRadius(coordinates.pos_x, coordinates.pos_y, 1).forEach(tile => {
            if (seedData() < 0.35) {
                updateTile(tile, 'berry', true, 'collectable', null, null, 'yes')
            }
        })
    })
}

function updateTile(tile, type=null, randomStyle=false, status=null, statusStart=null, statusDuration=null, growable=null, posX=null, posY=null, explicitType=null) {
    if (type !== null) {
        tile.setAttribute('class', randomStyle ? `tile ${type}-tile-${Math.floor(seedData() * 3) + 1}` : `tile ${type}-tile`);
        tile.setAttribute('type', (explicitType !== null) ? explicitType : type);
    }
    if (status !== null) tile.setAttribute('status', status);
    if (statusStart !== null) tile.setAttribute('status-start', statusStart);
    if (statusDuration !== null) tile.setAttribute('status-duration', statusDuration);
    if (growable !== null) tile.setAttribute('growable', growable);
    if (posX !== null) tile.setAttribute('pos-x', posX);
    if (posY !== null) tile.setAttribute('pos-y', posY)
}

/* ITEMS */
const collectables = ['oak', 'spruce', 'berry']

function getTilesInRadius(x, y, radius) {
    let tiles = [];

    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            if (i === 0 && j === 0) continue;

            if (Math.abs(i) === radius || Math.abs(j) === radius) {
                const tile = document.querySelector(`[pos-x='${x + i}'][pos-y='${y + j}']`)

                if (tile !== null) {
                    tiles.push(tile);
                }
            }
        }
    }

    return tiles;
}

function findTiles(building, type, radius=1, status=null) {
    let tiles = [];

    while (true) {
        duration = (dayDuration / 4) + Math.floor(radius / 2);

        if (duration >= dayDuration / 2) {
            building.function.status = "out_of_range";
            return [[], 0, radius];
        }

        tiles = getTilesInRadius(building.x, building.y, radius).sort(() => Math.random() - 0.5);

        if (status === null) {
            if (tiles.some(tile => tile.getAttribute('type') === type)) {
                return [tiles, duration, radius];
            }
        } else {
            if (tiles.some(tile => tile.getAttribute('type') === type && tile.getAttribute('status') === status)) {
                return [tiles, duration, radius];
            }
        }

        radius += 1;
    }
}

function collectResource(tile, citizen, duration, type) {
    citizen.status = "working";

    updateTile(tile, null, false, 'collecting', new Date().getTime(), duration);

    setTimeout(() => {
        citizen.status = "idle";

        if (type === "berry") {
            updateTile(tile, 'berrySeeds', false, 'stage-1');
        } else {
            updateTile(tile, 'grass', true, 'buildable')
        }
        
        updateResource(type, 4);
    }, duration * 1000);
}

// seeds
function growPlants() {
    document.querySelectorAll('[type="berrySeeds"]').forEach(element => {
        const stage = element.getAttribute('status').split('-')[1]

        let newStatus = `stage-${parseInt(stage) + 1}`
        let type = "berrySeeds"
        let randomStyle = false

        if (stage === "3") {
            newStatus = "collectable"

            type = 'berry'
            randomStyle = true
        }

        updateTile(element, type, randomStyle, newStatus)
    })

    document.querySelectorAll('[type="oakSapling"]').forEach(element => {
        const stage = element.getAttribute('status').split('-')[1]

        let newStatus = `stage-${parseInt(stage) + 1}`
        let type = "oakSapling"
        let randomStyle = false

        if (stage === "3") {
            newStatus = "collectable"

            type = 'oak'
            randomStyle = true
        }

        updateTile(element, type, randomStyle, newStatus)
    })
}