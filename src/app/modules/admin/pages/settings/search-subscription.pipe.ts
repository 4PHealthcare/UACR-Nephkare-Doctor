import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchSubscription',
})
export class SearchSubscriptionPipe implements PipeTransform {
  transform(items: any[], filterdata: string): any[] {
    if (!items) return [];
    if (!filterdata) return items;
    filterdata = filterdata.toString().toLowerCase();
    return items.filter((it) => {
      return it.planname.toLowerCase().includes(filterdata);
    });
  }
}
