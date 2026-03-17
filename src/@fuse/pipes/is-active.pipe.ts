import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'isActivePipe',
  pure: false
})
export class IsActivePipe implements PipeTransform {
  transform(items: any[]): any {
      if (!items) {
          return items;
      }
      // filter items array, items which match and return true will be
      // kept, false will be filtered out
      return items.filter(item => item.is_active || item.isactive);
  }
}
