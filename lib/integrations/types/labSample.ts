export interface SubTestResult {
    name: string;
    result?: string;
    unit?: string;
    range?: string;
}

export interface SampleTestResult {
    _id: string;
    testName: string;
    price: number;
    resultValue?: string;
    unit?: string;
    normalRange?: string;
    normalRanges?: {
        male?: { min?: number; max?: number };
        female?: { min?: number; max?: number };
        child?: { min?: number; max?: number };
    };
    remarks?: string;
    isAbnormal: boolean;
    status: 'Pending' | 'Completed';
    subTests?: SubTestResult[];
}

export interface LabSample {
    _id: string;
    billId: string;
    sampleId: string;
    patientDetails: {
        name: string;
        age: number;
        gender: string;
        mobile: string;
        refDoctor: string;
    };
    sampleType: string;
    tests: SampleTestResult[];
    status: 'Pending' | 'In Processing' | 'Completed';
    collectionDate?: string;
    reportDate?: string;
    createdAt: string;
}

export interface UpdateSamplePayload {
    tests?: SampleTestResult[];
    status?: string;
    collectionDate?: string;
    reportDate?: string;
}
