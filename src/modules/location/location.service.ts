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
  LOCATIONS_API_URL,
  LOCATION_LOGGER_CONTEXT,
  CATALAN_LOCALE,
  VariableBucketEnum,
  VARIABLES_API_URL,
  VARIABLE_BUCKET_URL_PLACEHOLDER,
  DAY_URL_PLACEHOLDER,
  SMC_API_NOT_FOUND_MESSAGE,
  SMC_API_GENERIC_ERROR_MESSAGE,
  LOCATION_NOT_FOUND_MESSAGE,
  NUM_DAYS_WITH_VARIABLE_DATA,
  CATALAN_TIMEZONE,
  UTC_TIMEZONE,
  LOCATIONS_CACHE_TTL,
  VARIABLES_CACHE_TTL,
  LOCATIONS_CACHE_KEY,
  VARIABLES_CACHE_KEY,
  VARIABLE_BUCKET_TO_FIELDS,
} from "./location.constants";
import { Logger } from "@nestjs/common";
import { ShortLocationDto } from "./dto/output/short-location.dto";
import { PageDto } from "../../common/dto/output/page.dto";
import { PageMetaDto } from "../../common/dto/output/page-meta.dto";
import { LocationDto } from "./dto/output/location.dto";
import { Utils } from "../../common/utils";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import {
  DailyVariableInterface,
  LocationApiResponseInterface,
  VariableApiResponseInterface,
  VariableDataInterface,
} from "./location.interfaces";

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

    const paginatedLocations = filteredLocations
      .slice(dto.skip, dto.skip + dto.take)
      .sort((a, b) => a.nom!.localeCompare(b.nom!, CATALAN_LOCALE))
      .map((location) => new ShortLocationDto(location.codi!, location.nom!));

    return new PageDto<ShortLocationDto>(
      paginatedLocations,
      new PageMetaDto(dto, filteredLocations.length),
    );
  }

  async readOne(code: string): Promise<LocationDto> {
    const variableBuckets = Object.values(VariableBucketEnum);

    const [locationsData, ...allVariableData] = await Promise.all([
      this.getLocationsData(),
      ...variableBuckets.map((variableBucket) =>
        this.getVariableData(code, variableBucket),
      ),
    ]);

    const location = locationsData.find((location) => location.codi === code);

    if (!location || !location.nom) {
      throw new NotFoundException(LOCATION_NOT_FOUND_MESSAGE);
    }

    const dailyVariables: DailyVariableInterface[] = [];

    const dateToDayNumber = Utils.getNextXDates(
      new Date(),
      NUM_DAYS_WITH_VARIABLE_DATA,
    ).reduce((result, date, i) => {
      const dayDateString = Utils.getDateStringAtTimeZone(
        date,
        CATALAN_LOCALE,
        CATALAN_TIMEZONE,
      );

      dailyVariables.push({ dateString: dayDateString });

      result.set(dayDateString, i + 1);

      return result;
    }, new Map<string, number>());

    variableBuckets.forEach((variableBucket, index) => {
      this.getValuesFromVariableData(
        variableBucket,
        allVariableData[index],
        dateToDayNumber,
        dailyVariables,
      );
    });

    return new LocationDto(code, location.nom, dailyVariables);
  }

  getValuesFromVariableData(
    variable: VariableBucketEnum,
    variableData: VariableDataInterface[],
    dateToDayNumber: Map<string, number>,
    dailyVariables: DailyVariableInterface[],
  ): void {
    for (const item of variableData) {
      if (!item.date) {
        continue;
      }

      const itemDateString = Utils.getDateStringAtTimeZone(
        item.date,
        CATALAN_LOCALE,
        UTC_TIMEZONE,
      );

      if (!dateToDayNumber.has(itemDateString)) {
        continue;
      }

      const valueField = VARIABLE_BUCKET_TO_FIELDS.get(variable)!.valueField;

      const deliveryDateField =
        VARIABLE_BUCKET_TO_FIELDS.get(variable)!.deliveryDateField;

      const dailyVariable =
        dailyVariables[dateToDayNumber.get(itemDateString)! - 1];

      const todayDateString = dailyVariables[0].dateString;

      const itemDeliveryDateString = item.deliveryDate
        ? Utils.getDateStringAtTimeZone(
            item.deliveryDate,
            CATALAN_LOCALE,
            UTC_TIMEZONE,
          )
        : undefined;

      const isAReliableUpdate =
        dailyVariable[deliveryDateField] !== todayDateString &&
        itemDeliveryDateString === todayDateString;

      if (dailyVariable[valueField] !== undefined && !isAReliableUpdate) {
        continue;
      }

      dailyVariable[valueField] = item.value;
      dailyVariable[deliveryDateField] = itemDeliveryDateString;
    }
  }

  async getVariableData(
    code: string,
    variableBucket: VariableBucketEnum,
  ): Promise<VariableDataInterface[]> {
    return Promise.all(
      Array.from({ length: NUM_DAYS_WITH_VARIABLE_DATA }, (_, i) =>
        this.getVariableDataForDay(code, i + 1, variableBucket),
      ),
    );
  }

  async getVariableDataForDay(
    code: string,
    day: number,
    variableBucket: VariableBucketEnum,
  ): Promise<VariableDataInterface> {
    return Utils.withCache(
      this.cacheManager,
      VARIABLES_CACHE_KEY + code + variableBucket + day,
      VARIABLES_CACHE_TTL,
      async () => {
        const { data } = await firstValueFrom(
          this.httpService
            .get<VariableApiResponseInterface>(
              VARIABLES_API_URL.replaceAll(
                VARIABLE_BUCKET_URL_PLACEHOLDER,
                variableBucket,
              ).replaceAll(DAY_URL_PLACEHOLDER, day.toString()),
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
          deliveryDate: data.dataSortida,
        };
      },
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

  handleLocationApiError(error: AxiosError): HttpException {
    this.logger.error(error);

    if (error.response?.status === 404) {
      return new NotFoundException(SMC_API_NOT_FOUND_MESSAGE);
    }

    return new InternalServerErrorException(SMC_API_GENERIC_ERROR_MESSAGE);
  }
}
