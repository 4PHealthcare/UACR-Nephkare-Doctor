export interface Doctor
{
    id: string;
    category?: string;
    name: string;
    description?: string;
    tags?: string[];
    sku?: string | null;
    barcode?: string | null;
    brand?: string | null;
    vendor: string | null;
    stock: number;
    reserved: number;
    cost: number;
    basePrice: number;
    taxPercent: number;
    price: number;
    weight: number;
    thumbnail: string;
    images: string[];
    active: boolean;
}

export interface Pagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface Category
{
    id: string;
    parentId: string;
    name: string;
    slug: string;
}

export interface Brand
{
    id: string;
    name: string;
    slug: string;
}

export interface Tag
{
    id?: string;
    title?: string;
}

export interface Vendor
{
    id: string;
    name: string;
    slug: string;
}
