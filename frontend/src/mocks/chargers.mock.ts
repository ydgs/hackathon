// MOCK: replace with GET /api/v1/chargers when backend is ready

import type { Charger } from '../types';

export const MOCK_CHARGERS: Charger[] = [
  {
    id: 'chr-nex-001',
    externalStationId: 'CP-NEX-001',
    displayName: 'NEX Tower Charger 1',
    connectorId: 1,
    status: 'Available',
    location: { id: 'loc-nex', name: 'NEX Tower', code: 'NEX-TOWER' },
    lastCsmsSyncAt: '2026-05-23T08:14:55Z',
    activeSession: null,
  },
  {
    id: 'chr-nex-002',
    externalStationId: 'CP-NEX-002',
    displayName: 'NEX Tower Charger 2',
    connectorId: 1,
    status: 'Charging',
    location: { id: 'loc-nex', name: 'NEX Tower', code: 'NEX-TOWER' },
    lastCsmsSyncAt: '2026-05-23T08:14:55Z',
    activeSession: {
      id: 'sess-active-001',
      userDisplayName: '***',
      vehicleMake: '***',
      vehicleModel: '***',
      startTime: '2026-05-23T08:00:00Z',
      energyKwh: 4.21,
      elapsedMinutes: 14,
    },
  },
  {
    id: 'chr-nxt-001',
    externalStationId: 'CP-NXT-001',
    displayName: 'NEXTERACOM Charger 1',
    connectorId: 1,
    status: 'Reserved',
    location: { id: 'loc-nxt', name: 'NEXTERACOM', code: 'NEXTERACOM' },
    lastCsmsSyncAt: '2026-05-23T08:14:55Z',
    activeSession: null,
  },
  {
    id: 'chr-nxt-002',
    externalStationId: 'CP-NXT-002',
    displayName: 'NEXTERACOM Charger 2',
    connectorId: 1,
    status: 'Faulted',
    location: { id: 'loc-nxt', name: 'NEXTERACOM', code: 'NEXTERACOM' },
    lastCsmsSyncAt: '2026-05-23T08:14:55Z',
    activeSession: null,
  },
];
