import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], filterdata: string): any[] {
    if (!items) return [];
    if (!filterdata) return items;
    filterdata = filterdata.toString().toLowerCase();
    return items.filter((it) => {
      return (
        it.first_name.toLowerCase().includes(filterdata) ||
        it.last_name.toLowerCase().includes(filterdata) ||
        it.email_address.toLowerCase().includes(filterdata)
      );
    });
  }
}
