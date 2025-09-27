# MoneyFlow - Rapport de Projet

## 1. Introduction

**MoneyFlow** est une application web de gestion de finances personnelles qui permet aux utilisateurs de gérer leur compte, effectuer des transactions, consulter l’historique et générer des reçus PDF. L'application vise à offrir une interface intuitive, sécurisée et responsive pour une gestion efficace des finances au quotidien.

---

## 2. Objectifs du projet

- Créer et gérer un compte utilisateur sécurisé.
- Connexion et inscription avec validation des informations.
- Gestion des transactions : dépôts, retraits, transferts.
- Tableau de bord interactif avec solde, statistiques et historique.
- Génération de reçus PDF et export de données.
- Interface utilisateur fluide avec notifications et alertes.

---

## 3. Architecture du projet

### 3.1 Frontend

- **Technologies** : Angular 17, TypeScript, HTML, CSS/SCSS, Bootstrap, SweetAlert2, jsPDF.  
- **Modules clés** :
  - `LoginComponent` : connexion utilisateur.
  - `RegisterComponent` : inscription et validation.
  - `DashboardComponent` : tableau de bord, transactions, historique et profil.
- **Fonctionnalités UI** :
  - Affichage dynamique du solde et statistiques.
  - Filtrage des transactions.
  - Toggle mot de passe et solde.
  - Notifications et alertes via SweetAlert2.

### 3.2 Backend

- **Endpoints principaux** :  
  - `POST /api/auth/login`  
  - `POST /api/auth/register`  
  - `GET /api/accounts/me`  
  - `GET /api/accounts/me/transactions`  
  - `POST /api/accounts/deposit`  
  - `POST /api/accounts/withdraw`  
  - `POST /api/accounts/transfer`  
- **Sécurité** : JWT pour l’authentification, validation côté serveur et client.

---

## 4. Fonctionnalités détaillées

### 4.1 Gestion utilisateur
- Inscription et connexion sécurisées.
- Profil utilisateur avec affichage du solde et abonnement.

### 4.2 Transactions
- Dépôts, retraits et transferts avec validation.
- Historique avec filtres par type et période.

### 4.3 Tableau de bord
- Affichage du solde et statistiques.
- Actions rapides : dépôt, retrait, transfert.

### 4.4 Génération de PDF
- Reçus individuels pour chaque transaction.
- Export complet des données utilisateur.

---

## 5. Technologies utilisées

| Côté | Technologie | Rôle |
|------|------------|------|
| Frontend | Angular 17 (standalone components) | Structure et composants UI |
| Frontend | TypeScript | Logique métier |
| Frontend | HTML/CSS/SCSS | Templates et styles |
| Frontend | Bootstrap & FontAwesome | Mise en page et icônes |
| Frontend | SweetAlert2 | Alertes et notifications |
| Frontend | jsPDF | Génération de fichiers PDF |
| Backend | REST API | Gestion comptes et transactions |
| Backend | JWT | Authentification sécurisée |

---

## 6. Dépendances Frontend à installer

Avant de lancer le projet, installer les dépendances suivantes :

```bash
# Angular CLI
npm install -g @angular/cli

# Packages du projet
npm install @angular/core @angular/common @angular/forms @angular/router
npm install bootstrap
npm install font-awesome
npm install sweetalert2
npm install jspdf
npm install rxjs

Membre du groupe:
Nom complet :
1.Fatoumata Bintou Niang (email:fatoumatabintou.niang@unchk.edu.sn & INE: N04005020202)
2.Bineta Sow(email:bineta.sow10@unchk.edu.sn & INE: )


Voici les liens vers les dépôts de notre projet MoneyFlow :

- Front-end (Angular) : https://github.com/fatoumatabintouniang-collab/moneyflow-frontend
- Back-end (Spring Boot) : https://github.com/fatoumatabintouniang-collab/moneyflow-backend