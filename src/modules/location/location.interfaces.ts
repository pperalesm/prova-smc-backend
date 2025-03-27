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

export interface VariableApiResponseInterface {
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

export interface VariableDataInterface {
  value?: number;
  date?: string;
  deliveryDate?: string;
}

export type DailyVariableInterface = {
  dateString: string;
  [key: string]: string | number | undefined;
};
