import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleComponent } from '../schedule-component/schedule-component';
import { FIRST_SELECTORS, FirstSelector, Schedule, SecondSelector, Lecture } from '../models/schedule.model';
import { SCHEDULES } from '../data/schedules.data';
import { CustomSchedule } from "../custom-schedule/custom-schedule";

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleComponent, CustomSchedule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
})
export class Homepage {
  selectedFirst: FirstSelector = 'Prva godina';
  selectedSecond: SecondSelector | null = 'Linija 1';

  firstSelectors = FIRST_SELECTORS;

  onFirstChange() {
    const options = this.secondSelectors;

    this.selectedSecond = options.length ? options[0] : null;
  }

  get secondSelectors(): SecondSelector[] {
    if (this.selectedFirst === 'Prva godina') {
      return ['Linija 1', 'Linija 2'];
    }

    if (this.selectedFirst === 'BMI') {
      return [];
    }

    return ['AR', 'EEMS', 'ESKE', 'RI', 'TK'];
  }

  get secondPlaceholder(): string {
    if (this.selectedFirst === 'Prva godina') {
      return 'Odaberi liniju';
    }
    return 'Odaberi smjer';
  }

  get schedule(): Schedule {
    return SCHEDULES.find(
      (s) =>
        s.firstSelector === this.selectedFirst &&
        (s.secondSelector ?? null) === (this.selectedSecond ?? null),
    )!!;
  }

  myLectures = signal<Lecture[]>([]);

  addLectureToCustom(lecture: Lecture) {
    const hourHeight = 7.7;
    const dayWidth = 20;

    const getDecimalHour = (timeStr: string) => {
      const [hh, mm] = timeStr.split(':').map(Number);
      return hh + (mm / 60);
    };

    this.myLectures.update(current => {
      const isDuplicate = current.some(l => 
        l.name === lecture.name && 
        l.day === lecture.day && 
        l.startTime === lecture.startTime
      );

      if (isDuplicate) {
        return current;
      }

      const dayLectures = [...current.filter(l => l.day === lecture.day), { ...lecture }];
      dayLectures.sort((a, b) => getDecimalHour(a.startTime) - getDecimalHour(b.startTime));

      const clusters: Lecture[][] = [];
      dayLectures.forEach(lec => {
        const start = getDecimalHour(lec.startTime);
        const end = getDecimalHour(lec.endTime);
        
        const targetCluster = clusters.find(c => 
          c.some(l => start < getDecimalHour(l.endTime) && end > getDecimalHour(l.startTime))
        );

        if (targetCluster) {
          targetCluster.push(lec);
        } else {
          clusters.push([lec]);
        }
      });

      const updatedDay: Lecture[] = [];
      const dayMap: { [key: string]: number } = {
        'Monday': 0, 'Tuesday': 20, 'Wednesday': 40, 'Thursday': 60, 'Friday': 80
      };
      const dayBase = dayMap[lecture.day] ?? 0;

      clusters.forEach(cluster => {
        const subColumnEnds: number[] = [];
        const assignedSlots = new Map<Lecture, number>();

        cluster.sort((a, b) => getDecimalHour(a.startTime) - getDecimalHour(b.startTime));

        cluster.forEach(lec => {
          const start = getDecimalHour(lec.startTime);
          const end = getDecimalHour(lec.endTime);
          let slotFound = false;

          for (let i = 0; i < subColumnEnds.length; i++) {
            if (subColumnEnds[i] <= start) {
              subColumnEnds[i] = end;
              assignedSlots.set(lec, i);
              slotFound = true;
              break;
            }
          }
          if (!slotFound) {
            assignedSlots.set(lec, subColumnEnds.length);
            subColumnEnds.push(end);
          }
        });

        const clusterWidth = dayWidth / subColumnEnds.length;

        cluster.forEach(l => {
          const start = getDecimalHour(l.startTime);
          const end = getDecimalHour(l.endTime);
          const slotIndex = assignedSlots.get(l) ?? 0;

          updatedDay.push({
            ...l,
            topPercent: Number(((start - 8) * hourHeight).toFixed(3)),
            heightPercent: Number(((end - start) * hourHeight).toFixed(3)),
            widthPercent: Number(clusterWidth.toFixed(3)),
            leftPercent: Number((dayBase + (slotIndex * clusterWidth)).toFixed(3))
          });
        });
      });

      const otherDays = current.filter(l => l.day !== lecture.day);
      return [...otherDays, ...updatedDay];
    });
  }
}
