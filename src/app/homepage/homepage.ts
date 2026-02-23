import { Component, signal, ViewChild } from '@angular/core';
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
  @ViewChild(CustomSchedule) customSchedule!: CustomSchedule;

  selectedFirst: FirstSelector = 'Prva godina';
  selectedSecond: SecondSelector | null = 'Linija 1';
  firstSelectors = FIRST_SELECTORS;

  onFirstChange() {
    const options = this.secondSelectors;
    this.selectedSecond = options.length ? options[0] : null;
  }

  get secondSelectors(): SecondSelector[] {
    if (this.selectedFirst === 'Prva godina') return ['Linija 1', 'Linija 2'];
    if (this.selectedFirst === 'BMI') return [];
    return ['AR', 'EEMS', 'ESKE', 'RI', 'TK'];
  }

  get schedule(): Schedule {
    return SCHEDULES.find(
      (s) =>
        s.firstSelector === this.selectedFirst &&
        (s.secondSelector ?? null) === (this.selectedSecond ?? null),
    )!!;
  }

  addLectureToCustom(lecture: Lecture) {
    if (this.customSchedule) {
      this.customSchedule.addLecture(lecture);
    }
  }

  onLectureClick(lecture: Lecture) {
    console.log('Lecture clicked on canvas:', lecture.name);
  }
}