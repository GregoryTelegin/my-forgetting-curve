export interface Note {
    id?: number;
    title: string;
    type?: 'folder' | 'file';
    key: string,
    nextReviewDate?: string,
    children?: Note[];  
}