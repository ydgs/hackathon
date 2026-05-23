export type OcppConnectorStatus =
  | 'Available'
  | 'Preparing'
  | 'Charging'
  | 'Finishing'
  | 'Unavailable'
  | 'Faulted'
  | 'Unknown';

export interface OcppConnector {
  connector_id: number;
  status: OcppConnectorStatus;
  error_code: string;
  blocked_reason: string | null;
}

export interface OcppStation {
  id: number;
  identity: string;
  vendor: string;
  model: string;
  location: string;
  connected: boolean;
  last_seen: string | null;
  connectors: OcppConnector[];
}

export type OcppSessionStatus = 'Active' | 'Completed';

export interface OcppMeterValue {
  timestamp: string;
  value: number;
  unit: string;
}

export interface OcppSession {
  id: number;
  transaction_id: number;
  station_identity: string;
  connector_id: number;
  id_tag: string;
  start_time: string;
  stop_time: string | null;
  meter_start: number;
  meter_stop: number | null;
  /** Energy in Wh — divide by 1000 to display as kWh */
  energy_wh: number | null;
  stop_reason: string | null;
  status: OcppSessionStatus;
  meterValues?: OcppMeterValue[];
}

export interface OcppAuthorizedTag {
  id: number;
  id_tag: string;
  station_identity: string | null;
  valid_from: string;
  valid_to: string;
  created_at: string;
}

export interface OcppAuthorizeTagBody {
  idTag: string;
  validFrom: string;
  validTo: string;
  stationIdentity?: string;
}
