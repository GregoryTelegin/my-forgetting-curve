import { Plugin } from 'obsidian';
import { ForgettingCurve, Interval } from '../components/types';

// Функция проверки корректности значения статуса
function isValidStatus(status: string): status is 'pending' | 'completed' {
    return status === 'pending' || status === 'completed';
}

// Преобразуем загруженные данные в строго типизированный формат
export async function loadCurves(plugin: Plugin): Promise<ForgettingCurve[]> {
    const data = await plugin.loadData();
    if (!data) return [];

    const parsedData = JSON.parse(data);

    return parsedData.map((curve: any): ForgettingCurve => ({
        id: curve.id,
        title: curve.title,
        created: new Date(curve.created),
        intervals: curve.intervals.map((interval: any): Interval => ({
            id: interval.id,
            date: new Date(interval.date),
            status: isValidStatus(interval.status) ? interval.status : 'pending', // Проверяем статус
        })),
    }));
}

export async function saveCurves(plugin: Plugin, curves: ForgettingCurve[]): Promise<void> {
    await plugin.saveData(JSON.stringify(curves));
}