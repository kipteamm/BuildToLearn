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

let userCitizens = {
    'citizen-1' : {name: "George", surname: "Dorchester", gender: "male", employment: null, status: "idle"}, 
    'citizen-2' : {name: "Patricia", surname: "Hamilton", gender: "female", employment: null, status: "idle"}
}

let userUnemployedCitizens = ['citizen-1', 'citizen-2']

let userBuildings = [];

const buildingDescriptions = {
    lumberCamp: "Assure the best possible wood gathering.",
    house: "A place where your citizens can live."
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}