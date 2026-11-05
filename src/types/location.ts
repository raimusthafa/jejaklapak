export type LngLat = [number, number];

export interface CulinaryZone {
  id: string;
  name: string;
  description: string;
  district: string;
  vendorCountEstimate: number;
  coordinates: LngLat[];
  color: string;
}

