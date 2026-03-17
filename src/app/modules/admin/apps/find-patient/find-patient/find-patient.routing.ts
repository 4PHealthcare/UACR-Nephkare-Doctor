import { Route } from '@angular/router';
import { BookAppointmentComponent } from '../book-appointment/book-appointment.component';
import { FindPatientComponent } from './find-patient.component';

export const findPatientRoutes: Route[] = [
    {
        path     : '',
        component: BookAppointmentComponent
    },
    {
        path     : 'find-patient/:id',
        component: FindPatientComponent

    }
];
