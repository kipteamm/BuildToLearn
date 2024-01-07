let citizenHappinessLevels = []

function calculateCitizenHappiness(citizen) {
    let happiness = citizen.happiness;

    if (citizen.house === null) {
        findHouse(citizen)
    }

    if (citizen.house === null) {
        if (citizen.partner === null) {
            if (!citizenComplaints.includes('No housing.')) citizenComplaints.push('No housing.');
        } else {
            if (!citizenComplaints.includes('No housing for a fresh couple.') && !citizenComplaints.includes('No housing.')) citizenComplaints.push('No housing for a fresh couple.');
        }

        happiness -= 5
    } else {
        happiness += 5
    }

    if (citizen.employment === null) {
        happiness -= 5

        if (!citizenComplaints.includes('No employment.')) citizenComplaints.push('No employment.');
    } else {
        happiness += 5
    }

    if (citizen.partner === null && currentDay > 1) {
        happiness -= 5

        if (!citizenComplaints.includes('Lonely citizens.')) citizenComplaints.push('Lonely citizens.');
    } else {
        happiness += 5
    }

    if (happiness > 75 && citizen.partner === null) {
        findPartner(citizen)
    }
    
    citizen.happiness = happiness

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
    const partner = userCitizens.find(potentialPartner => potentialPartner.id !== citizen.id && potentialPartner.partner === null)
    
    if (partner === undefined) return

    citizen.partner = partner.id

    partner.partner = citizen.id

    const house = userBuildings.find(building => building.id === citizen.house)
    const partnerHouse = userBuildings.find(building => building.id === partner.house)

    sendAlert('success', "Some of your citizens fell in love!")

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
    } 

    const emptyHouse = userBuildings.find(building => building.id.includes('house_') && building.citizens.length < building.max_citizens && !building.private)

    if (emptyHouse === undefined) return
    
    emptyHouse.citizens.push(citizen.id)

    citizen.house = emptyHouse.id
}