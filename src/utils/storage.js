// Функция проверки корректности значения статуса
function isValidStatus(status) {
    return status === 'pending' || status === 'completed';
}
// Преобразуем загруженные данные в строго типизированный формат
export async function loadCurves(plugin) {
    const data = await plugin.loadData();
    if (!data)
        return [];
    const parsedData = JSON.parse(data);
    return parsedData.map((curve) => ({
        id: curve.id,
        title: curve.title,
        created: new Date(curve.created),
        intervals: curve.intervals.map((interval) => ({
            id: interval.id,
            date: new Date(interval.date),
            status: isValidStatus(interval.status) ? interval.status : 'pending', // Проверяем статус
        })),
    }));
}
export async function saveCurves(plugin, curves) {
    await plugin.saveData(JSON.stringify(curves));
}
