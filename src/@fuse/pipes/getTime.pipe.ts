import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'getTime'
})
export class GetTimePipe implements PipeTransform {

  transform(val: any, args?: any): any {

    let days:number = 0;
    let data:string;

    var startDate = moment(new Date());
    var endDate = moment(new Date(val));
  
    
    days = endDate.diff(startDate, 'days');

    if(days == 0) {
      data = endDate.format('hh:mm a');
    }else {
      data = endDate.format('DD MMM');
    }

    return data;
    }
}