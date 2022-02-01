export enum EntityState {
  Unloaded = 0,
  Loading = 1,
  Loaded = 2,
  Failed = 3,
}

export interface Entity<ValueType> {
  state: EntityState;
  value: ValueType;
}
