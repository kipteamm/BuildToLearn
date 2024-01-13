const nightOverlay = document.getElementById('night-overlay');
const dayDuration = 3 * 60; // minutes
const hourDuration = (dayDuration / 24) * 1000;

let nightTime = 19;
let dayTime = 8

let currentHour = dayTime;
let currentDay = 0;

setInterval(() => {
    currentHour += 1;

    if (currentHour === 24) {
        currentHour = 0;
        currentDay += 1;

        updateIndicator('day', currentDay);
    }

    if (currentHour >= nightTime) {
        nightOverlay.classList.add('active');
    } else if (currentHour >= dayTime) {
        nightOverlay.classList.remove('active');
    }

    if (currentHour === dayTime) {
        console.log(`New work day`);

        newWorkDay();
    }
    
    updateIndicator('clock', currentHour);
}, hourDuration);

function newWorkDay() {
    updateResource('unemployed', 0, true)

    userBuildings.forEach(building => {
        building.function.onDayStart(building);
    });

    userCitizens.forEach(citizen => {
        citizen.age += 1
        citizen.onDayStart(citizen);
    });

    calculateHappiness();

    growSeeds()
}

function forceNewDay() {
    currentHour = 7
    currentDay += 1
}