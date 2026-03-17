
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'notificationTime'
})

export class NotificationTimePipe implements PipeTransform {

 
  transform(val: any, args?: any): any {

    const startMoment = moment(val);
    const endMoment = moment();

    const duration = moment.duration(endMoment.diff(startMoment));


    let diffDays = startMoment.diff(endMoment, 'days');


    if(diffDays == 0) {
      return startMoment.format('hh:mm a');
    }else {
      if (duration.asYears() >= 1) {
        return duration.asYears().toFixed() == '1' ? '1 year ago' : duration.asYears().toFixed() + ' years ago';  
      } else if(duration.asMonths() >= 1) {
        return duration.asMonths().toFixed() == '1' ? '1 month ago' : duration.asYears().toFixed() + ' months ago';  
      } else if(duration.asWeeks() >= 1) {
        return duration.asWeeks().toFixed() == '1' ? '1 week ago' : duration.asWeeks().toFixed() + ' weeks ago';  
      } else if(duration.asDays() >= 1) {
        return duration.asDays().toFixed() == '1' ? '1 day ago' : duration.asDays().toFixed() + ' days ago';  
      }
    }

  }

    
}