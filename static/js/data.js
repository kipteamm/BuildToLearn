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
const baseBuildingTemplate = {
    init(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.citizens = [];
    }
};

const buildingTypes = {
    buildersHut: {
        ...baseBuildingTemplate,
        max_citizens: 3,
        add_citizen: true,
        function: {
            status: "unstaffed",
            available_citizens: [],
            onDayStart: (building) => {}
        }
    },
    lumberCamp: {
        ...baseBuildingTemplate,
        max_citizens: 3,
        add_citizen: true,
        function: {
            radius: 1,
            status: "unstaffed",
            onDayStart: (building) => startLumberCamp(building)
        }
    },
    gatherersHut: {
        ...baseBuildingTemplate,
        max_citizens: 3,
        add_citizen: true,
        function: {
            radius: 1,
            status: "unstaffed",
            onDayStart: (building) => startGatherersHut(building)
        }
    },
    foodMarket: {
        ...baseBuildingTemplate,
        max_citizens: 1,
        add_citizen: true,
        function: {
            radius: 1,
            status: "unstaffed",
            onDayStart: (building) => {}
        }
    },
    house: {
        ...baseBuildingTemplate,
        max_citizens: 8,
        add_citizen: false,
        function: {
            onDayStart: (building) => {}
        }
    }
};

const buildingRequirements = {
    house: {
        skill: null,
        resources: { wood: 20 },
        time: 30,
    },
    lumberCamp: {
        skill: 'foraging',
        resources: { wood: 5 },
        time: 15,
    },
    gatherersHut: {
        skill: 'farming',
        resources: { wood: 5 },
        time: 15,
    },
    foodMarket: {
        skill: 'trading',
        resources: { wood: 5 },
        time: 15,
    },
};

let userBuildings = [];

const buildingDescriptions = {
    buildersHut : "Employ citizens to build complex buildings for you.",
    house: "A place where your citizens can live.",
    lumberCamp: "Employ citizens to harvest trees for you.",
    gatherersHut: "Employ citizens to gather berries for you.",
    foodMarket: "Provide your citizens with food."
}

// let userForaging = []; // default
let userForaging = ['collect', 'lumberCamp']
let userFarming = ['collect', 'gatherersHut'];
let userMining = [];
let userTrading = ['foodMarket']

let userResources = {
    skillPoints: 99,
    gold: 0,
    citizens: 0,
    unemployed: 0,
    happiness: 100,
    wood: 100,
    planks: 0,
    berry: 0,
    papyrus: 0,
    stone: 0,
    iron: 0,
};

// CITIZENS
let userCitizens = []

let citizenComplaints = []