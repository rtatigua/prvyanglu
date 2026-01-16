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
  selectedAvatar = '⚔️';
  loading = false;
  avatarOptions: string[] = ['🤺', '🌿', '💎', '🐉', '⚔️', '🎯', '👑', '🧙', '🏹', '⚡'];

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
      const playerId = await this.auth.register(email!, password!, nickArg, this.selectedAvatar);
      await this.router.navigate(['/players', playerId]);
    } catch (err: any) {
      this.error = err?.message || 'Registration failed';
    }
    finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {}
}
