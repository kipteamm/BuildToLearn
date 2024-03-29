let citizenHappinessLevels = []

const employmentAge = 7;
const adultHood = 16;

let surnames;
let names;

async function fetchNames() {
    const surnamesResponse = await fetch('/static/data/surnames.json');

    surnames = await surnamesResponse.json()

    const namesResponse = await fetch('/static/data/names.json');

    names = await namesResponse.json()
}

function spawnCitizen(parent_1=null, parent_2=null) {
    const name = names[Math.floor(Math.random() * names.length)]

    if (parent_1 !== null && parent_2 !== null) {
        surname = parent_1.surname

        parent_1 = parent_1.id
        parent_2 = parent_2.id

        age = 0
    } else {
        surname = surnames[Math.floor(Math.random() * surnames.length)]

        age = adultHood
    }

    const citizen = {
        id: `citizen_${new Date().getTime().toString().replace('.', '')}${userResources.citizens}`,
        name: name,
        surname: surname,
        age: age,
        employment: null,
        house: null, 
        partner: null,
        parent_1: parent_1,
        parent_2: parent_2,
        children: [],
        lastComplaint: 0,
        status: "idle",
        pregnant: null,
        onDayStart: (citizen) => calculateCitizenHappiness(citizen)
    }

    userCitizens.push(citizen)

    updateResource('citizens', 1)

    if (citizen.age === adultHood) {
        updateResource('unemployed', 1)
    }
    
    return citizen
}

function removeCitizen(citizen) {
    if (citizen.house !== null) {
        const house = userBuildings.find(building => building.id === citizen.house)

        house.citizens.splice(house.citizens.indexOf(citizen), 1)
    }
    
    if (citizen.employment !== null) {
        const employment = userBuildings.find(building => building.id === citizen.employment)

        employment.citizens.splice(employment.citizens.indexOf(citizen), 1)
    }
    
    if (citizen.partner !== null) {
        const partner = userCitizens.find(_citizen => _citizen.id === citizen.partner)

        partner.partner = null
    }

    if (citizen.children.length > 0) {
        citizen.children.forEach(childId => {
            const child = userCitizens.find(_citizen => _citizen.id === childId)

            if (child.parent_1 === citizen.id) {
                child.parent_1 = null
            } else {
                child.parent_2 = null
            }
        })
    }

    userCitizens.splice(userCitizens.indexOf(citizen), 1)
}

function calculateCitizenHappiness(citizen) {
    let happiness = 100;

    if (citizen.house === null) {
        findHouse(citizen)
    }

    if (citizen.house === null) {
        if (citizen.partner === null) {
            if (!citizenComplaints.includes('No housing.')) citizenComplaints.push('No housing.');
        } else {
            if (!citizenComplaints.includes('No housing for a couple.') && !citizenComplaints.includes('No housing.')) citizenComplaints.push('No housing for a couple.');
        }

        happiness -= 10 + citizen.lastComplaint
    }

    if (citizen.employment === null && citizen.age >= employmentAge) {
        happiness -= 5 + citizen.lastComplaint

        if (!citizenComplaints.includes('No employment.')) citizenComplaints.push('No employment.');

        updateResource('unemployed', 1)
    }

    if (happiness > 75 && citizen.partner === null && citizen.age >= adultHood) {
        findPartner(citizen)
    }

    if (citizen.partner === null && currentDay > 1 && citizen.age >= adultHood) {
        happiness -= 5 + citizen.lastComplaint

        if (!citizenComplaints.includes('Lonely citizens.')) citizenComplaints.push('Lonely citizens.');
    }

    if (!hasEaten()) {
        happiness -= 15 + citizen.lastComplaint * 5

        if (!citizenComplaints.includes('Hungry citizens.')) citizenComplaints.push('Hungry citizens.');
    }
    
    citizen.happiness = happiness

    if (happiness < 100) {
        citizen.lastComplaint += 1
    } else {
        citizen.lastComplaint = 0
    }

    if (happiness > 50 && currentDay > 0 && citizen.children.length < 6 && citizen.pregnant === null && citizen.age >= adultHood) {
        getPregnant(citizen)
    } 

    if (citizen.pregnant && citizen.pregnant + 3 <= currentDay) {
        startLabour(citizen)
    }

    citizenHappinessLevels.push(happiness)
}

