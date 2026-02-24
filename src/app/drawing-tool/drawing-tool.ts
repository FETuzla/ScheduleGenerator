import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lecture } from '../models/schedule.model';

@Component({
  selector: 'app-drawing-tool',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drawing-tool.html',
  styleUrls: ['./drawing-tool.scss']
})
export class DrawingTool implements AfterViewInit, OnChanges {
  @Input() lectures: Lecture[] = [];
  @Output() lectureClicked = new EventEmitter<Lecture>();

  @ViewChild('scheduleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  private processedLectures: (Lecture & { 
    topPercent: number, 
    leftPercent: number, 
    widthPercent: number, 
    heightPercent: number 
  })[] = [];

  private readonly hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  private readonly dayLabelsFull = ['PONEDJELJAK', 'UTORAK', 'SRIJEDA', 'ČETVRTAK', 'PETAK'];
  private readonly dayLabelsShort = ['PON', 'UTO', 'SRI', 'ČET', 'PET'];
  
  private sidebarWidth = 25; 
  private headerHeight = 25;
  private dpr = window.devicePixelRatio || 1;
  
  private hourHeight = 0;
  private dayWidth = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['lectures']) {
      this.updateProcessedLectures();
    }
  }

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.resizeCanvas();
    this.updateProcessedLectures();
  }

  private updateProcessedLectures() {
    this.processedLectures = [];
    if (!this.lectures || this.lectures.length === 0) {
      if (this.ctx) this.render();
      return;
    }

    const groups = new Map<string, any[]>();
    
    this.lectures.forEach(lec => {
      const isWeekend = ['saturday', 'subota', 'sunday', 'nedjelja'].includes(lec.day.toLowerCase());
      const targetDay = isWeekend ? 'petak' : lec.day.toLowerCase();
      
      if (!groups.has(targetDay)) groups.set(targetDay, []);
      groups.get(targetDay)!.push(lec);
    });

    groups.forEach((dayLectures, daydisplayName) => {
      const processed = this.processDayLayout(dayLectures, daydisplayName);
      this.processedLectures.push(...processed);
    });

    if (this.ctx) this.render();
  }

  private processDayLayout(dayLectures: any[], daydisplayName: string) {
    dayLectures = dayLectures.map(lec => 
      (lec.day.toLowerCase() === 'saturday' || lec.day.toLowerCase() === 'subota') 
        ? { ...lec, startTime: '18:00', endTime: '20:00' } 
        : lec
    );

    const getDecimalHour = (timeStr: string) => {
      const [hh, mm] = timeStr.split(':').map(Number);
      return hh + (mm / 60);
    };

    const dayMap: { [key: string]: number } = {
      'monday': 0, 'tuesday': 20, 'wednesday': 40, 'thursday': 60, 'friday': 80,
      'ponedjeljak': 0, 'utorak': 20, 'srijeda': 40, 'četvrtak': 60, 'petak': 80,
      'saturday': 80, 'subota': 80
    };
    
    const dayBase = dayMap[daydisplayName.toLowerCase()] ?? 0;
    const hourScale = 100 / this.hours.length;

    const clusters: any[][] = [];
    dayLectures.sort((a, b) => getDecimalHour(a.startTime) - getDecimalHour(b.startTime));

    dayLectures.forEach(lec => {
      const start = getDecimalHour(lec.startTime);
      const end = getDecimalHour(lec.endTime);
      const targetCluster = clusters.find(c => 
        c.some(l => start < getDecimalHour(l.endTime) && end > getDecimalHour(l.startTime))
      );
      if (targetCluster) targetCluster.push(lec);
      else clusters.push([lec]);
    });

    const result: any[] = [];
    clusters.forEach(cluster => {
      const columns: number[] = [];
      const assignedSlots = new Map();

      cluster.forEach(lec => {
        const start = getDecimalHour(lec.startTime);
        let slotFound = false;
        for (let i = 0; i < columns.length; i++) {
          if (columns[i] <= start) {
            columns[i] = getDecimalHour(lec.endTime);
            assignedSlots.set(lec, i);
            slotFound = true;
            break;
          }
        }
        if (!slotFound) {
          assignedSlots.set(lec, columns.length);
          columns.push(getDecimalHour(lec.endTime));
        }
      });

      const slotWidthPercent = 20 / columns.length; 

      cluster.forEach(l => {
        const start = getDecimalHour(l.startTime);
        const end = getDecimalHour(l.endTime);
        const slotIdx = assignedSlots.get(l);

        result.push({
          ...l,
          topPercent: (start - 8) * hourScale,
          heightPercent: (end - start) * hourScale,
          widthPercent: slotWidthPercent,
          leftPercent: (dayBase + (slotIdx * slotWidthPercent))
        });
      });
    });
    return result;
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvas();
    this.render();
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    if (!container) return;

    let width = container.clientWidth;
    if (width > 1000) width = 1000;

    this.sidebarWidth = width < 500 ? 20 : 25;
    this.headerHeight = width < 500 ? 20 : 25;

    const height = width * (9 / 16);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * this.dpr;
    canvas.height = height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.dayWidth = (width - this.sidebarWidth) / 5;
    this.hourHeight = (height - this.headerHeight) / this.hours.length;
  }

  private render() {
    if (!this.ctx) return;
    const width = this.canvasRef.nativeElement.width / this.dpr;
    const height = this.canvasRef.nativeElement.height / this.dpr;
    this.ctx.clearRect(0, 0, width, height);
    this.drawGrid(width, height);
    this.drawLectures(width, height);
  }

  private drawGrid(width: number, height: number) {
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, width, this.headerHeight);
    this.ctx.fillRect(0, 0, this.sidebarWidth, height);

    this.ctx.beginPath();
    this.ctx.moveTo(0, this.headerHeight);
    this.ctx.lineTo(width, this.headerHeight);
    this.ctx.stroke();

    const dayFontSize = Math.max(8, Math.min(11, width / 70));
    for (let i = 0; i <= 5; i++) {
      const x = this.sidebarWidth + (i * this.dayWidth);
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      if (i < 5) {
        this.ctx.fillStyle = '#000';
        this.ctx.font = `bold ${dayFontSize}px sans-serif`;
        this.ctx.textAlign = 'center';
        const label = width < 700 ? this.dayLabelsShort[i] : this.dayLabelsFull[i];
        this.ctx.fillText(label, x + this.dayWidth / 2, this.headerHeight / 2 + 4);
      }
    }
    this.ctx.stroke();

    const hourFontSize = Math.max(7, Math.min(9, width / 100));
    this.hours.forEach((hour, i) => {
      const y = this.headerHeight + (i * this.hourHeight);
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.sidebarWidth, y);
      this.ctx.save();
      this.ctx.translate(this.sidebarWidth / 2, y + this.hourHeight / 2);
      this.ctx.rotate(-Math.PI / 2);
      this.ctx.font = `900 ${hourFontSize}px sans-serif`;
      this.ctx.fillText(`${hour}-${hour + 1}`, 0, 0);
      this.ctx.restore();
    });
    this.ctx.stroke();
    this.ctx.strokeRect(0, 0, width, height);
  }

  private drawLectures(width: number, height: number) {
    const availW = width - this.sidebarWidth;
    const availH = height - this.headerHeight;

    this.processedLectures.forEach(lec => {
      const x = this.sidebarWidth + (lec.leftPercent * availW / 100);
      const y = this.headerHeight + (lec.topPercent * availH / 100);
      const w = (lec.widthPercent * availW / 100);
      const h = (lec.heightPercent * availH / 100);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(x, y, w, h);
      this.ctx.strokeStyle = '#000';
      this.ctx.strokeRect(x, y, w, h);

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(x, y, w, h);
      this.ctx.clip();

      this.ctx.fillStyle = this.getTextColor(lec.type);
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      const isLecture = lec.type === 'Predavanje';
      const isMobile = width < 500;
      
      let teacherList = lec.teacher ? lec.teacher.split('/').map(t => t.trim()) : [];
      
      if (isMobile || h < 45 || w < 40) {
        teacherList = [];
      }
      
      let fontSize = Math.max(6, Math.min(isLecture ? 15 : 13, width / (isLecture ? 85 : 100)));
      let lines: string[] = [];
      const maxWidth = w - 4; 
      let fontValid = false;

      while (!fontValid && fontSize > 4) {
        this.ctx.font = `bold ${fontSize}px sans-serif`;
        fontValid = true;
        
        const words = lec.displayName.split(' ');
        for (const word of words) {
          if (this.ctx.measureText(word).width > maxWidth) {
            fontValid = false;
            fontSize -= 0.5;
            break;
          }
        }

        if (fontValid) {
          lines = this.getWrappedLines(lec.displayName, maxWidth);
          const totalLineCount = lines.length + 1 + (isLecture ? teacherList.length : 0);
          const totalHeight = totalLineCount * (fontSize + 1.5);
          
          if (totalHeight > h - 4) {
            fontValid = false;
            fontSize -= 0.5;
          }
        }
      }

      this.ctx.font = `bold ${fontSize}px sans-serif`;
      lines = this.getWrappedLines(lec.displayName, maxWidth);
      const lineHeight = fontSize + 1.5;
      
      const totalRows = lines.length + 1 + (isLecture ? teacherList.length : 0);
      const totalContentHeight = totalRows * lineHeight;
      
      let startY = y + (h - totalContentHeight) / 2 + (fontSize / 2);
      if (startY < y + fontSize) {
        startY = y + fontSize; 
      }
      
      let currentY = startY;

      lines.forEach(line => {
        this.ctx.fillText(line.trim(), x + w / 2, currentY);
        currentY += lineHeight;
      });

      this.ctx.font = `${isLecture ? fontSize - 0.5 : fontSize - 1}px sans-serif`;
      this.ctx.fillText(lec.location, x + w / 2, currentY);
      currentY += lineHeight;

      if (isLecture && teacherList.length > 0) {
        this.ctx.font = `${fontSize - 2}px sans-serif`;
        this.ctx.fillStyle = '#ff0000';
        teacherList.forEach(teacher => {
          this.ctx.fillText(teacher, x + w / 2, currentY);
          currentY += lineHeight;
        });
      }

      this.ctx.restore();
    });
  }

  private getWrappedLines(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = this.ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  private getTextColor(type: string) {
    if (type === 'Predavanje') return '#ff0000';
    if (type === 'LV') return '#1b5e20';
    if (type === 'AV') return '#2600ff';
    return '#000';
  }

  @HostListener('click', ['$event'])
  onCanvasClick(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const availW = rect.width - this.sidebarWidth;
    const availH = rect.height - this.headerHeight;

    const clicked = this.processedLectures.find(lec => {
      const lx = this.sidebarWidth + (lec.leftPercent * availW / 100);
      const ly = this.headerHeight + (lec.topPercent * availH / 100);
      const lw = (lec.widthPercent * availW / 100);
      const lh = (lec.heightPercent * availH / 100);
      return x >= lx && x <= lx + lw && y >= ly && y <= ly + lh;
    });
    if (clicked) this.lectureClicked.emit(clicked);
  }
}