export interface Task
{
    id?: string;
    content?: string;
    completed?: string;
}

export interface Label
{
    id?: string;
    title?: string;
}

export interface Blog
{

    
    id?: string;
    title?: string;
    content?: string;
    tasks?: Task[];
    image?: string | null;
    labels?: Label[];
    category?:string;
    archived?: boolean;
    createdAt?: string;
    updatedAt?: string | null;
}

export interface Category
{
    id?: string;
    title?: string;
    slug?: string;
}
