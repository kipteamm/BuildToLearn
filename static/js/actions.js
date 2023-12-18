const itemMenu = document.getElementById('item-menu')

function performAction(tile) {
    const sourceRect = tile.getBoundingClientRect();

    itemMenu.style.left = `${sourceRect.left}px`
    itemMenu.style.top = `${sourceRect.top}px`
}