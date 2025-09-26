import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccountService {

  private baseUrl = 'http://localhost:8080/api/accounts';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  getTransactions(accountId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${accountId}/transactions`, this.getAuthHeaders());
  }

  deposit(userId: number, amount: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/user/${userId}/deposit?amount=${amount}`, null, this.getAuthHeaders());
  }

  withdraw(userId: number, amount: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/user/${userId}/withdraw?amount=${amount}`, null, this.getAuthHeaders());
  }

  transfer(senderId: number, receiverId: number, amount: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/transfer?senderId=${senderId}&receiverId=${receiverId}&amount=${amount}`, null, this.getAuthHeaders());
  }
}
