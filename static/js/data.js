// functions 
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function hasResources(resources) {
    for (const [resource, amount] of Object.entries(resources)) {
        if (userResources[resource] < amount) {
            sendAlert('error', `You don't have enough ${resource}.`)

            return false
        }
    }

    return true
}

function useResources(resources) {
    for (const [resource, amount] of Object.entries(resources)) {
        if (userResources[resource] < amount) continue

        updateResource(resource, -amount)
    }
}

function logData() {
    console.log('citizens', userCitizens)
    console.log('buildings', userBuildings)
    console.log('complains', citizenComplaints)
}

function newDay() {
    lastDay = dayDuration
}

// BUILDINGS
function getBuildingData(type, id, x, y) {
    switch(type) {
        case "buildersHut":
            return {
                id: id,
                x: x,
                y: y,
                citizens: [],
                max_citizens: 3,
                add_citizen: true,
                function: {
                    status: "unstaffed",
                    available_citizens: [],
                    onDayStart: (building) => {},
                }
            }

        case "lumberCamp":
            return {
                id: id,
                x: x,
                y: y,
                citizens: [],
                max_citizens: 3,
                add_citizen: true,
                function: {
                    radius: 1,
                    status: "unstaffed",
                    onDayStart: (building) => {
                        startLumberCamp(building)
                    },
                }
            }

        case "house":
            return {
                id: id,
                x: x,
                y: y,
                citizens: [],
                max_citizens: 8,
                add_citizen: false,
                function: {
                    onDayStart: (building) => {},
                }
            }
    }
}

let userBuildings = [];

const buildingDescriptions = {
    buildersHut : "Employ citizens to build complex buildings for you.",
    lumberCamp: "Employ citizens to harvest trees for you.",
    house: "A place where your citizens can live."
}

// let userForaging = []; // default
let userForaging = ['collect', 'lumberCamp']
let userFarming = [];
let userMining = [];

let userResources = {
    clock: 8,
    skillPoints: 99,
    gold: 0,
    citizens: 4,
    unemployed: 4,
    happiness: 100,
    wood: 100,
    planks: 0,
    berry: 0,
    parchment: 0,
    stone: 0,
    iron: 0,
    house: 0,
    lumberCamp: 0,
};

// CITIZENS
let userCitizens = [
    {id: 'citizen_1', name: "George", surname: "Dorchester", gender: "male", employment: null, house: null, partner: null, parent: null, happiness: 100, status: "idle", onDayStart: (citizen) => {calculateCitizenHappiness(citizen)}}, 
    {id: 'citizen_2', name: "Patricia", surname: "Hamilton", gender: "female", employment: null, house: null, partner: null, parent: null, happiness: 100, status: "idle", onDayStart: (citizen) => {calculateCitizenHappiness(citizen)}},
    {id: 'citizen_3', name: "Tobias", surname: "Cantor", gender: "male", employment: null, house: null, partner: null, parent: null, happiness: 100, status: "idle", onDayStart: (citizen) => {calculateCitizenHappiness(citizen)}}, 
    {id: 'citizen_4', name: "Eliza", surname: "Goldstein", gender: "female", employment: null, house: null, partner: null, parent: null, happiness: 100, status: "idle", onDayStart: (citizen) => {calculateCitizenHappiness(citizen)}},
]

let citizenComplaints = []