import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'lib-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  username = '';
  password = '';
  readonly error = signal('');

  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  async submit(): Promise<void> {
    this.error.set('');
    try {
      if (!await this.auth.login(this.username, this.password)) {
        this.error.set('Incorrect username or password.');
        return;
      }

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const destination = returnUrl?.startsWith('/')
        && !returnUrl.startsWith('//')
        && returnUrl !== '/login'
        ? returnUrl
        : '/';

      void this.router.navigateByUrl(destination);
    } catch (error) {
      console.error('Unable to sign in.', error);
      this.error.set('Sign in is temporarily unavailable. Please try again.');
    }
  }
}
