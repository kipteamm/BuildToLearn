const itemMenu = document.getElementById('item-menu')

let activeTile = null

function performAction(tile) {
    if (activeTile === tile) {
        itemMenu.style.display = 'none';

        activeTile = null

        return
    }

    activeTile = tile

    itemMenu.querySelector('span.title').innerText = tile.getAttribute("type")

    itemMenu.style.display = 'block'
}

function closeAction() {
    itemMenu.style.display = 'none'
}