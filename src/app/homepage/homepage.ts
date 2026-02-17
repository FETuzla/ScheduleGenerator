import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ScheduleComponent } from "../schedule-component/schedule-component";

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleComponent],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
})
export class Homepage {
  selectedFirst: string | null = null;
  selectedSecond: string | null = null;

  years = ["Prva godina", "Druga godina", "Treca godina", "Cetvrta godina", "BMI"];

  get smjerOptions(): string[]{
    if(this.selectedFirst == "Prva godina"){
      return ['Linija 1', 'Linija 2'];
    }
    if(this.selectedFirst == "BMI"){
      return [];
    }
    if(this.selectedFirst){
      return ['AR','RI','ESKE','EEMS','TK']
    }
    return [];
  }

  get secondPlaceholder(): string{
    if(this.selectedFirst === "Prva godina"){
      return 'Odaberi liniju';
    }
    return 'Odaberi smjer';
  }
}
