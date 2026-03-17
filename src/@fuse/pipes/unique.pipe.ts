import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'unique'
  })
  export class uniquePipe implements PipeTransform {

  transform(value: any, args?: any): any {

    // Remove the duplicate elements (this will remove duplicates
    let uniqueArray = value.filter(function (el, index, array) { 
      return array.indexOf (el) == index;
    });

  return uniqueArray;   } 
}