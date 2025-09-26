import { Component } from '@angular/core';
import { AccountService } from '../../../core/services/account.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transaction-list',
  imports: [CommonModule,FormsModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss'
})
export class TransactionListComponent {

  accountId = 1; // exemple
  userId = 1; // exemple
  transactions: any[] = [];
  depositAmount: number = 0;
  withdrawAmount: number = 0;
  transferAmount: number = 0;
  receiverId: number = 0;

  constructor(private accountService: AccountService) {
    this.loadTransactions();
  }

  loadTransactions() {
    this.accountService.getTransactions(this.accountId).subscribe({
      next: (res) => { this.transactions = res; },
      error: (err) => { console.error(err); alert('Erreur chargement transactions'); }
    });
  }

  deposit() {
    this.accountService.deposit(this.userId, this.depositAmount).subscribe({
      next: () => { alert('Dépôt réussi'); this.loadTransactions(); },
      error: (err) => { console.error(err); alert('Erreur dépôt'); }
    });
  }

  withdraw() {
    this.accountService.withdraw(this.userId, this.withdrawAmount).subscribe({
      next: () => { alert('Retrait réussi'); this.loadTransactions(); },
      error: (err) => { console.error(err); alert('Erreur retrait'); }
    });
  }

  transfer() {
    this.accountService.transfer(this.userId, this.receiverId, this.transferAmount).subscribe({
      next: () => { alert('Transfert réussi'); this.loadTransactions(); },
      error: (err) => { console.error(err); alert('Erreur transfert'); }
    });
  }
}
