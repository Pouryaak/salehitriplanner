
export interface Place {
  id: string;
  name: string;
  notes?: string;
  order: number;
  lat?: number;
  lng?: number;
  fullAddress?: string; // Added to store the full address
}

export interface City {
  id: string;
  name: string;
  places: Place[];
  fullAddress?: string; // Added to store the full address
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
