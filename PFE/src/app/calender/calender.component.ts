import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/angular'; // Import CalendarOptions

@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css']
})
export class CalenderComponent implements OnInit {
  public calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,timeGridDay,listWeek' // Include timeGridWeek and listWeek
    },
    events: [ // Add your events here
    { title: 'Event 1', start: '2024-05-15T10:00:00', end: '2024-05-15T12:00:00' },
    { title: 'Event 2', start: '2024-05-20T14:00:00', end: '2024-05-20T16:00:00' },
      // Add more events as needed
    ]
  };
  
  constructor() { }

  ngOnInit(): void {
  }

}
