// Charger types — field names match api-contract.md §9.4 exactly

export type ChargerStatus =
  | 'Available'
  | 'Reserved'
  | 'Charging'
  | 'BlockedForMaintenance'
  | 'Unavailable'
  | 'Faulted';

export interface ChargerLocation {
  id: string;
  name: string;
  code: 'NEX-TOWER' | 'NEXTERACOM';
}

export interface ActiveSession {
  id: string;
  userDisplayName: string;
  vehicleMake: string;
  vehicleModel: string;
  startTime: string;
  energyKwh: number;
  elapsedMinutes: number;
}

export interface Charger {
  id: string;
  externalStationId: string;
  displayName: string;
  connectorId: number;
  status: ChargerStatus;
  location: ChargerLocation;
  lastCsmsSyncAt: string;
  activeSession: ActiveSession | null;
}
