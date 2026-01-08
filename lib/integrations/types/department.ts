export interface Department {
    _id: string;
    labId: string;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface DepartmentPayload {
    name: string;
    description?: string;
}
