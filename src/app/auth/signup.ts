import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class Signup {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nickname: ['', [Validators.required, Validators.minLength(2)]]
  });

  error = '';
  selectedAvatar?: File | null = null;
  selectedSound?: File | null = null;
  loading = false;
  avatarPreview?: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  async submit() {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, nickname } = this.form.value;
    try {
      this.loading = true;
      const nickArg: string | undefined = (nickname ?? undefined) as string | undefined;
      const avatarArg = this.selectedAvatar ?? undefined;
      const soundArg = this.selectedSound ?? undefined;
      const playerId = await this.auth.register(email!, password!, nickArg, avatarArg, soundArg);
      await this.router.navigate(['/players', playerId]);
    } catch (err: any) {
      this.error = err?.message || 'Registration failed';
    }
    finally {
      this.loading = false;
    }
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      // revoke previous preview URL
      if (this.avatarPreview) {
        URL.revokeObjectURL(this.avatarPreview);
        this.avatarPreview = null;
      }
      this.selectedAvatar = input.files[0];
      try {
        this.avatarPreview = URL.createObjectURL(this.selectedAvatar);
      } catch (e) {
        this.avatarPreview = null;
      }
    }
  }

  onSoundSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedSound = input.files[0];
    }
  }

  ngOnDestroy(): void {
    if (this.avatarPreview) {
      URL.revokeObjectURL(this.avatarPreview);
      this.avatarPreview = null;
    }
  }
}
