import type { Event, Period, TimelineOrdering } from './types';

export function getYearList(events: Event[], periods: Period[], ordering: TimelineOrdering): number[] {
  const eventYears = events.map(event => new Date(event.date).getFullYear());
  const periodYears = periods.flatMap(period => [
    new Date(period.startDate).getFullYear(),
    new Date(period.endDate ?? new Date()).getFullYear()
  ]);

  const yearSet = new Set([...eventYears, ...periodYears]);
  const yearList = Array.from(yearSet).sort((a, b) => a - b);

  const minYear = yearList[0] ?? new Date().getFullYear();
  const maxYear = yearList[yearList.length - 1] ?? new Date().getFullYear();
  const range = maxYear - minYear;

  // Create continuous range of years
  const allYears = Array.from({ length: range + 1 }, (_, i) => minYear + i);

  return ordering === 'chronological' ? allYears : allYears.reverse();
}

export function filterEventsByYear(events: Event[], year: number): Event[] {
  return events.filter(event => new Date(event.date).getFullYear() === year);
}
