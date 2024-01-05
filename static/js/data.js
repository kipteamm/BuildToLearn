// functions 

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function hasResources(resources) {
    for (const [resource, amount] of Object.entries(resources)) {
        if (userResources[resource] < amount) {
            sendAlert('error', `You don't have enough ${resource}.`)

            return
        }

        updateResource(resource, -amount)
    }
}

// let userForaging = []; // default
let userForaging = ['collect', 'lumberCamp']
let userFarming = [];
let userMining = [];

let userResources = {
    skillPoints: 99,
    gold: 0,
    citizens: 2,
    idle: 2,
    wood: 100,
    planks: 0,
    berry: 0,
    parchment: 0,
    stone: 0,
    iron: 0,
    house: 0,
    lumberCamp: 0,
};

let userCitizens = [
    {id: 'citizen_1', name: "George", surname: "Dorchester", gender: "male", employment: null, status: "idle"}, 
    {id: 'citizen_2', name: "Patricia", surname: "Hamilton", gender: "female", employment: null, status: "idle"}
]

let userBuildings = [];

const buildingDescriptions = {
    buildersHut : "Employ citizens to build complex buildings for you.",
    lumberCamp: "Employ citizens to harvest trees for you.",
    house: "A place where your citizens can live."
}