function calculateHappiness() {
    updateResource('happiness', Math.round(citizenHappinessLevels.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / citizenHappinessLevels.length), true)

    citizenHappinessLevels = []

    citizenComplaints.forEach(complaint => {
        sendAlert('error', complaint)
    })

    citizenComplaints = []
}

function findPartner(citizen) {
    const partner = userCitizens.find(potentialPartner => potentialPartner.id !== citizen.id && potentialPartner.partner === null && potentialPartner.surname !== citizen.surname)
    
    if (partner === undefined) return

    citizen.partner = partner.id

    partner.partner = citizen.id

    const house = userBuildings.find(building => building.id === citizen.house)
    const partnerHouse = userBuildings.find(building => building.id === partner.house)

    sendAlert('success', "Some of your citizens fell in love!")

    const surname = [citizen.surname, partner.surname][Math.floor(Math.random() * 2)]

    citizen.surname = surname
    partner.surname = surname

    if (house === undefined && partnerHouse === undefined) {
        const newHouse = userBuildings.find(building => building.id.includes('house_') && building.citizens.length === 0 && !building.private)

        if (newHouse === undefined) {
            citizen.house = null
            partner.house = null

            return
        }

        newHouse.private = true
        newHouse.citizens.push(citizen.id)
        newHouse.citizens.push(partner.id)
    } else if (house.id === partnerHouse.id && house.citizens.length === 2) {
        house.private = true
    } else if (house.citizens.length === 1) {
        house.private = true
        house.citizens.push(partner.id)
        
        partner.house = house.id

        partnerHouse.citizens.splice(partnerHouse.citizens.indexOf(partner.id), 1)
    } else if (partnerHouse.citizens.length === 1) {
        partnerHouse.private = true
        partnerHouse.citizens.push(citizen.id)

        citizen.house = partnerHouse.id

        house.citizens.splice(house.citizens.indexOf(citizen.id), 1)
    }

    return
}

function findHouse(citizen) {
    if (citizen.partner !== null) {
        const emptyHouse = userBuildings.find(building => building.id.includes('house_') && building.citizens.length === 0 && !building.private)

        if (emptyHouse === undefined) return 
        
        emptyHouse.private = true

        citizen.house = emptyHouse.id

        const citizenPartner = userCitizens.find(partner => partner.id === citizen.partner)

        citizenPartner.house = emptyHouse.id

        emptyHouse.citizens.push(citizen.id)
        emptyHouse.citizens.push(citizenPartner.id)

        return
    } else if (citizen.parent_1 !== null || citizen.parent_2 !== null) {
        const parent = userCitizens.find(_citizen => _citizen.id === citizen.parent_1)

        if (parent.house === null) return 

        const parentHouse = userBuildings.find(building => building.id === parent.house)

        parentHouse.citizens.push(citizen.id)
        
        citizen.house = parentHouse.id

        return
    }

    const emptyHouse = userBuildings.find(building => building.id.includes('house_') && building.citizens.length < building.max_citizens && !building.private)

    if (emptyHouse === undefined) return
    
    emptyHouse.citizens.push(citizen.id)

    citizen.house = emptyHouse.id
}

function getPregnant(citizen) {
    if (Math.floor(Math.random() * (2 + citizen.children.length)) !== 0) return

    const partner = userCitizens.find(_citizen => _citizen.id === citizen.partner)

    citizen.pregnant = currentDay
    partner.pregnant = currentDay

    sendAlert('success', "Someone got pregnant.")
}

function startLabour(citizen) {
    const partner = userCitizens.find(_citizen => _citizen.id === citizen.partner)

    if (Math.floor(Math.random() * 20) + 1 === 1) {
        sendAlert('error', "A citizen died while giving birth.")

        const deadCitizen = [citizen, partner][Math.floor(Math.random() * 2)];

        citizen.pregnant = null;
        partner.pregnant = null;

        removeCitizen(deadCitizen)
    }

    citizen.pregnant = null
    partner.pregnant = null

    const child = spawnCitizen(citizen, partner)

    citizen.children.push(child.id)
    partner.children.push(child.id)

    if (citizen.house || partner.house) {
        child.house = citizen.house

        const house = userBuildings.find(building => building.id === citizen.house)

        house.citizens.push(child.id)
    }

    sendAlert('success', "A new child was born!")
}