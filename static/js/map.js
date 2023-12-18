const mapContainer = document.getElementById('map-container');
const mapContent = document.getElementById('map-content');

let isDragging = false;
let startX, startY, startTranslateX, startTranslateY;
let accumulatedTranslateX = 0;
let accumulatedTranslateY = 0;
let accumulatedScale = 1; // Initial scale

mapContent.addEventListener('mousedown', function(e) {
    isDragging = true;

    startX = e.clientX;
    startY = e.clientY;

    // Get the current translation values
    const transformValues = getTransformValues(mapContent);
    startTranslateX = transformValues.translateX;
    startTranslateY = transformValues.translateY;

    e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;

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

document.addEventListener('mouseup', function() {
    isDragging = false;
});

mapContainer.addEventListener('wheel', function(e) {
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

function generateMap(seed) {
    const random = new MersenneTwister(seed);

    for (rowIndex = 0; rowIndex < 30; rowIndex++) {
        const row = createTileRow();

        for (columnIndex = 0; columnIndex < 50; columnIndex++) {
            const tileType = random.generate() % 100; // Use a percentage scale (0-99)

            if (tileType < 30) {
                // 30% chance for grass
                row.appendChild(createTile('grass'));
            } else if (tileType < 60) {
                // 30% chance for tree
                row.appendChild(createTile('tree'));
            } else if (tileType < 80) {
                // 20% chance for stone
                row.appendChild(createTile('stone'));
            } else if (tileType < 95) {
                // 15% chance for bush
                row.appendChild(createTile('bush'));
            } else {
                // 5% chance for iron
                row.appendChild(createTile('iron'));
            }
        }

        mapContent.appendChild(row);
    }
}

class MersenneTwister {
    constructor(seed) {
        this.mt = new Array(624);
        this.mt[0] = seed;
        
        for (let i = 1; i < 624; i++) {
            let x = (this.mt[i - 1] & 0x80000000) | (this.mt[i - 397] & 0x7fffffff);
            this.mt[i] = x >> 1;
             if (x % 2 != 0) this.mt[i] ^= 0x9908b0df;
        }
        this.index = 624;
    }
       
    generate() {
        if (this.index >= 624) {
            this.twist();
            this.index = 0;
        }
            
        let y = this.mt[this.index];
        y = y ^ (y >> 11);
        y = y ^ ((y << 7) & 0x9d2c5680);
        y = y ^ ((y << 15) & 0xefc60000);
        y = y ^ (y >> 18);
        this.index++;
        return y >>> 0;
    }
       
    twist() {
        for (let i = 0; i < 624; i++) {
            let x = (this.mt[i] & 0x80000000) | (this.mt[i + 1] & 0x7fffffff);
            this.mt[i] = this.mt[(i + 397) % 624] ^ (x >>> 1);
            if (x % 2 != 0) this.mt[i] ^= 0x9908b0df;
        }
    }
}

function createTileRow() {
    const row = document.createElement('div')

    row.classList.add('tile-row')

    return row
}

function createTile(type) {
    const tile = document.createElement('div')

    tile.classList.add('tile')
    tile.classList.add(`${type}-tile`)

    return tile
}