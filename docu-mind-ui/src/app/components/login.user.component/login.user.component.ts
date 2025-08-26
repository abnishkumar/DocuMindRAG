import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login.user.component',
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './login.user.component.html',
  styleUrl: './login.user.component.css'
})
export class LoginUserComponent {
  private cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  loginForm: FormGroup;

  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loading) return;

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.cd.detectChanges();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Login failed. Please try again.';
        this.cd.detectChanges();
      }
    });
  }
}
