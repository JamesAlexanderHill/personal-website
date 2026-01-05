// Position period cards based on DOM year markers
export function positionPeriodCards() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  const containerTop = container.offsetTop;

  document.querySelectorAll('.period-card').forEach(card => {
    const element = card as HTMLElement;
    const startYear = element.dataset.startYear;
    const endYear = element.dataset.endYear;

    if (!startYear || !endYear) return;

    // Find year markers for start and end years
    const startMarker = document.querySelector(`.year-marker[data-year="${startYear}"]`) as HTMLElement;
    const endMarker = document.querySelector(`.year-marker[data-year="${endYear}"]`) as HTMLElement;

    if (startMarker && endMarker) {
      // Calculate positions relative to container
      const startY = startMarker.offsetTop - containerTop;
      const endY = endMarker.offsetTop - containerTop + endMarker.offsetHeight;

      // Set position and height
      element.style.top = `${startY}px`;
      element.style.height = `${endY - startY}px`;

      // Fade in the card
      element.style.opacity = '1';
    }
  });
}

// Run positioning on load and resize
if (typeof window !== 'undefined') {
  window.addEventListener('load', positionPeriodCards);
  window.addEventListener('resize', positionPeriodCards);

  // Also run after a short delay to ensure DOM is fully rendered
  setTimeout(positionPeriodCards, 100);
}
