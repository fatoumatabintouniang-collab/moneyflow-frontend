import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  login = { email: '', password: '' };
showPassword: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    this.http.post('http://localhost:8080/api/auth/login', this.login, { responseType: 'text' })
      .subscribe({
        next: (token: string) => {
          localStorage.setItem('token', token);
          Swal.fire({
            icon: 'success',
            title: 'Connexion réussie !',
            text: 'Bienvenue sur MoneyFlow 🎉',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/dashboard']); // redirige après fermeture du popup
          });
        },
        error: (err) => {
          console.error('Erreur connexion', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur connexion',
            text: 'Email ou mot de passe incorrect.',
            confirmButtonText: 'Réessayer'
          });
        }
      });
  }
}
