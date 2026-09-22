export const STATES = ["DESARMADA","ARMANDO","ARMADA","DISPARADA"] as const;
export type AlarmState = typeof STATES[number];
