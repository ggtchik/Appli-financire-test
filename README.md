# Quatre — répartition automatique de revenus en 4 piliers

Application web autonome (HTML / CSS / JavaScript, sans backend, sans compte, sans dépendance)
pour répartir chaque entrée d'argent selon une règle fixe en **4 piliers**, suivre les dépenses,
consulter l'historique mensuel et générer un **rapport mensuel imprimable**.

> **Dîme 10 % · Charité 10 % · Besoins 60 % · Investissement 20 %**

---

## Démarrer

| Méthode | Commande |
| --- | --- |
| Le plus simple | ouvrir **`index.html`** dans votre navigateur (double-clic) |
| Un seul fichier à transporter | ouvrir **`quatre.html`** (CSS + JS inlinés) |
| Serveur local (optionnel) | `npm start` puis http://localhost:8080 |
| Régénérer la version mono-fichier | `npm run build` |

Aucune installation, aucun compte, aucune connexion réseau : tout fonctionne hors-ligne.
Vos données restent dans le navigateur (`localStorage`).

---

## Fonctionnalités

### 1. Saisie de revenu avec répartition instantanée
- Montant, devise (EUR / USD / JPY / GBP), date, note.
- Aperçu live de la répartition pendant la frappe (10 / 10 / 60 / 20).
- Les 4 soldes s'animent immédiatement après validation.
- Toast de confirmation avec **Annuler** (dernière opération).

### 2. Multi-devises simultané
- Chaque solde (global et par pilier) est affiché en **EUR, USD, JPY et GBP** en même temps.
- Devise principale configurable : elle pilote tous les montants mis en avant et les rapports.
- Taux de change **manuels** (base euro), modifiables dans Réglages, avec date de mise à jour.
- Conversion cohérente : chaque opération est stockée en euros de référence, puis convertie à l'affichage.

### 3. Suivi des dépenses par catégorie
- Une dépense est imputée à un pilier (Dîme, Charité, Besoins, Investissement).
- Le solde du pilier diminue immédiatement, avec prévisualisation « avant / après ».
- Alerte si la dépense fait passer un pilier en négatif.
- Filtres par pilier, historique daté avec notes, pagination progressive.

### 4. Suivi mensuel automatique
- Carte « Ce mois-ci » : revenus, dépenses, solde, taux d'épargne, mini-courbe 6 mois.
- Vue **Historique** : navigation par année, totaux annuels, graphique revenus / dépenses
  sur 12 mois et liste mois par mois (cliquable vers le rapport correspondant).

### 5. Rapport mensuel complet
- Revenu total converti dans les 4 devises.
- Répartition détaillée par pilier : part, alloué, dépensé, restant.
- Dépenses par catégorie avec nombre d'opérations et poids relatif.
- Solde global disponible, détail de toutes les opérations du mois.
- Comparaison avec le mois précédent (revenus, dépenses, solde + variations %).
- **Version imprimable / PDF** : mise en page A4 claire, thème papier, sans navigation
  (`Imprimer / PDF` → « Enregistrer au format PDF »).

### 6. Persistance
- Sauvegarde automatique à chaque modification (`localStorage`, clé `quatre.app.v1`).
- Export **JSON** (sauvegarde complète) et restauration par import de fichier.
- Export **CSV** (compatible Excel / Numbers / Sheets).
- Jeu de démonstration sur 6 mois pour découvrir l'app, supprimable en un clic.

---

## Design

- Interface sombre premium (inspiration Stripe / Mercury / Wealthsimple) : dégradés ambiants,
  grain subtil, cartes à ombres douces et coins arrondis, typographie à chiffres tabulaires.
- Graphiques maison en SVG (aucune librairie) : donut de répartition, courbe d'évolution
  mensuelle avec infobulle interactive, barres annuelles, sparkline.
- Animations fluides des montants (interpolation ease-out), respect de `prefers-reduced-motion`.
- Icônes cohérentes dessinées à la main (trait 1,65) pour chaque pilier et chaque action.
- Responsive : sidebar sur desktop, barre de navigation fixe en bas sur mobile, tableaux adaptatifs.
- Thème clair dédié à l'impression du rapport, titres de sections non coupés entre deux pages.

---

## Structure

```
index.html      structure de la coquille (sidebar, vues, toasts, modales)
styles.css      design system complet (tokens, composants, responsive, print)
app.js          état, calculs, rendu des vues, graphiques SVG, interactions, exports
build.js        génère quatre.html (version autonome mono-fichier)
quatre.html     application complète inlinée (générée, prête à télécharger)
package.json    scripts npm (start / build)
```

### Modèle de données (extrait)

```json
{
  "settings": {
    "primary": "EUR",
    "rates": { "EUR": 1, "USD": 1.08, "JPY": 168, "GBP": 0.85 },
    "ratesUpdated": "2026-10-22"
  },
  "incomes":  [{ "id": "…", "amount": 2500, "currency": "USD", "base": 2314.81, "date": "2026-10-22", "note": "…" }],
  "expenses": [{ "id": "…", "amount": 420, "currency": "EUR", "base": 420, "date": "2026-10-22",
                 "category": "dime", "note": "…" }]
}
```

- `base` = contre-valeur en euros au moment de la saisie (immuable).
- Les taux servent à **convertir** ces euros vers la devise d'affichage.
  « Recalculer l'historique » réapplique les taux courants aux opérations existantes.

---

## Bon à savoir

- **Aucune API de change** : les taux sont ceux que vous saisissez (valeurs par défaut indicatives).
- Le yen est affiché sans décimales (usage japonais), les autres devises avec 2 décimales.
- Vider les données du navigateur efface vos opérations : exportez régulièrement la sauvegarde JSON.
- Chaque navigateur / appareil possède son propre stockage (pas de synchronisation).
- Copier la petite liasse de fichiers suffit à emporter l'application ; `quatre.html` est la version
  la plus pratique pour un envoi ou une clé USB.

---

## Raccourcis

| Action | Chemin |
| --- | --- |
| Nouveau revenu | Vue d'ensemble → *Nouveau revenu* (`#/revenus`) |
| Nouvelle dépense | Vue d'ensemble → *Dépense* (`#/depenses`) |
| Rapport du mois | *Rapport mensuel* (`#/rapport`) puis Imprimer / PDF |
| Taux & devise principale | *Réglages* (`#/reglages`) |
| Sauvegarde | pied de page → *Sauvegarder* (ou Réglages → Données) |
