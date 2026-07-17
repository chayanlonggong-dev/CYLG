export interface Model {
  id: string;
  images: string[];
  age: number;
  height: string;
  location: string;
  languages: string[];
  about: string;
  whatsapp: string;
  telegram: string;
  signal: string;
}

export const models: Model[] = [
  {
    id: "SS001",

    images: [
      "/models/SS001-1.jpg",
      "/models/SS001-2.jpg",
      "/models/SS001-3.jpg",
      "/models/SS001-4.jpg",
    ],

    age: 22,

    height: "168 cm",

    location: "Bangkok",

    languages: [
      "English",
      "Chinese",
      "Thai",
    ],

    about:
      "Graceful, elegant and charming. An elite companion offering luxury experiences with absolute discretion.",

    whatsapp: "66812345678",

    telegram: "ChaYanLongGong",

    signal: "ChaYanLongGong",
  },
];