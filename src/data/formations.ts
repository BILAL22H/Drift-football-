import { FormationSlot } from '../types';

export const FORMATIONS: Record<'4-3-3' | '4-2-3-1' | '3-5-2', FormationSlot[]> = {
  '4-3-3': [
    // Goalkeeper
    { id: 'gk', label: 'GK', allowedPosition: 'GK', detailedPosition: 'GK', x: 50, y: 88 },
    // Defenders
    { id: 'lb', label: 'LB', allowedPosition: 'DEF', detailedPosition: 'LB', x: 16, y: 72 },
    { id: 'cb1', label: 'CB', allowedPosition: 'DEF', detailedPosition: 'CB', x: 38, y: 74 },
    { id: 'cb2', label: 'CB', allowedPosition: 'DEF', detailedPosition: 'CB', x: 62, y: 74 },
    { id: 'rb', label: 'RB', allowedPosition: 'DEF', detailedPosition: 'RB', x: 84, y: 72 },
    // Midfielders
    { id: 'cm1', label: 'CM', allowedPosition: 'MID', detailedPosition: 'CM', x: 26, y: 48 },
    { id: 'cdm', label: 'CDM', allowedPosition: 'MID', detailedPosition: 'CDM', x: 50, y: 55 },
    { id: 'cm2', label: 'CM', allowedPosition: 'MID', detailedPosition: 'CM', x: 74, y: 48 },
    // Forwards
    { id: 'lw', label: 'LW', allowedPosition: 'FWD', detailedPosition: 'LW', x: 20, y: 22 },
    { id: 'st', label: 'ST', allowedPosition: 'FWD', detailedPosition: 'ST', x: 50, y: 16 },
    { id: 'rw', label: 'RW', allowedPosition: 'FWD', detailedPosition: 'RW', x: 80, y: 22 },
  ],
  '4-2-3-1': [
    { id: 'gk', label: 'GK', allowedPosition: 'GK', detailedPosition: 'GK', x: 50, y: 88 },
    { id: 'lb', label: 'LB', allowedPosition: 'DEF', detailedPosition: 'LB', x: 16, y: 72 },
    { id: 'cb1', label: 'CB', allowedPosition: 'DEF', detailedPosition: 'CB', x: 38, y: 74 },
    { id: 'cb2', label: 'CB', allowedPosition: 'DEF', detailedPosition: 'CB', x: 62, y: 74 },
    { id: 'rb', label: 'RB', allowedPosition: 'DEF', detailedPosition: 'RB', x: 84, y: 72 },
    // Two CDMs
    { id: 'cdm1', label: 'CDM', allowedPosition: 'MID', detailedPosition: 'CDM', x: 35, y: 56 },
    { id: 'cdm2', label: 'CDM', allowedPosition: 'MID', detailedPosition: 'CDM', x: 65, y: 56 },
    // Attacking Midfield 3
    { id: 'lam', label: 'LAM', allowedPosition: 'MID', detailedPosition: 'CAM', x: 22, y: 36 },
    { id: 'cam', label: 'CAM', allowedPosition: 'MID', detailedPosition: 'CAM', x: 50, y: 34 },
    { id: 'ram', label: 'RAM', allowedPosition: 'MID', detailedPosition: 'CAM', x: 78, y: 36 },
    // Lone Striker
    { id: 'st', label: 'ST', allowedPosition: 'FWD', detailedPosition: 'ST', x: 50, y: 16 },
  ],
  '3-5-2': [
    { id: 'gk', label: 'GK', allowedPosition: 'GK', detailedPosition: 'GK', x: 50, y: 88 },
    // 3 CBs
    { id: 'cb1', label: 'CB', allowedPosition: 'DEF', detailedPosition: 'CB', x: 26, y: 74 },
    { id: 'cb2', label: 'CB', allowedPosition: 'DEF', detailedPosition: 'CB', x: 50, y: 76 },
    { id: 'cb3', label: 'CB', allowedPosition: 'DEF', detailedPosition: 'CB', x: 74, y: 74 },
    // 5 Midfielders
    { id: 'lm', label: 'LM', allowedPosition: 'MID', detailedPosition: 'CM', x: 14, y: 46 },
    { id: 'cdm1', label: 'CDM', allowedPosition: 'MID', detailedPosition: 'CDM', x: 36, y: 54 },
    { id: 'cam', label: 'CAM', allowedPosition: 'MID', detailedPosition: 'CAM', x: 50, y: 38 },
    { id: 'cdm2', label: 'CDM', allowedPosition: 'MID', detailedPosition: 'CDM', x: 64, y: 54 },
    { id: 'rm', label: 'RM', allowedPosition: 'MID', detailedPosition: 'CM', x: 86, y: 46 },
    // 2 Strikers
    { id: 'st1', label: 'ST', allowedPosition: 'FWD', detailedPosition: 'ST', x: 36, y: 18 },
    { id: 'st2', label: 'ST', allowedPosition: 'FWD', detailedPosition: 'ST', x: 64, y: 18 },
  ]
};
