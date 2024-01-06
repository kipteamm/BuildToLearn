const nightOverlay = document.getElementById('night-overlay');
const dayDuration = 3 * 60; // minutes
const hourDuration = dayDuration / 24;

let lastHour = 8;
let lastDay = dayDuration;
let isNight = false;

setInterval(() => {
    lastDay += 1;

    if (lastDay >= hourDuration) {
        lastHour += 1;

        if (lastHour === 24) {
            lastHour = 0;
        }
     
        updateResource('clock', lastHour, true);
        
        lastDay = 0;
    }

    updateGame();
}, 1000);

function updateGame() {
    if (lastDay >= dayDuration) {
        console.log('New day');

        lastDay = 0;
        
        userBuildings.forEach(building => {
            building.function.onDayStart(building);
        });

        userCitizens.forEach(citizen => {
            citizen.onDayStart(citizen);
        });

        calculateHappiness();

        isNight = false;

        nightOverlay.classList.remove('active');
    } else if (lastDay >= dayDuration / 2 && !isNight) {
        isNight = true;

        nightOverlay.classList.add('active');
    }
}

updateGame();