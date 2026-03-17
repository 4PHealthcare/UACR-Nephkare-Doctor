import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class CustomSnackbarService {
    verticalPosition: MatSnackBarVerticalPosition = 'top';
    constructor(
      private snackBar: MatSnackBar,
      private zone: NgZone
    ) {
       
    }

    public open(message: string, action = 'success', duration = 4000): void {
        this.zone.run(() => {
          this.snackBar.open(message, action, { duration, verticalPosition:'top' });
        });
    }
}
