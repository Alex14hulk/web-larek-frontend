import './scss/styles.scss';
import {EventEmitter} from "./components/base/EventEmitter";
import {API_URL, CDN_URL} from "./utils/constants";
import {WLarekApi} from './components/WLarekApi';
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {StorData, ProductsChangeEvent} from "./components/StorData";
import {PageView} from "./components/Page";
import {ProductInBasketView, ProductView, ProductViewModal} from "./components/Product";
import {Events, IOrder, IProduct} from "./types";
import {Modal} from "./components/common/Modal";
import {BasketView} from "./components/Basket";
import {OrderForm} from "./components/Order";
import {OrderSuccessView} from "./components/OrderFormView";
import {Contacts} from "./components/Contacts";

const events = new EventEmitter();
const api = new WLarekApi(CDN_URL, API_URL);

// шаблоны
const productCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const productModal = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const productInBasket = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const storData = new StorData({}, events, [], [], {
    email: '',
    phone: '',
    payment: null,
    address: '',
    total: 0,
    items: []
});

// Контейнеры
const page = new PageView(document.body, events);
const basket = new BasketView(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderTemplate), events);
const contactsForm = new Contacts(cloneTemplate(contactsTemplate), events);
const orderFormView = new OrderSuccessView(cloneTemplate(successTemplate), {
    onClick: () => {
        modal.close();
        events.emit(Events.ORDER_CLEAR);
    },
});

// бизнес-логика
// Поймали событие, сделали что нужно

//Изменения продуктов на главной странице
events.on<ProductsChangeEvent>(Events.CATALOG_CHANGE, () => {
    page.counter = storData.getBasket().length;
    page.catalog = storData.getProducts().map(item => {
        const product = new ProductView(cloneTemplate(productCatalogTemplate), {
            onClick: () => {
                events.emit(Events.PRODUCT_OPEN_IN_MODAL, item);
            }
        });
        return product.render({
            id: item.id,
            title: item.title,
            image: CDN_URL + item.image,
            category: item.category,
            price: item.price ? `${item.price} синапсов` : 'Бесценно'
        });
    });
});

// Открытие продукта в модальном окне
events.on(Events.PRODUCT_OPEN_IN_MODAL, (product: IProduct) => {
    const card = new ProductViewModal(cloneTemplate(productModal), {
        onClick: () => events.emit(Events.ADD_PRODUCT_TO_BASKET, product),
    });

    modal.render({
        content: card.render({
            title: product.title,
            image: CDN_URL + product.image,
            category: product.category,
            description: product.description,
            price: product.price ? `${product.price} синапсов` : '',
            status: product.price === null || storData.getBasket().some(item => item === product)
        }),
    });
});

// Блокировка прокрутки страницы, если открыто модальное окно
events.on(Events.MODAL_OPEN, () => {
    page.locked = true;
});

// Разблокировка прокрутки страницы, если закрыто модальное окно
events.on(Events.MODAL_CLOSE, () => {
    page.locked = false;
});

// Добавляем продукт в корзину
events.on(Events.ADD_PRODUCT_TO_BASKET, (product: IProduct) => {
    storData.addProductToBasket(product);
    page.counter = storData.getBasket().length
    modal.close();
});

// Открытие корзины
events.on(Events.BASKET_OPEN, () => {
    const products = storData.getBasket().map((item, index) => {
        const product = new ProductInBasketView(cloneTemplate(productInBasket), {
            onClick: () => events.emit(Events.REMOVE_PRODUCT_FROM_BASKET, item)
        });
        return product.render({
            index: index + 1,
            id: item.id,
            title: item.title,
            price: item.price
        });
    });
    modal.render({
        content: createElement<HTMLElement>('div', {}, [
            basket.render({
                products,
                total: storData.getTotalPrice()
            })
        ])
    });
});

//Удаляем продукт из корзины
events.on(Events.REMOVE_PRODUCT_FROM_BASKET, (product: IProduct) => {
    storData.removeProductFromBasket(product);
    page.counter = storData.getBasket().length
});

//Начинаем оформление заказа
events.on(Events.ORDER_START, () => {
    if (!storData.isFirstFormFill()) {
        const data = {
            address: ''
        };
        modal.render({
            content: orderForm.render({
                valid: false,
                errors: [],
                ...data
            })
        });
    } else {
        const data = {
            phone: '',
            email: ''
        };
        modal.render({
            content: contactsForm.render({
                valid: false,
                errors: [],
                ...data
            }),
        });
    }
});

events.on(Events.SET_PAYMENT_TYPE, (data: { paymentType: string }) => {
    storData.setOrderField("payment", data.paymentType);
});

// Изменилось одно из полей
events.on(/(^order|^contacts)\..*:change/,
    (data: { field: keyof Omit<IOrder, 'items' | 'total'>; value: string }) => {
        storData.setOrderField(data.field, data.value);
    }
);

// Изменилось состояние валидации формы
events.on(Events.FORM_ERRORS_CHANGED, (errors: Partial<IOrder>) => {
    const { email, phone, address, payment } = errors;
    orderForm.valid = !address && !payment;
    orderForm.errors = Object.values(errors)
        .filter((i) => !!i)
        .join(', ');

    contactsForm.valid = !email && !phone;
    contactsForm.errors = Object.values(errors)
        .filter((i) => !!i)
        .join(', ');
});

// Отправлена форма заказа
events.on(/(^order|^contacts):submit/, () => {
    if (!storData.getOrder().email || !storData.getOrder().address || !storData.getOrder().phone){
        return events.emit(Events.ORDER_START);
    }

    const products = storData.getBasket();

    api
        .createOrder({
            ...storData.getOrder(),
            items: products.map(product => product.id),
            total: storData.getTotalPrice(),
        })
        .then((result) => {
            modal.render({
                content: orderFormView.render({
                    title: !result.error ? 'Заказ оформлен' : 'Ошибка оформления заказа',
                    description: !result.error ? `Списано ${result.total} синапсов` : result.error,
                }),
            });
        })
        .catch(console.error);
});

// Очистить заказ и корзину
events.on(Events.ORDER_CLEAR, () => {
    storData.clearBasket();
    storData.clearOrder();
    orderForm.resetPaymentButtons();
});

// Получаем продукты с сервера
api.getProducts()
    .then(data => storData.setProducts(data.items))
    .catch(err => {
        console.error(err);
    });
