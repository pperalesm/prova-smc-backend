import { DailyVariableInterface } from "../../location.interfaces";

export class LocationDto {
  code: string;
  name: string;
  dailyVariables: DailyVariableInterface[];

  constructor(
    code: string,
    name: string,
    dailyVariables: DailyVariableInterface[],
  ) {
    this.code = code;
    this.name = name;
    this.dailyVariables = dailyVariables;
  }
}
