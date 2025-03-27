import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ReadManyLocationsDto } from "./dto/input/read-many-locations.dto";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom } from "rxjs";
import { AxiosError } from "axios";
import {
  LocationApiResponseInterface,
  LOCATIONS_API_URL,
  LOCATION_LOGGER_CONTEXT,
  CATALAN_LOCALE,
  LocationVariableEnum,
  LOCATION_VARIABLE_API_URL,
  LocationVariableApiResponseInterface,
  API_VARIABLE_PLACEHOLDER,
  API_DAY_PLACEHOLDER,
  LOCATIONS_API_NOT_FOUND_MESSAGE,
  LOCATIONS_API_GENERIC_ERROR_MESSAGE,
  LOCATION_NOT_FOUND_MESSAGE,
  NUM_DAYS_WITH_VARIABLE_DATA,
  CATALAN_TIMEZONE,
  UTC_TIMEZONE,
  LOCATIONS_CACHE_TTL,
  VARIABLES_CACHE_TTL,
  LOCATIONS_CACHE_KEY,
  VARIABLES_CACHE_KEY,
} from "./location.constants";
import { Logger } from "@nestjs/common";
import { ShortLocationDto } from "./dto/output/short-location.dto";
import { PageDto } from "../../common/dto/output/page.dto";
import { PageMetaDto } from "../../common/dto/output/page-meta.dto";
import { LocationDto } from "./dto/output/location.dto";
import { Utils } from "../../common/utils";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class LocationService {
  private logger = new Logger(LOCATION_LOGGER_CONTEXT);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async readMany(
    dto: ReadManyLocationsDto,
  ): Promise<PageDto<ShortLocationDto>> {
    const locationsData = await this.getLocationsData();

    const filteredLocations = locationsData.filter(
      (location) =>
        location.codi &&
        location.nom &&
        (!dto.name ||
          location.nom.includes(dto.name.toLocaleLowerCase(CATALAN_LOCALE))),
    );

    const resultLocations = filteredLocations
      .slice(dto.skip, dto.skip + dto.take)
      .sort((a, b) => a.nom!.localeCompare(b.nom!, CATALAN_LOCALE))
      .map((location) => new ShortLocationDto(location.codi!, location.nom!));

    return new PageDto<ShortLocationDto>(
      resultLocations,
      new PageMetaDto(dto, filteredLocations.length),
    );
  }

  async getLocationsData(): Promise<LocationApiResponseInterface[]> {
    return Utils.withCache(
      this.cacheManager,
      LOCATIONS_CACHE_KEY,
      LOCATIONS_CACHE_TTL,
      async () => {
        const { data } = await firstValueFrom(
          this.httpService
            .get<LocationApiResponseInterface[]>(LOCATIONS_API_URL)
            .pipe(
              catchError((error: AxiosError) => {
                throw this.handleLocationApiError(error);
              }),
            ),
        );

        return data;
      },
    );
  }

  async readOne(code: string): Promise<LocationDto> {
    const [
      locationsData,
      maxTemperatureData,
      minTemperatureData,
      precipitationProbabilityData,
    ] = await Promise.all([
      this.getLocationsData(),
      this.getVariableData(code, LocationVariableEnum.MAX_TEMPERATURE),
      this.getVariableData(code, LocationVariableEnum.MIN_TEMPERATURE),
      this.getVariableData(
        code,
        LocationVariableEnum.PRECIPITATION_PROBABILITY,
      ),
    ]);

    const location = locationsData.find((location) => location.codi === code);

    if (!location || !location.nom) {
      throw new NotFoundException(LOCATION_NOT_FOUND_MESSAGE);
    }

    const dailyVariables = Utils.getNextXDates(
      new Date(),
      NUM_DAYS_WITH_VARIABLE_DATA,
    ).map((date, i) => {
      const dateString = date.toLocaleDateString(CATALAN_LOCALE, {
        timeZone: CATALAN_TIMEZONE,
      });

      // Will return false if S3 data is not updated at 00:00 Catalan Time
      const isSameDate = (data: { value?: number; date?: string }[]) => {
        return (
          data[i]?.date &&
          dateString ===
            new Date(data[i].date!).toLocaleDateString(CATALAN_LOCALE, {
              timeZone: UTC_TIMEZONE,
            })
        );
      };

      let maxTemperature;
      let minTemperature;
      let precipitationProbability;

      if (isSameDate(maxTemperatureData)) {
        maxTemperature = maxTemperatureData[i]?.value;
      }

      if (isSameDate(minTemperatureData)) {
        minTemperature = minTemperatureData[i]?.value;
      }

      if (isSameDate(precipitationProbabilityData)) {
        precipitationProbability = precipitationProbabilityData[i]?.value;
      }

      return {
        maxTemperature,
        minTemperature,
        precipitationProbability,
        dateString,
      };
    });

    return new LocationDto(code, location.nom, dailyVariables);
  }

  async getVariableData(
    code: string,
    variable: LocationVariableEnum,
  ): Promise<{ value?: number; date?: string }[]> {
    const promises = Array.from(
      { length: NUM_DAYS_WITH_VARIABLE_DATA },
      (_, i) => this.getVariableDataForDay(code, i + 1, variable),
    );

    return Promise.all(promises);
  }

  async getVariableDataForDay(
    code: string,
    day: number,
    variable: LocationVariableEnum,
  ): Promise<{
    value?: number;
    date?: string;
  }> {
    return Utils.withCache(
      this.cacheManager,
      VARIABLES_CACHE_KEY + code + variable + day,
      VARIABLES_CACHE_TTL,
      async () => {
        const { data } = await firstValueFrom(
          this.httpService
            .get<LocationVariableApiResponseInterface>(
              LOCATION_VARIABLE_API_URL.replaceAll(
                API_VARIABLE_PLACEHOLDER,
                variable,
              ).replaceAll(API_DAY_PLACEHOLDER, day.toString()),
            )
            .pipe(
              catchError((error: AxiosError) => {
                throw this.handleLocationApiError(error);
              }),
            ),
        );

        const locationData = data.municipis?.find(
          (location) => location.codi === code,
        );

        return {
          value: locationData?.valors?.[0]?.valor,
          date: locationData?.valors?.[0]?.data,
        };
      },
    );
  }

  handleLocationApiError(error: AxiosError): HttpException {
    this.logger.error(error);

    if (error.response?.status === 404) {
      return new NotFoundException(LOCATIONS_API_NOT_FOUND_MESSAGE);
    }

    return new InternalServerErrorException(
      LOCATIONS_API_GENERIC_ERROR_MESSAGE,
    );
  }
}
