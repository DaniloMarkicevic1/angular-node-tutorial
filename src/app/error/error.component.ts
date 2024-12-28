import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogClose,
  MatDialogContainer,
} from '@angular/material/dialog';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogClose,
    MatDialogContainer,
    MatButtonModule,
  ],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css',
})
export class ErrorComponent {
  private errorService = inject(MAT_DIALOG_DATA);
  message = this.errorService.message;

  onClick() {
    console.log(this.errorService);
    console.log(this.message);
  }
}
