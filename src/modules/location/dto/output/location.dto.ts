export class LocationDto {
  code: string;
  name: string;
  dailyVariables: {
    maxTemperature?: number;
    minTemperature?: number;
    precipitationProbability?: number;
    dateString: string;
  }[];

  constructor(
    code: string,
    name: string,
    dailyVariables: {
      maxTemperature?: number;
      minTemperature?: number;
      precipitationProbability?: number;
      dateString: string;
    }[],
  ) {
    this.code = code;
    this.name = name;
    this.dailyVariables = dailyVariables;
  }
}
