import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleComponent } from '../schedule-component/schedule-component';
import { FIRST_SELECTORS, FirstSelector, Schedule, SecondSelector, Lecture } from '../models/schedule.model';
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
  selectedSecond: SecondSelector | null = 'Linija 1';
  firstSelectors = FIRST_SELECTORS;

  schedules: Schedule[] = [];
  loading = true;
  error = false;
  otherPages: string[] = [];
  showHelp = true;
  menuOpen = false;

  constructor(private scheduleService: ScheduleService, private cdr: ChangeDetectorRef) {}

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
        (page) => page !== window.location.pathname.replace(/^\/|\/$/g, '')
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

  get secondSelectors(): SecondSelector[] {
    if (this.selectedFirst === 'Prva godina') return ['Linija 1', 'Linija 2'];
    if (this.selectedFirst === 'BMI') return [];
    return ['AR', 'EEMS', 'ESKE', 'RI', 'TK'];
  }

  get schedule(): Schedule | null {
    if (!this.schedules.length) return null;
    return this.schedules.find(
      (s) =>
        s.firstSelector === this.selectedFirst &&
        (s.secondSelector ?? null) === (this.selectedSecond ?? null)
    ) ?? null;
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