import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  register = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    idNumber: '',
    photoUrl: '',
    country: '',

    password: ''
  };
showPassword: boolean = false;

  isLoading = false;

  constructor(private http: HttpClient, private router: Router) {}

  onRegister() {
    // Basic validation
    if (!this.isFormValid()) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire incomplet',
        text: 'Veuillez remplir tous les champs obligatoires.',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.isLoading = true;

    // Generate username if empty
    if (!this.register.username) {
      this.register.username = this.generateUsername();
    }

    this.http.post('http://localhost:8080/api/auth/register', this.register)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Inscription réussie !',
            text: 'Votre compte a été créé avec succès 🎉',
            confirmButtonText: 'Se connecter'
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Erreur inscription', err);
          
          let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
          
          // Handle specific error cases
          if (err.status === 409) {
            errorMessage = 'Un compte avec cet email existe déjà.';
          } else if (err.status === 400) {
            errorMessage = 'Données invalides. Vérifiez vos informations.';
          }

          Swal.fire({
            icon: 'error',
            title: 'Échec de l\'inscription',
            text: errorMessage,
            confirmButtonText: 'OK'
          });
        }
      });
  }

  private isFormValid(): boolean {
    return !!(
      this.register.firstName &&
      this.register.lastName &&
      this.register.email &&
      this.register.password &&
      this.register.phone &&
      this.register.country
    );
  }

  private generateUsername(): string {
    const base = (this.register.firstName + this.register.lastName).toLowerCase();
    const random = Math.floor(Math.random() * 1000);
    return base + random;
  }

  onPhoneInput(event: any) {
    // Format phone number for Senegal
    let value = event.target.value.replace(/\D/g, '');
    if (value.startsWith('221')) {
      value = '+' + value;
    } else if (value.startsWith('7')) {
      value = '+221' + value;
    }
    this.register.phone = value;
  }
}