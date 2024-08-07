import {ListItem, ProductCategory, TBasketProduct} from "../types";
import {Component} from "./base/Component";
import {ensureElement} from "../utils/utils";


interface IProductActions {
    onClick: (event: MouseEvent) => void;
}

export interface IProductView {
    id: string;
    description: string;
    image: string;
    title: string;
    category: ProductCategory;
    price: string;
    button: string;
    status: boolean;
}

export class ProductView extends Component<IProductView> {
    protected _image?: HTMLImageElement;
    protected  _title: HTMLElement;
    protected _category?: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;
    private _canRemove: boolean = false;

    constructor(container: HTMLElement, actions: IProductActions) {
        super(container);

        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._button = container.querySelector('.card__button');

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title);
        
    } 

    set category(value: keyof typeof ProductCategory) {
        if (this._category) {
            this.setText(this._category, value);
            this._category?.classList?.remove('card__category_soft');
            this._category?.classList?.remove('card__category_other');
            const categoryStyle = `card__category_${ProductCategory[value]}`;
            this.toggleClass(this._category, categoryStyle, true);
        }
    }

    set price(value: string) {
        this.setText(this._price, value)
    }

    set status(status: boolean) {
        if (this._button) {
            if (this._price.textContent === '') {
                this.setText(this._button, 'Недоступно');
                this.setDisabled(this._button, true);
            } else {
                this.setText(this._button, status ? 'Удалить из корзины' : 'В корзину');
            }
        }
    }
}

export class ProductViewModal extends ProductView {
    private _description: HTMLElement;

    constructor(container: HTMLElement, actions: IProductActions) {
        super(container, actions);
        this._description = ensureElement<HTMLElement>('.card__text', container);
    }

    set description(value: string) {
        this.setText(this._description, value)
    }
    
}

export class ProductInBasketView extends Component<TBasketProduct | ListItem> {
    private _index: HTMLElement;
    private _price: HTMLElement;
    private _title: HTMLElement;
    private _button: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: IProductActions) {
        super(container);
        this._index = ensureElement<HTMLElement>(`.basket__item-index`, container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._button = container.querySelector('.basket__item-delete');

        this._button.addEventListener('click', actions.onClick);
    }

    set index(value: number) {
        this.setText(this._index, value);
    }

    set price(value: number) {
        this.setText(this._price, `${value} синапсов`);
    }

    set title(value: string) {
        this.setText(this._title, value);
    }
}