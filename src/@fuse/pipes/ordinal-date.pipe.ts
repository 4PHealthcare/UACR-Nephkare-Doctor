import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordinalDate'
})
export class OrdinalDatePipe implements PipeTransform {
  transform(value: Date): string {
    if (!value) {
      return '';
    }
   let months= ["January","February","March","April","May","June","July",
           "August","September","October","November","December"]
    return `${ new Date(value).getDate()}${this.nth(new Date(value).getDate())}, ${months[new Date(value).getMonth()]}, ${new Date(value).getFullYear()}`;
  }

 nth(d) {
  if (d > 3 && d < 21) return 'th'; 
  switch (d % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}
}