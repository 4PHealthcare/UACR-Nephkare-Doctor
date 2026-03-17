import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: "searchOffersPipe",
})
export class SearchOffersPipePipe implements PipeTransform {
  transform(items: any[], filterdata: string): any[] {
    if (!items) return [];
    if (!filterdata) return items;
    filterdata = filterdata.toString().toLowerCase();
    return items.filter((it) => {
      return (
        it.promocode_group.toLowerCase().includes(filterdata) ||
        it.list.find(data => data?.promocode.toLowerCase().includes(filterdata))
        )
    });
  }
}
