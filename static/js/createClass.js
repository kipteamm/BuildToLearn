function nextSection(section) {
    document.getElementById(`section-${section - 1}`).classList.add('move-next')
    document.getElementById(`section-${section}`).style.display = 'block';
}