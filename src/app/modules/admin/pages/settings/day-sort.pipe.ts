import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "daySort"
})
export class ArraySortPipe  implements PipeTransform {
  transform(array: any, field: string): any[] {
    if (!Array.isArray(array)) {
      return;
    }
    let order = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun:7 };

    array.sort(function (a, b) {
        return order[a.trim()] - order[b.trim()];
    });

   
    return array;
  }
}
