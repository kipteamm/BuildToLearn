document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.getElementById('map-container');
    const mapContent = document.getElementById('map-content');

    let isDragging = false;
    let startX, startY, startTranslateX, startTranslateY;
    let accumulatedTranslateX = 0;
    let accumulatedTranslateY = 0;
    let accumulatedScale = 1; // Initial scale

    mapContent.addEventListener('mousedown', function(e) {
        isDragging = true;

        startX = e.clientX;
        startY = e.clientY;

        // Get the current translation values
        const transformValues = getTransformValues(mapContent);
        startTranslateX = transformValues.translateX;
        startTranslateY = transformValues.translateY;

        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        // Calculate the new translation values
        const newTranslateX = startTranslateX + deltaX;
        const newTranslateY = startTranslateY + deltaY;

        if (Math.abs(newTranslateX) > mapContent.offsetWidth / 2) {
            accumulatedTranslateX = startTranslateX;
        } else if (Math.abs(newTranslateY) > mapContent.offsetHeight / 2) {
            accumulatedTranslateY = startTranslateY;
        } else {
            // Update the accumulated translation values
            accumulatedTranslateX = newTranslateX;
            accumulatedTranslateY = newTranslateY;
        }

        // Apply the updated translation
        mapContent.style.transform = `translate(${accumulatedTranslateX}px, ${accumulatedTranslateY}px) scale(${accumulatedScale})`;
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
    });

    mapContainer.addEventListener('wheel', function(e) {
        e.preventDefault();

        const zoomFactor = 0.1;
        const delta = e.deltaY > 0 ? 1 - zoomFactor : 1 + zoomFactor;

        // Update the accumulated scale
        accumulatedScale *= delta;

        if (accumulatedScale > 2) {
            accumulatedScale = 2
        } else if (accumulatedScale < 0.5) {
            accumulatedScale = 0.5
        }

        // Apply the updated translation and zoom
        mapContent.style.transform = `translate(${accumulatedTranslateX}px, ${accumulatedTranslateY}px) scale(${accumulatedScale})`;
    });

    function getTransformValues(element) {
        // Get the current transform value
        const transformValue = window.getComputedStyle(element).getPropertyValue('transform');

        // Check if the transform value is not present or not a matrix
        if (!transformValue || transformValue === 'none') {
            return { translateX: 0, translateY: 0 };
        }

        // Parse the current transform values
        const matrixValues = transformValue.match(/matrix\(([^\)]+)\)/);

        // Check if the matrixValues array is not present or doesn't have enough elements
        if (!matrixValues || matrixValues.length < 2) {
            return { translateX: 0, translateY: 0 };
        }

        // Extract translation values
        const values = matrixValues[1].split(', ');
        const translateX = parseFloat(values[4]) || 0;
        const translateY = parseFloat(values[5]) || 0;

        return { translateX, translateY };
    }
});
