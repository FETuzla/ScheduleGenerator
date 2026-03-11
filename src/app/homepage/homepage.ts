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
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleComponent, CustomSchedule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
})
export class Homepage {
  @ViewChild('customScheduleComponent') customSchedule!: CustomSchedule;
  @ViewChild(ScheduleComponent) scheduleComponent!: ScheduleComponent;

  selectedFirst: FirstSelector = 'Prva godina';
  selectedSecond: SecondSelector | string | null = 'Linija 1';
  firstSelectors = FIRST_SELECTORS;

  schedules: Schedule[] = [];
  loading = true;
  error = false;
  otherPages: { name: string; url: string; visible: boolean; contributors: string[] }[] = [];
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
      this.otherPages = (data as { name: string; url: string; visible: boolean; contributors: string[] }[]).filter(
        (page) => page.visible && page.name !== 'ScheduleGenerator',
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

  getPriority(title: string) {
    if (title.startsWith('red.prof.dr.')) return 1;
    if (title.startsWith('vanr.prof.dr.')) return 2;
    if (title.includes('doc.dr')) return 3;
    if (title.startsWith('v.as.MA')) return 4;
    if (title.startsWith('v.as.')) return 5;
    if (title.startsWith('as.')) return 6;
    if (title.startsWith('sp.MA')) return 7;
    return 8;
  }

  get secondSelectors(): SecondSelector[] | string[] {
    if (this.selectedFirst === 'Prva godina') return ['Linija 1', 'Linija 2'];
    if (this.selectedFirst === 'TOI') return ['Prva godina', 'Druga godina', 'Treca godina'];
    if (this.selectedFirst === 'BMI') return [];
    if (this.selectedFirst === 'Predavači') {
      return [
        ...new Set(
          this.schedules.flatMap((sched) => {
            return sched.lectures.flatMap((lect) =>
              lect.teacher.split('/').flatMap((l) => l.replaceAll(/\(.*\)/g, '').trim()),
            );
          }),
        ),
      ]
        .filter((s) => s.trim() !== '')
        .sort((a, b) => {
          const priorityDiff = this.getPriority(a) - this.getPriority(b);
          if (priorityDiff !== 0) return priorityDiff;

          return a.localeCompare(b, 'bs'); //
        });
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
    if (this.selectedFirst === 'Predavači') {
      const seen = new Set<string>();
      return (
        this.schedules
          .flatMap((scheds) => {
            return scheds.lectures.filter((lect) => lect.teacher.includes(this.selectedSecond!!));
          })
          .filter((lect) => {
            const key = `${lect.name}-${lect.day}-${lect.startTime}-${lect.endTime}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          }) || null
      );
    }
    if (this.selectedFirst === 'Prostorije') {
      const seen = new Set<string>();
      return (
        this.schedules
          .flatMap((scheds) =>
            scheds.lectures.filter((lect) => lect.location.includes(this.selectedSecond!!)),
          )
          .filter((lect) => {
            const key = `${lect.name}-${lect.day}-${lect.startTime}-${lect.endTime}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
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

  async exportToPdf() {
    const pdf: any = new jsPDF('l', 'mm', 'a4');
    if (this.selectedFirst === 'Predavači' || this.selectedFirst === 'Prostorije') {
      const canvas: HTMLCanvasElement = this.scheduleComponent.getCanvasFromDrawingTool();
      const height = 45;
      const legendCanvas = document.createElement('canvas');

      legendCanvas.width = canvas.width;
      legendCanvas.height = canvas.height + height;

      const ctx = legendCanvas.getContext('2d')!;

      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, legendCanvas.width, height);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, legendCanvas.width, height);

      const label = `${this.selectedFirst}${this.selectedSecond ? ' - ' + this.selectedSecond : ''}`;
      const fontSize = Math.round(height * 0.5);

      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 20, height / 2);
      ctx.drawImage(canvas, 0, height);

      const imgData = legendCanvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 10, 277, 0);
      pdf.save(`${this.selectedFirst} - ${this.selectedSecond}.pdf`);
      return;
    }

    const orientations =
      this.secondSelectors.length > 0 ? (this.secondSelectors as string[]) : [null];

    const originalSecond = this.selectedSecond;
    let firstPage = true;

    for (const orientation of orientations) {
      this.selectedSecond = orientation;
      this.cdr.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const canvas: HTMLCanvasElement = this.scheduleComponent.getCanvasFromDrawingTool();
      const height = 45;

      const legendCanvas = document.createElement('canvas');
      legendCanvas.width = canvas.width;
      legendCanvas.height = canvas.height + height;

      const ctx = legendCanvas.getContext('2d')!;

      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, legendCanvas.width, height);

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, legendCanvas.width, height);

      const label = `${this.selectedFirst}${orientation ? ' - ' + orientation : ''}`;
      const fontSize = Math.round(height * 0.5);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 20, height / 2);

      const rectSize = Math.round(height * 0.85);
      const legendItems = [
        { color: '#ff0000', label: 'Predavanje' },
        { color: '#2600ff', label: 'AV' },
        { color: '#1b5e20', label: 'LV' },
      ];

      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      const napomena = 'Napomena:';
      const napomenaWidth = ctx.measureText(napomena + ' ').width;

      let legendX = legendCanvas.width - 20;
      for (let i = legendItems.length - 1; i >= 0; i--) {
        const item = legendItems[i];
        const labelWidth = ctx.measureText(' ' + item.label + '  ').width;
        legendX -= labelWidth + rectSize + 10;
      }
      legendX -= napomenaWidth;

      ctx.fillStyle = '#000';
      ctx.fillText(napomena + ' ', legendX, height / 2);
      legendX += napomenaWidth;

      for (const item of legendItems) {
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, height / 2 - rectSize / 2, rectSize, rectSize);
        legendX += rectSize + 6;

        ctx.fillStyle = '#000';
        ctx.fillText(item.label + '  ', legendX, height / 2);
        legendX += ctx.measureText(item.label + '  ').width;
      }

      ctx.drawImage(canvas, 0, height);

      if (!firstPage) pdf.addPage();
      const imgData = legendCanvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, 10, 277, 0);
      firstPage = false;
    }

    this.selectedSecond = originalSecond;
    this.cdr.detectChanges();

    pdf.save(`${this.selectedFirst}.pdf`);
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
