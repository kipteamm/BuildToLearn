const dayDuration = 1 * 30; // minutes
let currentTime = 0;
let lastDay = dayDuration;

setInterval(() => {
    currentTime += 1;
    lastDay += 1;
    
    updateGame()
}, 1000);

function updateGame() {
    if (lastDay > dayDuration) {
        console.log('new day')

        console.log(userBuildings)

        lastDay = 0

        userBuildings.forEach((building) => {
            building.functionality.onDayStart(building.id);
        });
    }
}

updateGame()