import {createReducer, on} from '@ngrx/store';
import {Zone} from "../types/zone";
import {loadZonesSuccess} from "./app.actions";


export interface AppState {
  zones?: Zone[]
}

const initialState: AppState = {
};

export const appReducer = createReducer(
  initialState,
  on(loadZonesSuccess, (state, {zones}): AppState => ({...state, zones}))
);
