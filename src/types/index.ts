export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export interface IBasket {
    total: number;
    products: HTMLElement[];
}

export type TBasketProduct = Pick<IProduct, "id" | "title" | "price">

export interface IOrder {
    payment: string;
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
}

export type ListItem = {
    index: number;
}

export interface IOrderResult {
    id: string;
    total: number;
    error?: string;
}

export interface IStorData {
    products: IProduct[];
    basket: IProduct[];
    order: IOrder;
}

export type FormErrors = {
    email?: string;
    phone?: string;
    address?: string;
    payment?: string;
}

export interface List<T> {
    items: T[];
    total: number
}

export enum Events {
    CATALOG_CHANGE = 'catalog:change',
    PRODUCT_OPEN_IN_MODAL = 'product: preview',
    MODAL_OPEN = 'modal:open',
    MODAL_CLOSE = 'modal:close',
    ORDER_START = 'basket: create',
    ADD_PRODUCT_TO_BASKET = 'basket:add',
    BASKET_OPEN = 'basket:open',
    REMOVE_PRODUCT_FROM_BASKET = 'basket:remove',
    ORDER_READY = 'order:ready',
    SET_PAYMENT_TYPE = 'order:set-payment',
    ORDER_CLEAR = 'order:clear',
    FORM_ERRORS_CHANGED = 'form:error',
}