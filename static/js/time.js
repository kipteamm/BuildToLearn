const nightOverlay = document.getElementById('night-overlay')

const dayDuration = 5 * 60; // minutes

let currentTime = 0;
let lastDay = dayDuration;
let isNight = false;

setInterval(() => {
    currentTime += 1;
    lastDay += 1;
    
    updateGame()
}, 1000);

function updateGame() {
    if (lastDay >= dayDuration) {
        console.log('new day')

        lastDay = 0
        
        Object.keys(userBuildings).forEach(buildingId => {
            const building = userBuildings[buildingId]

            building.function.onDayStart(building);
        });

        isNight = false

        nightOverlay.classList.remove('active')
    } else if (lastDay >= dayDuration / 2 && !isNight) {
        isNight = true

        nightOverlay.classList.add('active')
    }
}

updateGame()