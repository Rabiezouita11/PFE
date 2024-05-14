import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css']
})
export class CalenderComponent implements OnInit {

  public minDate: Date = new Date ("05/07/2017");

  public maxDate: Date = new Date ("08/27/2017");

  public value: Date = new Date ("05/16/2017");
  constructor() { }

  ngOnInit(): void {
  }

}
