import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  transactions: any[] = [];
  filteredTransactions: any[] = [];
  accountBalance: number = 0;
  username: string = '';
  accountId: number = 0;
  lastLogin: Date = new Date();
  currentTime: Date = new Date();

  selectedTypeFilter: string = '';
  selectedDateFilter: string = '';

  // Nouveau booléen pour gérer l'affichage du solde
  showBalance: boolean = true;

  // Propriétés profil
  userProfile: any = {};
  subscription: any = {
    type: 'Standard',
    discount: 0,
    expiry: 'N/A'
  };

  activeSection: string = 'dashboard'; // Par défaut

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.updateCurrentTime();
    this.setLastLogin();
    this.loadUserInfo();
    this.loadUserProfile();
    
    // Mettre à jour l'heure toutes les minutes
    setInterval(() => {
      this.updateCurrentTime();
    }, 60000);
  }

  private updateCurrentTime() {
    this.currentTime = new Date();
  }

  private setLastLogin() {
    const storedLastLogin = localStorage.getItem('lastLogin');
    if (storedLastLogin) {
      this.lastLogin = new Date(storedLastLogin);
    }
    localStorage.setItem('lastLogin', new Date().toISOString());
  }

  getGreetingMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    else if (hour < 18) return 'Bon après-midi';
    else return 'Bonsoir';
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || '';
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  /** Méthode alternative pour récupérer l'accountId */
  private getUserAccountId() {
    this.http.get<any>(`http://localhost:8080/api/accounts/user`, this.getHeaders())
      .subscribe({
        next: res => {
          console.log('Données utilisateur /user:', res);
          this.accountId = res.id || res.accountId;
          if (this.accountId) {
            this.loadTransactions();
          } else {
            console.error('Aucun ID de compte trouvé');
          }
        },
        error: err => {
          console.error('Erreur récupération accountId:', err);
          this.tryAlternativeAccountId();
        }
      });
  }

  toggleBalance() {
    this.showBalance = !this.showBalance;
  }

  /** Dernière tentative pour obtenir l'accountId */
  private tryAlternativeAccountId() {
    const storedAccountId = localStorage.getItem('accountId');
    if (storedAccountId) {
      this.accountId = Number(storedAccountId);
      this.loadTransactions();
    } else {
      console.warn('Impossible de récupérer l\'ID de compte');
      this.tryFindAccountId();
    }
  }

  /** Méthode pour essayer de trouver l'accountId (développement uniquement) */
  private tryFindAccountId() {
    const possibleIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const tryNextId = (index: number) => {
      if (index >= possibleIds.length) {
        console.error('Aucun ID de compte valide trouvé');
        return;
      }
      
      const testId = possibleIds[index];
      this.http.get<any>(`http://localhost:8080/api/accounts/${testId}/transactions`, this.getHeaders())
        .subscribe({
          next: res => {
            console.log(`ID ${testId} trouvé avec ${res.length} transactions`);
            this.accountId = testId;
            this.transactions = res;
            this.applyFilters();
            localStorage.setItem('accountId', testId.toString());
          },
          error: () => {
            tryNextId(index + 1);
          }
        });
    };
    
    tryNextId(0);
  }

  /** Charger le solde et l'accountId (méthode de fallback) */
  loadAccountBalance() {
    this.http.get<any>(`http://localhost:8080/api/accounts/user`, this.getHeaders())
      .subscribe({
        next: res => {
          console.log('Données utilisateur:', res);
          this.accountBalance = res.balance;
          this.username = res.username || 'Utilisateur';
          this.accountId = res.id;
          this.loadTransactions();
        },
        error: err => {
          console.error('Erreur chargement solde:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de récupérer le solde',
            confirmButtonColor: '#dc3545'
          });
        }
      });
  }

  /** Charger les transactions */
  loadTransactions() {
    console.log('Chargement transactions depuis /me/transactions');

    this.http.get<any>(`http://localhost:8080/api/accounts/me/transactions`, this.getHeaders())
      .subscribe({
        next: res => {
          console.log('Transactions reçues:', res);
          this.transactions = Array.isArray(res) ? res : [];
          this.applyFilters();
        },
        error: err => {
          console.error('Erreur chargement transactions:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de récupérer les transactions',
            confirmButtonColor: '#dc3545'
          });
        }
      });
  }

  /** Récupérer infos utilisateur (simplifié) */
  loadUserInfo() {
    this.http.get<any>(`http://localhost:8080/api/accounts/me`, this.getHeaders())
      .subscribe({
        next: res => {
          console.log('Données utilisateur /me:', res);
          this.accountBalance = res.balance;
          this.username = res.username || res.firstName || 'Utilisateur';
          this.loadTransactions();
        },
        error: err => {
          console.error('Erreur chargement /me:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de récupérer vos informations',
            confirmButtonColor: '#dc3545'
          });
        }
      });
  }

  /** Charger profil utilisateur */
  loadUserProfile() {
    this.http.get<any>('http://localhost:8080/api/accounts/me/profile', this.getHeaders())
      .subscribe({
        next: res => {
          console.log('Profil utilisateur:', res);

          this.username = `${res.firstName} ${res.lastName}`;
          this.accountBalance = res.balance || 0;

          this.userProfile = {
            name: `${res.firstName} ${res.lastName}`,
            email: res.email,
            phone: res.phone,
            address: res.address || 'Non défini',
            accountNumber: res.accountId || 'N/A',
            balance: res.balance || 0
          };

          this.subscription = {
            type: res.subscription?.type || 'Standard',
            discount: res.subscription?.discount || 10,
            expiry: res.subscription?.expiry || '31 Décembre 2025'
          };

          this.loadTransactions();
        },
        error: err => {
          console.error('Erreur récupération profil:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de récupérer le profil',
            confirmButtonColor: '#dc3545'
          });
        }
      });
  }

  /** Dépôt */
  deposit() {
    Swal.fire({
      title: 'Montant du dépôt',
      input: 'number',
      inputPlaceholder: 'Entrez le montant à déposer',
      showCancelButton: true,
      confirmButtonText: 'Déposer',
      cancelButtonText: 'Annuler',
      inputValidator: (value) => {
        if (!value || Number(value) <= 0) return 'Veuillez entrer un montant valide !';
        return null;
      }
    }).then(result => {
      const amount = Number(result.value);
      if (result.isConfirmed && amount > 0) {
        this.http.post<any>(
          `http://localhost:8080/api/accounts/deposit?amount=${amount}`,
          {},
          this.getHeaders()
        ).subscribe({
          next: res => {
            this.accountBalance = res.balance;
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: `Dépôt de ${amount} F CFA effectué !`,
              confirmButtonColor: '#28a745'
            });
            this.loadTransactions();
          },
          error: err => {
            console.error('Erreur dépôt:', err);
            Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de déposer', confirmButtonColor: '#dc3545' });
          }
        });
      }
    });
  }

  /** Retrait */
  withdraw() {
    Swal.fire({
      title: 'Montant du retrait',
      input: 'number',
      inputPlaceholder: 'Entrez le montant à retirer',
      showCancelButton: true,
      confirmButtonText: 'Retirer',
      cancelButtonText: 'Annuler',
      inputValidator: (value) => {
        if (!value || Number(value) <= 0) return 'Veuillez entrer un montant valide !';
        if (Number(value) > this.accountBalance) return `Solde insuffisant ! Solde actuel: ${this.accountBalance} F CFA`;
        return null;
      }
    }).then(result => {
      const amount = Number(result.value);
      if (result.isConfirmed && amount > 0) {
        this.http.post<any>(
          `http://localhost:8080/api/accounts/withdraw?amount=${amount}`,
          {},
          this.getHeaders()
        ).subscribe({
          next: res => {
            this.accountBalance = res.balance;
            Swal.fire({ icon: 'success', title: 'Succès', text: `Retrait de ${amount} F CFA effectué !`, confirmButtonColor: '#28a745' });
            this.loadTransactions();
          },
          error: err => {
            console.error('Erreur retrait:', err);
            Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de retirer', confirmButtonColor: '#dc3545' });
          }
        });
      }
    });
  }

  /** Transfert par téléphone */
  transfer() {
    Swal.fire({
      title: 'Nouveau Transfert',
      html:
        `<input type="text" id="receiverPhone" class="swal2-input" placeholder="Téléphone destinataire (ex: +221...)">` +
        `<input type="number" id="transferAmount" class="swal2-input" placeholder="Montant" min="1">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Transférer',
      cancelButtonText: 'Annuler',
      preConfirm: () => {
        const receiverPhoneInput = document.getElementById('receiverPhone') as HTMLInputElement;
        const transferAmountInput = document.getElementById('transferAmount') as HTMLInputElement;
        
        const receiverPhone = receiverPhoneInput.value.trim();
        const amount = Number(transferAmountInput.value);
        
        if (!receiverPhone) return Swal.showValidationMessage('Téléphone destinataire invalide');
        if (!amount || amount <= 0) return Swal.showValidationMessage('Montant invalide');
        if (amount > this.accountBalance) return Swal.showValidationMessage(`Solde insuffisant ! Solde actuel: ${this.accountBalance} F CFA`);
        
        return { receiverPhone, amount };
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const { receiverPhone, amount } = result.value;
        this.executeTransfer(receiverPhone, amount);
      }
    });
  }

  /** Exécuter le transfert */
  private executeTransfer(receiverPhone: string, amount: number) {
    this.http.post(
      `http://localhost:8080/api/accounts/transfer?receiverPhone=${encodeURIComponent(receiverPhone)}&amount=${amount}`,
      {},
      { ...this.getHeaders(), responseType: 'text' as 'json' }
    ).subscribe({
      next: (response) => {
        Swal.fire({ icon: 'success', title: 'Transfert réussi !', text: `Transfert de ${amount} F CFA vers ${receiverPhone} effectué !`, confirmButtonColor: '#28a745' });
        this.loadTransactions();
        this.loadUserInfo();
      },
      error: (err) => {
        console.error('Erreur transfert:', err);
        let errorMessage = 'Impossible de transférer';
        if (err.status === 404) errorMessage = 'Compte destinataire introuvable';
        else if (err.status === 400) errorMessage = 'Données invalides ou solde insuffisant';
        else if (err.error && typeof err.error === 'string') errorMessage = err.error;

        Swal.fire({ icon: 'error', title: 'Erreur de transfert', text: errorMessage, confirmButtonColor: '#dc3545' });
      }
    });
  }

  /** Traduction des types de transaction */
  private getTransactionTypeInFrench(type: string): string {
    switch(type) {
      case 'DEPOSIT': return 'Dépôt';
      case 'WITHDRAW': return 'Retrait';
      case 'TRANSFER': return 'Transfert';
      default: return type;
    }
  }

  /** Télécharger un reçu PDF */
  downloadReceipt(transaction: any) {
    const doc = new jsPDF();

    // Logo ou titre
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Reçu de Transaction", 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Date d'émission : ${new Date().toLocaleString('fr-FR')}`, 20, 30);

    // Détails transaction
    let y = 50;
    doc.setFontSize(13);
    doc.text("Détails de la transaction", 20, y);

    doc.setFontSize(11);
    doc.text(`ID Transaction : ${transaction.id || "N/A"}`, 20, y + 15);
    doc.text(`Type : ${this.getTransactionTypeInFrench(transaction.type)}`, 20, y + 25);
    doc.text(`Montant : ${transaction.amount.toLocaleString()} F CFA`, 20, y + 35);
    
    // Formatage de la date de transaction
    const transactionDate = transaction.transactionDate || transaction.createdAt;
    let formattedDate = 'N/A';
    if (transactionDate) {
      try {
        // Si c'est au format "25-09-2025 21:07" ou similaire
        if (typeof transactionDate === 'string') {
          formattedDate = transactionDate;
        } else {
          formattedDate = new Date(transactionDate).toLocaleString('fr-FR');
        }
      } catch (error) {
        formattedDate = transactionDate.toString();
      }
    }
    doc.text(`Date de transaction : ${formattedDate}`, 20, y + 45);
    doc.text(`Statut : ${transaction.status === 'SUCCESS' ? 'Réussie' : (transaction.status || 'Réussie')}`, 20, y + 55);

    // Informations additionnelles selon le type
    if (transaction.type === 'TRANSFER') {
      if (transaction.senderName) {
        doc.text(`Expéditeur : ${transaction.senderName}`, 20, y + 65);
      }
      if (transaction.receiverName && transaction.receiverName !== 'Inconnu') {
        doc.text(`Destinataire : ${transaction.receiverName}`, 20, y + 75);
      }
    }

    // Signature ou note
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("Merci d'utiliser notre service MoneyFlow.", 20, y + 95);
    doc.text("Ce reçu fait foi de la transaction effectuée.", 20, y + 105);

    // Nom du fichier : reçu-ID-date.pdf
    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`recu_${transaction.id || "transaction"}_${dateStr}.pdf`);
  }

  /** Exporter toutes les données utilisateur */
  exportData() {
    const doc = new jsPDF();

    // Titre principal
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Exportation de mes données", 20, 20);

    // Date d'export
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Date d'export : ${new Date().toLocaleString('fr-FR')}`, 20, 30);

    // Section Profil
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Mon Profil", 20, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    let y = 55;
    doc.text(`Nom : ${this.userProfile.name}`, 20, y);
    doc.text(`Email : ${this.userProfile.email}`, 20, y + 10);
    doc.text(`Téléphone : ${this.userProfile.phone}`, 20, y + 20);
    doc.text(`Adresse : ${this.userProfile.address}`, 20, y + 30);
    doc.text(`Numéro de compte : ${this.userProfile.accountNumber}`, 20, y + 40);
    doc.text(`Solde actuel : ${this.userProfile.balance.toLocaleString()} F CFA`, 20, y + 50);

    // Section Abonnement
    y += 70;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Mon Abonnement", 20, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Type : ${this.subscription.type}`, 20, y + 10);
    doc.text(`Réduction des frais : ${this.subscription.discount}%`, 20, y + 20);
    doc.text(`Expiration : ${this.subscription.expiry}`, 20, y + 30);

    // Sauvegarde du fichier
    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`mes_donnees_${dateStr}.pdf`);
  }

  /** Appliquer les filtres */
  applyFilters() {
    this.filteredTransactions = this.transactions.filter(t => {
      if (this.selectedTypeFilter && t.type !== this.selectedTypeFilter) return false;
      if (this.selectedDateFilter) {
        const date = new Date(t.transactionDate || t.createdAt);
        const now = new Date();
        if (this.selectedDateFilter === 'thisMonth' && (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear())) return false;
        if (this.selectedDateFilter === 'lastMonth') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          if (date.getMonth() !== lastMonth.getMonth() || date.getFullYear() !== lastMonth.getFullYear()) return false;
        }
      }
      return true;
    });
  }

  /** Transactions récentes */
  getRecentTransactions() {
    return this.transactions.slice(0, 5);
  }

  /** Vérifier si c'est reçu */
  isReceivedTransaction(t: any): boolean {
    return t.receiverId === this.accountId || t.type === 'DEPOSIT';
  }

  /** Titre transaction */
  getTransactionTitle(t: any): string {
    if (t.type === 'DEPOSIT') return 'Dépôt sur le compte';
    if (t.type === 'WITHDRAW') return 'Retrait d\'espèces';
    if (t.type === 'TRANSFER') {
      return this.isReceivedTransaction(t)
        ? `Transfert reçu de ${t.senderName || 'Inconnu'}`
        : `Transfert envoyé à ${t.receiverName || 'Inconnu'}`;
    }
    return 'Transaction';
  }

  /** Formater la date pour l'affichage */
  formatTransactionDate(transaction: any): string {
    const date = transaction.transactionDate || transaction.createdAt;
    if (!date) return 'Date inconnue';
    
    try {
      if (typeof date === 'string') {
        // Si c'est au format "25-09-2025 21:07"
        return date;
      } else {
        return new Date(date).toLocaleString('fr-FR');
      }
    } catch (error) {
      return date.toString();
    }
  }

  /** Montant envoyé ce mois */
  getSentThisMonth(): number {
    const now = new Date();
    return this.transactions
      .filter(t => !this.isReceivedTransaction(t) && new Date(t.transactionDate || t.createdAt).getMonth() === now.getMonth())
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /** Montant reçu ce mois */
  getReceivedThisMonth(): number {
    const now = new Date();
    return this.transactions
      .filter(t => this.isReceivedTransaction(t) && new Date(t.transactionDate || t.createdAt).getMonth() === now.getMonth())
      .reduce((sum, t) => sum + t.amount, 0);
  }

  /** Navigation entre sections */
  showSection(section: string) {
    this.activeSection = section;
  }

  /** Méthode pour passer en Premium */
  upgradeSubscription() {
    Swal.fire({
      title: 'Passer en Premium',
      text: 'Voulez-vous passer en abonnement Premium ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d'
    }).then(result => {
      if (result.isConfirmed) {
        // Appel API pour upgrade (si existant)
        this.subscription.type = 'Premium';
        this.subscription.discount = 20;
        this.subscription.expiry = '31 Décembre 2026';
        Swal.fire({ icon: 'success', title: 'Félicitations !', text: 'Vous êtes maintenant Premium', confirmButtonColor: '#28a745' });
      }
    });
  }

  /** Navigation vers la page transactions */
  goToTransactionsPage() {
    this.router.navigate(['/transactions']);
  }

  /** Méthode pour ouvrir les modals profil */
  showModal(modalId: string) {
    console.log('Ouvrir modal:', modalId);
  }

  /** Déconnexion */
  logout() {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Voulez-vous vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('accountId');
        localStorage.removeItem('lastLogin');
        Swal.fire({ icon: 'success', title: 'Déconnecté', text: 'Vous avez été déconnecté', timer: 1500, showConfirmButton: false })
          .then(() => this.router.navigate(['/login']));
      }
    });
  }
}