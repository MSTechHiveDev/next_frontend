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
    labId: string;
    name: string;
    departmentId: string | { _id: string; name: string }; // Can be populated
    sampleType?: string;
    price: number;
    unit?: string;
    method?: string;
    turnaroundTime?: string;
    normalRanges?: NormalRanges;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface LabTestPayload {
    name: string;
    departmentId: string;
    sampleType?: string;
    price: number;
    unit?: string;
    method?: string;
    turnaroundTime?: string;
    normalRanges?: NormalRanges;
    isActive?: boolean;
}
