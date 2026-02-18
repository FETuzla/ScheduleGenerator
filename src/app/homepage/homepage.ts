import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ScheduleComponent } from "../schedule-component/schedule-component";
import { FIRST_SELECTORS, FirstSelector, Schedule, SecondSelector } from '../models/schedule.model';
import { SCHEDULES } from '../data/schedules.data';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleComponent],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
})
export class Homepage {
  selectedFirst: FirstSelector = "Prva godina";
  selectedSecond: SecondSelector = "Linija 1";

	firstSelectors = FIRST_SELECTORS;

  get secondSelectors(): SecondSelector[] {
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

  get secondPlaceholder(): string {
    if(this.selectedFirst === "Prva godina"){
      return 'Odaberi liniju';
    }
    return 'Odaberi smjer';
  }

	get schedule(): Schedule {
		return SCHEDULES.find(s =>
			s.firstSelector === this.selectedFirst &&
			(s.secondSelector ?? null) === (this.selectedSecond ?? null)
		)!!;
	}

}
