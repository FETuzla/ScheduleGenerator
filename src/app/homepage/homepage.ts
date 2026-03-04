import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleComponent } from '../schedule-component/schedule-component';
import {
  FIRST_SELECTORS,
  FirstSelector,
  Schedule,
  SecondSelector,
  Lecture,
} from '../models/schedule.model';
import { CustomSchedule } from '../custom-schedule/custom-schedule';
import { ScheduleService } from '../services/schedule.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleComponent, CustomSchedule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
})
export class Homepage {
  @ViewChild('customScheduleComponent') customSchedule!: CustomSchedule;

  selectedFirst: FirstSelector = 'Prva godina';
  selectedSecond: SecondSelector | string | null = 'Linija 1';
  firstSelectors = FIRST_SELECTORS;

  schedules: Schedule[] = [];
  loading = true;
  error = false;
  otherPages: string[] = [];
  showHelp = true;
  menuOpen = false;

  constructor(
    private scheduleService: ScheduleService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    this.loadPages();
    this.checkMenu();
    try {
      this.schedules = await this.scheduleService.getSchedules();
    } catch (e) {
      console.error(e);
      this.error = true;
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async loadPages() {
    try {
      const response = await fetch('https://fetuzla.github.io/information/pages.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      this.otherPages = (data as string[]).filter(
        (page) => page !== window.location.pathname.replace(/^\/|\/$/g, ''),
      );
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    }
  }

  checkMenu() {
    if (window.localStorage.getItem('showHelp') !== null) {
      this.showHelp = false;
    }
  }

  onFirstChange() {
    const options = this.secondSelectors;
    this.selectedSecond = options.length ? options[0] : null;
  }

  get secondSelectors(): SecondSelector[] | string[] {
    if (this.selectedFirst === 'Prva godina') return ['Linija 1', 'Linija 2'];
    if (this.selectedFirst === 'TOI') return ['Prva godina', 'Druga godina', 'Treca godina'];
    if (this.selectedFirst === 'BMI') return [];
    if (this.selectedFirst === 'Profesori') {
      return [
        ...new Set(
          this.schedules.flatMap((sched) => {
            return sched.lectures.flatMap((lect) =>
              lect.teacher.split('/').flatMap((l) => l.replaceAll(/\(.*\)/g, '').trim()),
            );
          }),
        ),
      ].filter((s) => s.trim() !== '');
    }
    if (this.selectedFirst === 'Prostorije') {
      return [
        ...new Set(
          this.schedules.flatMap((sched) => {
            return sched.lectures.flatMap((lect) => lect.location.split('/')[0].trim());
          }),
        ),
      ].filter((s) => s.trim() !== '');
    }
    return ['AR', 'EEMS', 'ESKE', 'RI', 'TK'];
  }

  get lectures(): Lecture[] | null {
    if (!this.schedules.length) return null;
    if (this.selectedFirst === 'Profesori') {
      return (
        this.schedules.flatMap((scheds) => {
          return scheds.lectures.filter((lect) => lect.teacher.includes(this.selectedSecond!!));
        }) || null
      );
    }
    if (this.selectedFirst === 'Prostorije') {
      return (
        this.schedules.flatMap((scheds) => {
          return scheds.lectures.filter((lect) => lect.location.includes(this.selectedSecond!!));
        }) || null
      );
    }
    return (
      this.schedules.find(
        (s) =>
          s.firstSelector === this.selectedFirst &&
          (s.secondSelector ?? null) === (this.selectedSecond ?? null),
      )?.lectures ?? null
    );
  }

  addLectureToCustom(lecture: Lecture) {
    this.customSchedule?.addLecture(lecture);
  }

  onLectureClick(lecture: Lecture) {
    console.log('Lecture clicked on canvas:', lecture.name);
  }

  toggleHelp() {
    this.showHelp = !this.showHelp;
    window.localStorage.setItem('showHelp', 'opened');
  }

  showMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
