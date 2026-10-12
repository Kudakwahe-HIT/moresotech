// Plain data, safe to import from client and server components alike.

export type LandingPhoto = {
  /** images.unsplash.com path (served from Unsplash's CDN, resized per screen). */
  src: string;
  alt: string;
  /** Photographer, for our records (the Unsplash Licence does not require on-page credit). */
  credit: string;
  creditUrl: string;
  /** CSS object-position, to keep faces in frame when cropped. */
  focus?: string;
};

const unsplash = (id: string) => `https://images.unsplash.com/${id}`;

/**
 * Free photos under the Unsplash Licence (https://unsplash.com/license). Swap any of these for
 * your own students' photos (with their consent) when you have them: the page reads from here.
 */
export const PHOTOS = {
  graduateCertificate: {
    src: unsplash("photo-1686213011624-8578b598ef0f"),
    alt: "A smiling graduate in a red and black gown holding her degree certificate",
    credit: "Divaris Shirichena",
    creditUrl: "https://unsplash.com/@divaris",
    focus: "50% 30%",
  },
  studentLaptop: {
    src: unsplash("photo-1620829813573-7c9e1877706f"),
    alt: "A university student working on his laptop",
    credit: "Kojo Kwarteng",
    creditUrl: "https://unsplash.com/@cwojo",
    focus: "40% 40%",
  },
  seoulCampus: {
    src: unsplash("photo-1742747215638-0105cbcd2645"),
    alt: "An ivy-covered university building on a campus in Seoul, South Korea",
    credit: "Janet Ganbold",
    creditUrl: "https://unsplash.com/@j4net999",
  },
  studyingBraids: {
    src: unsplash("photo-1604933762021-54a5858c9832"),
    alt: "A student with long braids studying on a laptop at her desk",
    credit: "Daniel Thomas",
    creditUrl: "https://unsplash.com/@soy_danielthomas",
    focus: "45% 35%",
  },
  studyGroup: {
    src: unsplash("photo-1531482615713-2afd69097998"),
    alt: "Students working together around a desk with laptops",
    credit: "X",
    creditUrl: "https://unsplash.com/@disruptxn",
  },
  graduateMan: {
    src: unsplash("photo-1608485439523-25b28d982428"),
    alt: "A proud graduate in cap and gown holding his certificate",
    credit: "Joecalih",
    creditUrl: "https://unsplash.com/@joecalih",
    focus: "50% 25%",
  },
  seoulNight: {
    src: unsplash("photo-1532649097480-b67d52743b69"),
    alt: "The Seoul skyline at dusk under a crescent moon",
    credit: "Ping Onganankun",
    creditUrl: "https://unsplash.com/@pingsterz",
  },
  harareFriends: {
    src: unsplash("photo-1515106542747-6184da66445a"),
    alt: "Two young women smiling in front of a colourful mural in Harare, Zimbabwe",
    credit: "Trust “Tru” Katsande",
    creditUrl: "https://unsplash.com/@iamtru",
    focus: "50% 40%",
  },
  campusBench: {
    src: unsplash("photo-1655720348590-c739c860beed"),
    alt: "Students sitting together on campus steps with their laptops",
    credit: "Iwaria Inc.",
    creditUrl: "https://unsplash.com/@iwaria",
  },
  graduatesGroup: {
    src: unsplash("photo-1719408937898-e15b8638e1d8"),
    alt: "A group of graduates in gowns celebrating together",
    credit: "150 Billi",
    creditUrl: "https://unsplash.com/@150billi",
    focus: "50% 35%",
  },
} satisfies Record<string, LandingPhoto>;

