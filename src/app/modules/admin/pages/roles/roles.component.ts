import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'roles', 
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
