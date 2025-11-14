export const sampleFloorplans = [
  {
    id: 'fp-main-hall',
    name: 'Main Hall',
    sections: [
      { id: 'sec-1', name: 'Garden View' },
      { id: 'sec-2', name: 'Chef Table' },
    ],
    tables: [
      { id: 'T1', label: 'Table 1', x: 20, y: 30, capacity: 2, status: 'free' },
      { id: 'T2', label: 'Table 2', x: 40, y: 35, capacity: 4, status: 'reserved' },
      { id: 'T3', label: 'Table 3', x: 60, y: 50, capacity: 6, status: 'free' },
      { id: 'T4', label: 'Table 4', x: 80, y: 45, capacity: 4, status: 'free' },
    ],
  },
  {
    id: 'fp-rooftop',
    name: 'Rooftop Lounge',
    sections: [
      { id: 'sec-3', name: 'North Deck' },
      { id: 'sec-4', name: 'Sunset Corner' },
    ],
    tables: [
      { id: 'R1', label: 'Pod 1', x: 15, y: 20, capacity: 4, status: 'free' },
      { id: 'R2', label: 'Pod 2', x: 35, y: 60, capacity: 2, status: 'free' },
      { id: 'R3', label: 'Pod 3', x: 55, y: 40, capacity: 6, status: 'reserved' },
      { id: 'R4', label: 'Pod 4', x: 75, y: 30, capacity: 2, status: 'free' },
    ],
  },
];

