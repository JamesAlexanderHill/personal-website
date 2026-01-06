// Position period cards based on DOM year markers
export function positionPeriodCards() {
  const container = document.getElementById("timeline-container");
  if (!container) return;

  const containerTop = container.offsetTop;
  const containerBottom = container.clientHeight;
  const yearMarkers = container.querySelectorAll(".year-marker");
  const yearToYPx = {
    present: 0,
    ...Array.from(yearMarkers).reduce(
      (acc, element) =>
        element instanceof HTMLElement
          ? {
              ...acc,
              [element.innerText]: element.offsetTop + element.clientHeight,
            }
          : acc,
      {}
    ),
  };
  const yearPxRanges = {};
  for (let i = 0; i < yearMarkers.length; i++) {
    const currentMarker = yearMarkers[i] as HTMLElement;
    const nextMarker = yearMarkers[i + 1] as HTMLElement;

    const startPx = currentMarker
      ? currentMarker.offsetTop + currentMarker.clientHeight
      : 0;
    const endPx = nextMarker
      ? nextMarker.offsetTop + nextMarker.clientHeight
      : containerBottom;
    Object.assign(yearPxRanges, {
      [currentMarker.innerText]: [startPx, endPx],
    });
  }

  console.log("=== ranges", yearPxRanges);

  Array.from(document.getElementsByClassName("period-card")).forEach((card) => {
    const element = card as HTMLElement;
    const startDate = element.dataset.start
      ? new Date(Number(element.dataset.start))
      : new Date();
    const endDate = element.dataset.end
      ? new Date(Number(element.dataset.end))
      : new Date();

    const startYear = startDate.getFullYear();
    const startRatio = (startDate.getMonth() + 1) / 12;
    const [startAPx, startBPx] = yearPxRanges[startYear];
    const startPx = startAPx - (startBPx - startAPx) * startRatio;

    const endYear = endDate.getFullYear();
    const endRatio = (endDate.getMonth() + 1) / 12;
    const [endAPx, endBPx] = yearPxRanges[endYear];
    const endPx = endAPx - (endBPx - endAPx) * endRatio;

    /**
     * TODO
     * - ratio seems to not match where it happens on the timeline.
     * - add gradient from timeline to period cards
     * - handle mobile view positioning
     * 
     * - z-index needs to be added based on height of period card?
     */

    console.log("===", {
      startYear,
      startRatio,
      startPx,
      endYear,
      endRatio,
      endPx,
      ztop: endPx,
      zheight: startPx - endPx,
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
