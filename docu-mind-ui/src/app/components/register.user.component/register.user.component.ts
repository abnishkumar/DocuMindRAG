import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.model';


@Component({
  selector: 'app-register-user',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.user.component.html',
  styleUrls: ['./register.user.component.css'] // ✅ Corrected from styleUrl
})
export class RegisterUserComponent {
  userForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.userForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        phoneNumber: ['', [Validators.required, Validators.minLength(10)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        roleId: [5]
      },
      {
        validators: this.passwordsMatchValidator
      }
    );
  }

  // Custom validator for password match
  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSubmit(): void {
    // console.log(this.userForm.value);
    if (this.loading || this.userForm.invalid) return;

    this.loading = true;
    this.error = '';
    const formData = this.userForm.value;
    let registerRequest: RegisterRequest = {
      email: formData.email,
      phone: formData.phoneNumber,
      password: formData.password,
      full_name: formData.fullName,
      role_id: formData.roleId
    }
    console.log(registerRequest);
    this.authService.register(registerRequest).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.loading = false;
        this.error = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
