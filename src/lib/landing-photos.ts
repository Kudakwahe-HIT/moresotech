// Plain data, safe to import from client and server components alike.

export type LandingPhoto = {
  /** Local image path relative to public. */
  src: string;
  alt: string;
  /** CSS object-position, to keep faces in frame when cropped. */
  focus?: string;
};

/** Student and graduate photos supplied in public/images/img. */
export const PHOTOS = {
  graduateCertificate: {
    src: "/images/img/img-3.jpeg",
    alt: "A smiling graduate in a blue gown holding her certificate",
    focus: "50% 30%",
  },
  studentLaptop: {
    src: "/images/img/img-1.jpeg",
    alt: "Students sharing a meal together at a university event",
    focus: "50% 40%",
  },
  seoulCampus: {
    src: "/images/img/img-8.jpeg",
    alt: "Graduates gathered outside an ivy-covered university building",
    focus: "50% 35%",
  },
  studyingBraids: {
    src: "/images/img/img-2.jpeg",
    alt: "Students posing together with certificates at a university event",
    focus: "50% 45%",
  },
  studyGroup: {
    src: "/images/img/img-1.jpeg",
    alt: "Students enjoying a meal together at a university event",
    focus: "50% 40%",
  },
  graduateMan: {
    src: "/images/img/img-4.jpeg",
    alt: "A smiling graduate in a blue gown seated beside a university flag",
    focus: "50% 30%",
  },
  seoulNight: {
    src: "/images/img/img-7.jpeg",
    alt: "Graduates holding bouquets outside an ivy-covered university building",
    focus: "50% 35%",
  },
  harareFriends: {
    src: "/images/img/img-5.jpeg",
    alt: "A graduate and a friend celebrating outdoors with a bouquet",
    focus: "50% 30%",
  },
  campusBench: {
    src: "/images/img/img-6.jpeg",
    alt: "A graduate celebrating with friends on a sunny university campus",
    focus: "50% 40%",
  },
  graduatesGroup: {
    src: "/images/img/img-7.jpeg",
    alt: "A group of graduates in blue gowns celebrating with bouquets on campus",
    focus: "50% 35%",
  },
} satisfies Record<string, LandingPhoto>;
