import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule,RouterModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  showRegister = false;
  showLogin = false;

  // Objets liés aux formulaires
  register = { firstName: '', lastName: '', email: '', password: '', country: '' };
  login = { email: '', password: '' };

  constructor(private http: HttpClient) {}

  // Inscription
  onRegister() {
    const body = {
      firstName: this.register.firstName,
      lastName: this.register.lastName,
      email: this.register.email,
      password: this.register.password,
      country: this.register.country
    };

    this.http.post('http://localhost:8080/api/auth/register', body)
      .subscribe({
        next: (res) => {
          console.log('✅ Inscription réussie', res);
          alert('Inscription réussie !');
          this.showRegister = false;
          this.showLogin = true; // on affiche login après inscription
        },
        error: (err) => {
          console.error('❌ Erreur inscription', err);
          alert('Erreur inscription');
        }
      });
  }

  // Connexion
  onLogin() {
    const body = {
      email: this.login.email,
      password: this.login.password
    };

 this.http.post('http://localhost:8080/api/auth/login', body, { responseType: 'text' })
  .subscribe({
    next: (token: string) => {
      console.log('✅ Connexion réussie, token =', token);
      alert('Connexion réussie !');
      localStorage.setItem('token', token); // on garde le JWT
    },
    error: (err) => {
      console.error('❌ Erreur connexion', err);
      alert('Erreur connexion');
    }
  });
}
}
