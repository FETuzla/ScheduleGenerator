export const FIRST_SELECTORS = [
  'Prva godina',
  'Druga godina',
  'Treca godina',
  'Cetvrta godina',
  'BMI',
  'Profesori',
  'Prostorije',
] as const;

export const SECOND_SELECTORS = ['Linija 1', 'Linija 2', 'AR', 'RI', 'ESKE', 'EEMS', 'TK'] as const;

export const DAYS = [
  'Ponedjeljak',
  'Utorak',
  'Srijeda',
  'Četvrtak',
  'Cetvrtak',
  'Petak',
  'Subota',
  'Nedjelja',
] as const;

export const LECTURE_TYPES = ['Predavanje', 'AV', 'LV'] as const;

export type FirstSelector = (typeof FIRST_SELECTORS)[number];
export type SecondSelector = (typeof SECOND_SELECTORS)[number];
export type DayType = (typeof DAYS)[number];
export type LectureType = (typeof LECTURE_TYPES)[number];

export interface Lecture {
  name: string;
  displayName: string;
  day: DayType;
  startTime: string;
  endTime: string;
  location: string;
  teacher: string;
  type: LectureType;
}

export interface Schedule {
  firstSelector: FirstSelector;
  secondSelector?: SecondSelector;
  image: string;
  lectures: Lecture[];
}
