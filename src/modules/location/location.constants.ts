export const LOCATION_LOGGER_CONTEXT = "LocationService";

export const LOCATIONS_URL = "locations";

export const LOCATIONS_CACHE_TTL = 24 * 60 * 60 * 1000;

export const LOCATION_CACHE_TTL = 60 * 1000;

export const LOCATION_CODE_PARAM = "code";

export const CATALAN_LOCALE = "cat";

export const CATALAN_TIMEZONE = "Europe/Madrid";

export const UTC_TIMEZONE = "UTC";

export const LOCATIONS_API_URL =
  "https://static-pre.meteo.cat/ginys/referencia/municipis/municipis.json";

export interface LocationApiResponseInterface {
  codi?: string;
  nom?: string;
  coordenades?: {
    latitud?: number;
    longitud?: number;
  };
  comarca?: {
    codi?: number;
    nom?: string;
  };
  slug?: string | null;
}

export const LOCATION_NOT_FOUND_MESSAGE = "Location not found.";

export const LOCATIONS_API_NOT_FOUND_MESSAGE = "Resource not found.";

export const LOCATIONS_API_GENERIC_ERROR_MESSAGE =
  "Resource could not be reached. Try again later.";

export const API_VARIABLE_PLACEHOLDER = "[VARIABLE]";

export const API_DAY_PLACEHOLDER = "[DAY]";

export const NUM_DAYS_WITH_VARIABLE_DATA = 8;

export const LOCATION_VARIABLE_API_URL =
  "https://static-pre.meteo.cat/ginys/models/postProcessament/variables/[VARIABLE]/intervals/24/[VARIABLE]-[DAY]_24h.json";

export interface LocationVariableApiResponseInterface {
  dataSortida?: string;
  municipis?: {
    codi?: string;
    nom?: string;
    coordenada?: { latitud?: number; longitud?: number; srid?: string };
    valors?: { valor?: number; data?: string }[];
  }[];
  codiVariable?: string;
  nomVariable?: string;
  unitat?: string;
}

export enum LocationVariableEnum {
  MAX_TEMPERATURE = "temperature_max",
  MIN_TEMPERATURE = "temperature_min",
  PRECIPITATION_PROBABILITY = "prob_prec",
}
