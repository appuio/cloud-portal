import {createReducer, on} from '@ngrx/store';
import {Zone} from "../types/zone";
import {setZones} from "./app.actions";


export interface AppState {
  zones: Zone[]
}

const initialState: AppState = {
  zones: []
};

export const appReducer = createReducer(
  initialState,
  on(setZones, (state, {zones}): AppState => ({...state, zones}))
);
