export const FIRST_SELECTORS = [
  "Prva godina",
  "Druga godina",
  "Treca godina",
  "Cetvrta godina",
  "BMI",
] as const;

export const SECOND_SELECTORS = [
	"Linija 1",
	"Linija 2",
	'AR',
	'RI',
	'ESKE',
	'EEMS',
	'TK'
] as const;

export type FirstSelector = typeof FIRST_SELECTORS[number];
export type SecondSelector = typeof SECOND_SELECTORS[number];

export interface Lecture {
	name: string;
	day: string;
	startTime: string;
	endTime: string;
	location: string;
	teacher: string;
	topPercent: number;
	leftPercent: number;
	widthPercent: number;
	heightPercent: number;
}

export interface Schedule {
	firstSelector: FirstSelector;
	secondSelector?: SecondSelector;
	image: string;
	lectures: Lecture[];
}

