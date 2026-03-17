import { Directive, ElementRef, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appCapitalize]'
})
export class CapitalizeDirective {

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    // const capitalizedWords = value.split(' ').map(word => {
    //   return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); 
    // });
    // this.el.nativeElement.value = capitalizedWords.join(' ');
    if (value) {
        const words = value.split(' ');
        const capitalizedWords = words.map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });
        return capitalizedWords.join(' ');
      } else {
        return '';
      }
  }

}
