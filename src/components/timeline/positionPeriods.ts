// Position period cards based on DOM year markers
const calculateYearMarkerStart = (marker: HTMLElement) =>
  marker.offsetTop + marker.clientHeight;
const calculateEventMarkerStart = (marker: HTMLElement) => {
  return marker.offsetTop + 14; // half w-8 = 2rem
};

const convertDateToRangeKey = (range: number[], date: Date) => {
  const dateMs = date.getTime() + 1;
  const sortedRange = [...range, dateMs].sort((a: number, b: number) => a - b);
  const index = sortedRange.findIndex((num) => num === dateMs);

  // insert ms, sort, find index, -1
  return String(sortedRange[Math.max(index - 1, 0)]);
};

export function positionPeriodCards() {
  const container = document.getElementById("timeline-container");
  if (!container) return;

  const containerBottom = container.clientHeight;
  const yearMarkers = container.querySelectorAll(".timeline-marker");
  const markerPxRanges = {};
  for (let i = 0; i < yearMarkers.length; i++) {
    const currentMarker = yearMarkers[i] as HTMLElement;
    const prevMarker = yearMarkers[i - 1] as HTMLElement | undefined;

    const isCurrentYearMarker = currentMarker.classList.contains("year-marker");

    if (i === 0) {
      const start = isCurrentYearMarker
        ? calculateYearMarkerStart(currentMarker)
        : calculateEventMarkerStart(currentMarker);

      Object.assign(markerPxRanges, {
        [currentMarker.dataset.dateMs]: [0, start],
      });
    } else {
      const isPrevYearMarker = prevMarker.classList.contains("year-marker");
      const start = isCurrentYearMarker
        ? calculateYearMarkerStart(currentMarker)
        : calculateEventMarkerStart(currentMarker);
      const end = isPrevYearMarker
        ? calculateYearMarkerStart(prevMarker)
        : calculateEventMarkerStart(prevMarker);
      Object.assign(markerPxRanges, {
        [currentMarker.dataset.dateMs]: [end, start],
      });
    }
  }

  if (window.added !== true && window.debugRanges === true) {
    window.added = true;
    Object.values(markerPxRanges).forEach((range, index) => {
      const debugLine = document.createElement("div");
      debugLine.classList.add(
        "absolute",
        "-z-10",
        "border-l-2",
        "border-blue-500",
        "translate-x-[-5px]"
      );

      if (index % 2 === 0) {
        debugLine.classList.replace("border-blue-500", "border-red-500");
      }

      debugLine.style.top = `${range[0]}px`;
      debugLine.style.height = `${range[1] - range[0]}px`;

      container.appendChild(debugLine);
    });
  }

  Array.from(document.getElementsByClassName("period-card")).forEach((card) => {
    const element = card as HTMLElement;
    const startDate = element.dataset.start
      ? new Date(Number(element.dataset.start))
      : new Date();
    const endDate = element.dataset.end
      ? new Date(Number(element.dataset.end))
      : new Date();

    const markerKeys = Object.keys(markerPxRanges).map((x) => Number(x));

    const startYear = startDate.getFullYear();
    const startRatio = (startDate.getMonth() + 1) / 12;
    const startRangeKey = convertDateToRangeKey(markerKeys, startDate);
    const startRange = markerPxRanges[startRangeKey];
    const startPx =
      startRange[0] + (startRange[1] - startRange[0]) * startRatio;

    const endYear = endDate.getFullYear();
    const endRatio = (endDate.getMonth() + 1) / 12;
    const endRangeKey = convertDateToRangeKey(markerKeys, endDate);
    const endRange = markerPxRanges[endRangeKey];
    const endPx = endRange[0] + (endRange[1] - endRange[0]) * endRatio;

    /**
     * TODO
     * - ratio seems to not match where it happens on the timeline.
     * - add gradient from timeline to period cards
     * - handle mobile view positioning
     *
     * - z-index needs to be added based on height of period card?
     */

    console.log("===", {
      start: startDate.toDateString(),
      end: endDate.toDateString(),
      startRangeKey: new Date(Number(startRangeKey)).toDateString(),
      endRangeKey: new Date(Number(endRangeKey)).toDateString(),
      startRange,
      endRange,
      startPx,
      endPx,
    });

    element.style.top = `${endPx}px`;
    element.style.height = `${startPx - endPx}px`;
    element.style.opacity = "1";
  });
}

// Run positioning on load and resize
if (typeof window !== "undefined") {
  window.addEventListener("load", positionPeriodCards);
  window.addEventListener("resize", positionPeriodCards);

  // Also run after a short delay to ensure DOM is fully rendered
  setTimeout(positionPeriodCards, 100);
}
