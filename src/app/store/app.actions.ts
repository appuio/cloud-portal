import {createAction, props} from "@ngrx/store";
import {Zone} from "../types/zone";

export const loadZones = createAction('[App] Load zones');
export const setZones = createAction('[App] Set zones', props<{zones: Zone[]}>());
