import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private data = new Subject<any>();
  
  private calendarData = new Subject<any>();

  setData(data: any) {
    this.data.next(data);
  }

  getData() {
    return this.data.asObservable();
  }
  setPatientName(data: string) {
    this.data.next(data);
  }

  getPatientName() {
    return this.data.asObservable();
  }

  getCalendarData() {
    return this.calendarData.asObservable();
  }
  setCalendarData(data: any) {
    this.calendarData.next(data);
  }



}