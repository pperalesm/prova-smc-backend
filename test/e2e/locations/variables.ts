export const variables = {
  dataSortida: "2025-03-27T00:00Z",
  municipis: [
    {
      nom: "Abella de la Conca",
      codi: "250019",
      coordenada: {
        latitud: 42.16128709700006,
        longitud: 1.0917060449996343,
        srid: "4326",
      },
      valors: [
        {
          valor: 16.269,
          data:
            new Date()
              .toLocaleDateString("cat", { timeZone: "Europe/Madrid" })
              .split("/")
              .map((n) => (n.length < 2 ? "0" + n : n))
              .reverse()
              .join("-") + "T00:00Z",
        },
      ],
    },
    {
      nom: "Abrera",
      codi: "080018",
      coordenada: {
        latitud: 41.51625790100007,
        longitud: 1.902237925000048,
        srid: "4326",
      },
      valors: [{ valor: 15.269, data: "2025-03-29T00:00Z" }],
    },
  ],
  codiVariable: "qualsevol",
  nomVariable: "Qualsevol",
  unitat: "C",
};
