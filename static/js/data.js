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
                private: false,
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
    house: "A place where your citizens can live.",
    lumberCamp: "Employ citizens to harvest trees for you.",
}

// let userForaging = []; // default
let userForaging = ['collect', 'lumberCamp']
let userFarming = ['collect', 'GatherersHut'];
let userMining = [];
let userTrading = ['foodMarket']

let userResources = {
    clock: 8,
    skillPoints: 99,
    gold: 0,
    citizens: 0,
    unemployed: 0,
    happiness: 100,
    wood: 100,
    planks: 0,
    berry: 0,
    parchment: 0,
    stone: 0,
    iron: 0,
};

// CITIZENS
let userCitizens = []

let citizenComplaints = []