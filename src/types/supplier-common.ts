// Additional common types for supplier management

export interface OperatingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
  timezone: string;
  holidays?: string[];
}

export interface DayHours {
  open: string;
  close: string;
  breaks?: Array<{
    start: string;
    end: string;
  }>;
}

export interface ScalabilityInfo {
  maxCapacity: number;
  currentUtilization: number;
  expansionPotential: string;
  leadTimeForScaling: number;
  constraints?: string[];
}

export interface StorageRequirement {
  type: 'ambient' | 'refrigerated' | 'frozen' | 'controlled' | 'hazmat';
  temperature?: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  humidity?: {
    min: number;
    max: number;
  };
  specialConditions?: string[];
}

export interface CustomizationOption {
  type: string;
  description: string;
  minimumQuantity?: number;
  additionalCost?: number;
  leadTime?: number;
}