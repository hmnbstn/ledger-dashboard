# Ledger — Operations Dashboard

Dashboard web minimaliste pour le suivi quotidien des KPIs opérationnels bancaires. Construit avec Next.js 15, TypeScript et Tailwind CSS.

Charge des exports CSV ou XLSX par drag-and-drop, parse les données côté client (rien ne quitte le navigateur), et calcule en temps réel les indicateurs clés.

## Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:3000`. Au premier chargement, des données de démonstration sont affichées. Glisser un fichier CSV/XLSX pour le remplacer par tes vraies données.

## Architecture

```
app/
  layout.tsx          → Layout racine, fonts
  page.tsx            → Dashboard principal (Client Component)
  globals.css         → Tokens design (couleurs, polices, hairlines)

components/
  KpiCard.tsx         → Carte KPI avec delta animé
  FileUpload.tsx      → Drop zone CSV/XLSX
  Charts.tsx          → Graphiques Recharts (Volume, Hourly, BarList)

lib/
  types.ts            → Types Operation, KpiMetric, DashboardData
  parser.ts           → Parsing CSV/XLSX avec mapping flexible des colonnes
  metrics.ts          → Calcul KPIs, formats fr-FR, génération mock data
```

## Format des fichiers d'entrée

Le parser reconnaît automatiquement plusieurs variantes de noms de colonnes (FR/EN). Colonnes attendues :

| Champ              | Variantes acceptées                                 |
|--------------------|-----------------------------------------------------|
| `date`             | date, date_operation, jour                          |
| `agence`           | agence, branch, bureau, site                        |
| `canal`            | canal, channel, mode, voie                          |
| `type`             | type, type_operation, nature                        |
| `montant`          | montant, amount, somme, valeur                      |
| `statut`           | statut, status, état                                |
| `duree_traitement` | duree, durée, duration, temps_traitement            |
| `client_id`        | client_id, client, id_client, customer_id          |

Valeurs attendues :
- **canal** : Guichet, En ligne, Mobile, ATM, Téléphone
- **type** : Virement, Prélèvement, Dépôt, Retrait, Carte, Crédit
- **statut** : Validée, En attente, Rejetée

Format souple : les dates peuvent être ISO, françaises, ou en sérial Excel. Les montants peuvent contenir des espaces, virgules, ou symboles €.

## KPIs calculés

- **Volume traité** — Somme des montants des opérations validées
- **Opérations** — Nombre d'opérations validées + clients uniques
- **Taux de rejet** — Part des opérations rejetées
- **Temps moyen** — Durée moyenne de traitement

Chaque KPI est comparé à la période précédente (delta % sur la moitié antérieure du fichier).

## Décisions de design

- **Police display** : Instrument Serif — donne une signature éditoriale, change de la quincaillerie habituelle (Inter, Roboto…)
- **Police data** : Inter avec `font-feature-settings: 'tnum'` pour des chiffres tabulaires alignés
- **Palette** : Papier (`#FBFAF7`) + encre (`#0A0A0A`) + un seul accent vert "ledger" pour les valeurs positives. Rouge réservé aux rejets/baisses critiques.
- **Hairlines** : bordures 1px à 6% d'opacité — l'effet "Apple/Linear"
- **Pas de gradients gratuits**, pas de glassmorphism partout — la sobriété est l'identité.

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript strict
- Tailwind CSS 3
- Recharts pour les graphiques
- Framer Motion pour les transitions
- PapaParse pour le CSV
- SheetJS (xlsx) pour les Excel
- date-fns pour la manipulation des dates

## Étapes suivantes possibles

- Filtres date / agence / canal en haut du dashboard
- Export PDF du dashboard pour reporting
- API route Next.js pour persister les imports en base
- Authentification (NextAuth) si déploiement multi-utilisateurs
- Comparaison N vs N-1 (semaine précédente, mois précédent)
- Alertes seuils (ex: si rejet > 5%, badge rouge)
