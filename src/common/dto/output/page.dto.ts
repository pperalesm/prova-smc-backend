import { PageMetaDto } from "./page-meta.dto";

export class PageDto<T> {
  data: T[];
  meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
