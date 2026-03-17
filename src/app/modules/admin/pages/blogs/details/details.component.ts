import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Blog } from '../blogs.types';

@Component({
    selector       : 'blogs-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogsDetailsComponent implements OnInit, OnDestroy
{

    blog:Blog = {
        title    : 'Find a new company name',
        content  : 'Stephanie\'s birthday is coming and I need to pick a present for her.',
        tasks    : null,
        image    : '',
        archived : false,
        category:'HealthCare'
    }
   
    /**
     * Constructor
     */
    constructor(
     
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
     ngOnInit(): void
     {
        
     }
 
     /**
      * On destroy
      */
     ngOnDestroy(): void
     {
         
     }
 
     
 }
