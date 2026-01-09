import { endpoints } from '../config';
import { apiClient } from '../api';

export const dischargeService = {
    login: (data: { logid: string; password: string }) =>
        apiClient<any>(endpoints.discharge.login, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    logout: (refreshToken: string) =>
        apiClient<any>(endpoints.discharge.logout, {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        }),

    getHistory: (page = 1, limit = 10, search = '') =>
        apiClient<any>(`${endpoints.discharge.records.base}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, {
            method: 'GET',
        }),

    getRecordById: (id: string) =>
        apiClient<any>(endpoints.discharge.records.byId(id), {
            method: 'GET',
        }),

    saveRecord: (data: any) =>
        apiClient<any>(endpoints.discharge.records.base, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    updateRecord: (id: string, data: any) =>
        apiClient<any>(endpoints.discharge.records.byId(id), {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    deleteRecord: (id: string) =>
        apiClient<any>(endpoints.discharge.records.byId(id), {
            method: 'DELETE',
        }),
};
