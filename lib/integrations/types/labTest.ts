import { Department } from './department';

export interface NormalRange {
    min: string;
    max: string;
}

export interface NormalRanges {
    male: NormalRange;
    female: NormalRange;
    child: NormalRange;
}

export interface LabTest {
    _id: string;
    testName: string;
    testCode?: string;
    name?: string; // Compatibility
    departmentId?: Department | string;
    departmentIds?: (Department | string)[];
    departments?: Department[]; // Populated version
    sampleType: string;
    price: number;
    unit?: string;
    method?: string;
    turnaroundTime?: string;
    normalRanges?: NormalRanges;
    fastingRequired?: boolean;
    sampleVolume?: string;
    reportType?: 'numeric' | 'text' | 'both';
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface LabTestPayload {
    testName: string;
    testCode?: string;
    departmentId?: string;
    departmentIds?: string[];
    sampleType: string;
    price: number;
    unit?: string;
    method?: string;
    turnaroundTime?: string;
    normalRanges?: NormalRanges;
    fastingRequired?: boolean;
    sampleVolume?: string;
    reportType?: 'numeric' | 'text' | 'both';
    isActive?: boolean;
}
