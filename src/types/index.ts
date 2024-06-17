export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    price: number | null;
}

type PaymentType = "online" | "cash";

export interface IOrder {
    payment: PaymentType;
    email: string;
    phone: string;
    address: string;
    total: number;
    products: IProduct[];
}

export interface IOrderResult {
    id: string;
    total: number;
}

export interface IStorData {
    products: IProduct[];
    basket: IProduct[];
    order: IOrder;
}