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

function generateMap(seed) {
    const random = customRandom(seed);
    const selections = ['grass', 'wood', 'stone', 'berry', 'iron', 'papyrus'];
    const probabilities = [0.380, 0.450, 0.1, 0.020, 0.025, 0.025];

    console.log(probabilities.reduce((a, b) => a + b, 0));

    for (let rowIndex = 0; rowIndex < 30; rowIndex ++) {
        const row = createTileRow();

        for (let columnIndex = 0; columnIndex < 50; columnIndex ++) {
            const randomValue = random();
            let cumulativeProbability = 0;

            for (let j = 0; j < selections.length; j++) {
                cumulativeProbability += probabilities[j];

                if (randomValue <= cumulativeProbability) {
                    row.appendChild(createTile(random, selections[j], columnIndex, rowIndex));
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

function createTile(random, type, posX, posY) {
    const tile = document.createElement('div')

    if (type === "berry" && random() > 0.75) {
        berries.push({pos_x: posX, pos_y: posY})
    }

    tile.classList.add('tile')
    tile.classList.add(`${type}-tile-${Math.floor(random() * 3) + 1}`)

    tile.setAttribute("pos-x", posX)
    tile.setAttribute("pos-y", posY)
    tile.setAttribute("type", type)

    let status = 'idle'

    if (collectables.includes(type)) {
        status = 'collectable'
    } else if (type === "grass") {
        status = 'buildable'
    }

    tile.setAttribute("status", status)
    tile.setAttribute("growable", "yes")

    return tile
}

function generateBerries(seed) {
    const random = customRandom(seed);
    
    berries.forEach(coordinates => {
        getTilesInRadius(coordinates.pos_x, coordinates.pos_y, 1).forEach(tile => {
            const randomValue = random();

            if (randomValue < 0.5) {
                tile.setAttribute("class", `tile berry-tile-${Math.floor(random() * 3) + 1}`)
                tile.setAttribute("type", "bush")
                tile.setAttribute('status', "collectable")
            }
        })
    })
}

/* ITEMS */
const collectables = ['wood', 'berry', 'papyrus', 'stone', 'iron']

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