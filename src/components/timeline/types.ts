export interface Period {
  id: string;
  type: string;
  title: string;
  organisation: string;
  location?: string;
  startDate: string;
  endDate: string | null;
  blurb: string;
  tags?: string[];
  links?: { label: string; url: string }[];
  logo?: string;
}

export interface Event {
  id: string;
  type: string;
  title: string;
  date: string;
  venue?: string;
  location?: string;
  blurb: string;
  tags?: string[];
  links?: { label: string; url: string }[];
  icon?: string;
}

export type TimelineOrdering = 'chronological' | 'reverse';
