
import { EmergencyCategory, EmergencyCategoryEnum } from './types';
import { MedicalIcon, FinancialIcon, DisasterIcon, LegalIcon, MentalHealthIcon } from './components/icons/EmergencyIcons';

export const EMERGENCY_CATEGORIES: EmergencyCategory[] = [
  {
    id: EmergencyCategoryEnum.Medical,
    name: 'Medical',
    description: 'Urgent medical attention, injury, or health crisis.',
    icon: MedicalIcon,
  },
  {
    id: EmergencyCategoryEnum.Financial,
    name: 'Financial',
    description: 'Urgent need for funds for housing, food, or medical bills.',
    icon: FinancialIcon,
  },
  {
    id: EmergencyCategoryEnum.Disaster,
    name: 'Disaster',
    description: 'Natural disaster like flood, fire, or earthquake.',
    icon: DisasterIcon,
  },
  {
    id: EmergencyCategoryEnum.Legal,
    name: 'Legal',
    description: 'Urgent legal help or advice needed.',
    icon: LegalIcon,
  },
  {
    id: EmergencyCategoryEnum.MentalHealth,
    name: 'Mental Health',
    description: 'Experiencing a mental health crisis and need support.',
    icon: MentalHealthIcon,
  },
];
