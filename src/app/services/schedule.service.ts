import { Injectable } from '@angular/core';
import { Schedule, Lecture, FirstSelector, SecondSelector, DayType, LectureType } from '../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private readonly CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRINslestB3Ef0iDaK4Krbmz5iiYWXZb_cdykIfLyl2lIDPXx38djbA2gCYIFSC8gCnpQsGO3f5KZHY/pub?gid=434239479&single=true&output=csv';

  async getSchedules(): Promise<Schedule[]> {
    const response = await fetch(this.CSV_URL);
    if (!response.ok) throw new Error('Failed to fetch schedule CSV');
    const text = await response.text();
    return this.parseCSV(text);
  }

  private parseCSV(csv: string): Schedule[] {
    const lines = csv.trim().split('\n');
    const rows = lines.slice(1);
    const scheduleMap = new Map<string, Schedule>();

    for (const row of rows) {
      const cols = this.splitCSVRow(row);
      if (cols.length < 10) continue;

      const [year, orientation, name, displayName, day, startTime, endTime, location, teacher, type] = cols;
      const key = `${year}__${orientation}`;

      if (!scheduleMap.has(key)) {
        scheduleMap.set(key, {
          firstSelector: year as FirstSelector,
          secondSelector: orientation ? orientation as SecondSelector : undefined,
          image: this.getImage(year, orientation),
          lectures: []
        });
      }

      scheduleMap.get(key)!.lectures.push({
        name,
        displayName,
        day: day as DayType,
        startTime,
        endTime,
        location,
        teacher,
        type: type.trim() as LectureType
      });
    }

    return Array.from(scheduleMap.values());
  }

  private splitCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  private getImage(year: string, orientation: string): string {
    const yearMap: { [key: string]: string } = {
      'Prva godina': 'Godina1',
      'Druga godina': 'Godina2',
      'Treca godina': 'Godina3',
      'Cetvrta godina': 'Godina4',
      'BMI': 'BMI'
    };
    const base = yearMap[year] ?? 'Godina1';
    if (!orientation || year === 'BMI') return `${base}.png`;
    return `${base}${orientation}.png`;
  }
}