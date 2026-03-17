import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.scss']
})
export class BookAppointmentComponent implements OnInit {

  constructor(private router: Router, private activeRoute: ActivatedRoute) { }

  ngOnInit(): void {
    console.log('params', this.activeRoute.snapshot.paramMap.get('id'));
  }

  bookApt() {
    let id = 1264
    this.router.navigate(['/book-apt/find-patient', id ]);
  }

}
