// Интерфейс для интервала повторения
export interface Interval {
    id: string;
    date: Date;
    status: 'pending' | 'completed';
}

// Интерфейс для кривой забывания
export interface ForgettingCurve {
    id: string;
    title: string;
    intervals: Interval[];
    created: Date;
}
