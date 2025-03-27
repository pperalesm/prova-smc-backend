import { Controller, Get, Param, Query, UseInterceptors } from "@nestjs/common";
import { ShortLocationDto } from "./dto/output/short-location.dto";
import { LocationService } from "./location.service";
import { ReadManyLocationsDto } from "./dto/input/read-many-locations.dto";
import { PageDto } from "../../common/dto/output/page.dto";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import {
  LOCATIONS_CACHE_TTL,
  LOCATIONS_URL,
  LOCATION_CACHE_TTL,
  LOCATION_CODE_PARAM,
} from "./location.constants";
import { LocationDto } from "./dto/output/location.dto";

@Controller(LOCATIONS_URL)
export class LocationController {
  constructor(private locationService: LocationService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(LOCATIONS_CACHE_TTL)
  async readMany(
    @Query() dto: ReadManyLocationsDto,
  ): Promise<PageDto<ShortLocationDto>> {
    return await this.locationService.readMany(dto);
  }

  @Get(":" + LOCATION_CODE_PARAM)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(LOCATION_CACHE_TTL)
  async readOne(
    @Param(LOCATION_CODE_PARAM) code: string,
  ): Promise<LocationDto> {
    return await this.locationService.readOne(code);
  }
}
