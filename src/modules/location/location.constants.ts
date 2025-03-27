export const LOCATION_LOGGER_CONTEXT = "LocationService";

export const LOCATIONS_URL = "locations";

export const LOCATION_CODE_PARAM = "code";

export const LOCATIONS_API_URL =
  "https://static-pre.meteo.cat/ginys/referencia/municipis/municipis.json";

export const LOCATIONS_CACHE_KEY = "smc-s3-locations";

export const LOCATIONS_CACHE_TTL = 24 * 60 * 60 * 1000;

export const VARIABLES_API_URL =
  "https://static-pre.meteo.cat/ginys/models/postProcessament/variables/[VARIABLE_BUCKET]/intervals/24/[VARIABLE_BUCKET]-[DAY]_24h.json";

export const VARIABLE_BUCKET_URL_PLACEHOLDER = "[VARIABLE_BUCKET]";

export const DAY_URL_PLACEHOLDER = "[DAY]";

export const VARIABLES_CACHE_KEY = "smc-s3-variables";

export const VARIABLES_CACHE_TTL = 60 * 1000;

export const CATALAN_LOCALE = "cat";

export const CATALAN_TIMEZONE = "Europe/Madrid";

export const UTC_TIMEZONE = "UTC";

export const LOCATION_NOT_FOUND_MESSAGE = "Location not found.";

export const SMC_API_NOT_FOUND_MESSAGE = "External resource not found.";

export const SMC_API_GENERIC_ERROR_MESSAGE =
  "External resource could not be reached. Try again later.";

export const NUM_DAYS_WITH_VARIABLE_DATA = 8;

export enum VariableBucketEnum {
  MAX_TEMPERATURE = "temperature_max",
  MIN_TEMPERATURE = "temperature_min",
  PRECIPITATION_PROBABILITY = "prob_prec",
}

export const VARIABLE_BUCKET_TO_FIELDS = new Map<
  VariableBucketEnum,
  { valueField: string; deliveryDateField: string }
>([
  [
    VariableBucketEnum.MAX_TEMPERATURE,
    {
      valueField: "maxTemperature",
      deliveryDateField: "maxTemperatureDeliveryDate",
    },
  ],
  [
    VariableBucketEnum.MIN_TEMPERATURE,
    {
      valueField: "minTemperature",
      deliveryDateField: "minTemperatureDeliveryDate",
    },
  ],
  [
    VariableBucketEnum.PRECIPITATION_PROBABILITY,
    {
      valueField: "precipitationProbability",
      deliveryDateField: "precipitationProbabilityDeliveryDate",
    },
  ],
]);
