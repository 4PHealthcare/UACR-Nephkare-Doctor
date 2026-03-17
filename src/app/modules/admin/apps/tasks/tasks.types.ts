export interface Tag
{
    id?: string;
    title?: string;
}

export interface Task
{
    id?: string;
    type: 'task' | 'section';
    title: string;
    notes?: string;
    completed?: boolean;
    startDate?: string | null;
    endDate? :  string |null;
    dueDate?: string | null;
    priority?: 0 | 1 | 2;
    tags?: string[];
    order?: number;
}
export interface PromocodeGroups
{
    promogroup_id?:number;
    promocode_group:string;
    promocodeid?: number;
    promocode: string;
    valid_from: string;
    valid_to: string;
    validfrom?: string;
    validto: string;
    description: string;
    notes: string;
    list:Promocodes[];
}
export interface Promocodes
{
    promocodeid?: number;
    promocode: string;
    validfrom?: string;
    validto: string;
    description: string;
}