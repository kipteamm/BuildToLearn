let citizenHappinessLevels = []

function calculateCitizenHappiness(citizen) {
    let happiness = 100;

    if (citizen.house === null) {
        const emptyHouse = userBuildings.find(building => building.id.startswith('house_') && building.citizens.length < building.max_citizens)

        if (emptyHouse === undefined) {
            happiness -= 5

            if (!citizenComplaints.includes('No housing.')) citizenComplaints.push('No housing.');
        } else {
            emptyHouse.citizens.push(citizen.id)

            citizen.house = emptyHouse.id
        }
    }
    
    citizen.happiness = happiness

    citizenHappinessLevels.push(happiness)
}

function calculateHappiness() {
    updateResource('happiness', Math.round(citizenHappinessLevels.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / citizenHappinessLevels.length), true)

    citizenHappinessLevels = []
}