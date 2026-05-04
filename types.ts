export type Operation = {
  date: Date;
  agence: string;
  canal: 'Guichet' | 'En ligne' | 'Mobile' | 'ATM' | 'Téléphone';
  type: 'Virement' | 'Prélèvement' | 'Dépôt' | 'Retrait' | 'Carte' | 'Crédit';
  montant: number;
  statut: 'Validée' | 'En attente' | 'Rejetée';
  duree_traitement: number; // seconds
  client_id: string;
};

export type KpiMetric = {
  label: string;
  value: number;
  format: 'currency' | 'number' | 'percent' | 'duration';
  delta?: number; // vs previous period
  sparkline?: number[];
};

export type DashboardData = {
  operations: Operation[];
  loadedAt: Date;
  source: string;
};
