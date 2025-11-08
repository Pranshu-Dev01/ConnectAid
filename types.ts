// types.ts

export enum EmergencyCategoryEnum {
  Medical = 'medical',
  Financial = 'financial',
  Disaster = 'disaster',
  Legal = 'legal',
  MentalHealth = 'mental_health',
}

export interface EmergencyCategory {
  id: EmergencyCategoryEnum;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface Alert {
  id: string;
  category: EmergencyCategory;
  details: string;
  location: UserLocation | null;
  timestamp: Date;
}

export interface AlertStatusUpdate {
  id: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'in_progress' | 'resolved';
}

export interface AccessibilitySettings {
  isHighContrast: boolean;
  isLargeText: boolean;
}

export interface Responder {
  name: string;
  uri: string;
  type: 'place' | 'web';
}

export interface User {
  name: string;
  contact: string; // email or phone
  loginMethod: 'email' | 'phone' | 'google';
  password?: string; // For email-based authentication
  alerts: Alert[];
}