// Position period cards based on DOM year markers
const calculateYearMarkerStart = (marker: HTMLElement) =>
  marker.offsetTop + marker.clientHeight;
const calculateEventMarkerStart = (marker: HTMLElement) => {
  return marker.offsetTop + 14; // half w-8 = 2rem
};

// Find which two markers a date falls between
const findMarkerRange = (
  markerData: Array<{ timestampMs: number; pixelPos: number }>,
  dateMs: number
): {
  prevMarker: (typeof markerData)[0];
  nextMarker: (typeof markerData)[0];
} | null => {
  // Markers are in reverse chronological order (newest first)
  for (let i = 0; i < markerData.length - 1; i++) {
    const current = markerData[i];
    const next = markerData[i + 1];

    // Check if date falls between current (newer) and next (older) marker
    if (dateMs <= current.timestampMs && dateMs >= next.timestampMs) {
      return { prevMarker: current, nextMarker: next };
    }
  }

  // If date is newer than newest marker, use first two markers
  if (dateMs > markerData[0].timestampMs) {
    return {
      prevMarker: { timestampMs: dateMs, pixelPos: 0 },
      nextMarker: markerData[0],
    };
  }

  // If date is older than oldest marker, use last two markers
  const len = markerData.length;
  return {
    prevMarker: markerData[len - 2] || markerData[len - 1],
    nextMarker: markerData[len - 1],
  };
};

export function positionPeriodCards() {
  const container = document.getElementById("timeline-container");
  if (!container) return;

  const yearMarkers = container.querySelectorAll(".timeline-marker");

  // Build array of marker data with timestamps and pixel positions
  const markerData: Array<{ timestampMs: number; pixelPos: number }> = [];

  for (let i = 0; i < yearMarkers.length; i++) {
    const marker = yearMarkers[i] as HTMLElement;
    const isYearMarker = marker.classList.contains("year-marker");
    const pixelPos = isYearMarker
      ? calculateYearMarkerStart(marker)
      : calculateEventMarkerStart(marker);

    markerData.push({
      timestampMs: Number(marker.dataset.dateMs),
      pixelPos: pixelPos,
    });
  }

  // Position each period card
  Array.from(document.getElementsByClassName("period-card")).forEach((card) => {
    const element = card as HTMLElement;
    const startDateMs = Number(element.dataset.start);
    const endDateMs = Number(element.dataset.end);

    if (!startDateMs || !endDateMs) return;

    // Find which markers the start and end dates fall between
    const startRange = findMarkerRange(markerData, startDateMs);
    const endRange = findMarkerRange(markerData, endDateMs);

    if (!startRange || !endRange) return;

    // Calculate ratio based on actual timestamps
    const startRatio =
      startRange.prevMarker.timestampMs === startRange.nextMarker.timestampMs
        ? 0
        : (startDateMs - startRange.nextMarker.timestampMs) /
          (startRange.prevMarker.timestampMs -
            startRange.nextMarker.timestampMs);

    const endRatio =
      endRange.prevMarker.timestampMs === endRange.nextMarker.timestampMs
        ? 0
        : (endDateMs - endRange.nextMarker.timestampMs) /
          (endRange.prevMarker.timestampMs - endRange.nextMarker.timestampMs);

    // Interpolate pixel positions
    const startPx =
      startRange.nextMarker.pixelPos +
      (startRange.prevMarker.pixelPos - startRange.nextMarker.pixelPos) *
        startRatio;

    const endPx =
      endRange.nextMarker.pixelPos +
      (endRange.prevMarker.pixelPos - endRange.nextMarker.pixelPos) * endRatio;

    element.style.top = `${endPx}px`;
    element.style.height = `${startPx - endPx}px`;
    element.style.opacity = "1";
  });
}

document.addEventListener("astro:page-load", () => {
  window.addEventListener("resize", positionPeriodCards);
  setTimeout(positionPeriodCards, 100);
});
