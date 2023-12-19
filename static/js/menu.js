const menu = document.getElementById('menu')

let activeMenu = "loading";

function toggleMenu(menuId) {
    if (menuId === activeMenu) {
        menu.classList.remove('active')

        activeMenu = "loading"

        return
    }

    menu.classList.add('active')

    document.getElementById(`${activeMenu}-menu`).classList.remove('active')

    document.getElementById(`${menuId}-menu`).classList.add('active')

    activeMenu = menuId
}

let activeSkill = "foraging";

function buySkill(skill, price) {
    if (price > userSkillPoints) {
        alert('error inc')
        
        return
    }

    getSkill(activeSkill).push(skill.id)
}