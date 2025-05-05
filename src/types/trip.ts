
export interface Place {
  id: string;
  name: string;
  notes?: string;
  order: number;
  lat?: number;
  lng?: number;
}

export interface City {
  id: string;
  name: string;
  places: Place[];
}

export interface Day {
  id: string;
  date: Date;
  cities: City[];
}

export interface Trip {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  days: Day[];
}
