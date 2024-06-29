import {Component} from "./base/Component";
import {IEvents} from "./base/EventEmitter";
import {ensureElement} from "../utils/utils";
import {Events} from "../types";

interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}

export class PageView extends Component<IPage> {
    private _counter: HTMLElement;
    private _catalog: HTMLElement;
    private _basket: HTMLElement;
    private wrapper: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._counter = ensureElement<HTMLElement>('.header__basket-counter');
        this._catalog = ensureElement<HTMLElement>('.gallery');
        this._basket = ensureElement<HTMLElement>('.header__basket');
        this.wrapper = ensureElement<HTMLElement>('.page__wrapper');

        this._basket.addEventListener('click', () => {
            this.events.emit(Events.BASKET_OPEN);
        });
    }

    set counter(counter: number) {
        this.setText(this._counter, counter);
    }

    set catalog(catalog: HTMLElement[]) {
        this._catalog.replaceChildren(...catalog);
    }

    set locked(value: boolean) {
        this.toggleClass(this.wrapper, 'page__wrapper_locked', value);
    }
}