import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GetTimePipe } from '@fuse/pipes/getTime.pipe';
import { SortBydatePipe } from '@fuse/pipes/sort-bydate.pipe';
import { uniquePipe } from '@fuse/pipes/unique.pipe';
import { IsActivePipe } from '@fuse/pipes/is-active.pipe';
import { NotificationTimePipe } from '@fuse/pipes/notification-time.pipe';
import { OrdinalDatePipe } from '@fuse/pipes/ordinal-date.pipe';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule 
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        GetTimePipe,
        SortBydatePipe,
        uniquePipe,
        NotificationTimePipe,
        IsActivePipe,
        OrdinalDatePipe
    ],
    declarations: [
        GetTimePipe,
        SortBydatePipe,
        uniquePipe,
        NotificationTimePipe,
        IsActivePipe,
        OrdinalDatePipe
    ]
})
export class SharedModule
{
}
