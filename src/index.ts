import './scss/styles.scss';

import {AuctionAPI} from "./components/AuctionAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import { cloneTemplate, ensureElement } from "./utils/utils";
import { AppData, CatalogChanged, LotElement } from './components/AppData';
import { Page } from './components/Page';
import { Auction, CatalogElement, PreviewElement } from './components/common/Card';
import { Modal } from './components/common/Modal';

const events = new EventEmitter();
const api = new AuctionAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны
const CatalogElementTemplate = ensureElement<HTMLTemplateElement>('#card');
const PreviewElementTemplate = ensureElement<HTMLTemplateElement>('#preview');
const AuctionTemplate = ensureElement<HTMLTemplateElement>('#auction');

// Модель данных приложения
const appData = new AppData({}, events);


// Глобальные контейнеры
const page = new Page(document.body, events);
const modalContainer = ensureElement<HTMLElement>('#modal-container');

// Переиспользуемые части интерфейса
const modal = new Modal(modalContainer, events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно


// Получаем лоты с сервера
api.getLotList()
    .then(result => {
        appData.setCatalog(result);
    })
    .catch(err => {
        console.error(err);
    });


events.on<CatalogChanged>('catalog:changed', () => {
    console.log(appData.catalog);
    page.catalog = appData.catalog.map(lot => {
        const card = new CatalogElement(cloneTemplate(CatalogElementTemplate), {
            onClick: () => events.emit('card:select', lot)
        });
        return card.render({
            title: lot.title,
            image: lot.image,
            description: lot.about,
            status: {
                status: lot.status,
                info: lot.statusInfo
            },
        });
    });
});

events.on('card:select', (lot: LotElement) => {
    appData.setPreview(lot);
});

events.on('preview:changed', (lot: LotElement) => {
    const showItem = (lot: LotElement) => {
        const card = new PreviewElement(cloneTemplate(PreviewElementTemplate));
        const auction = new Auction(cloneTemplate(AuctionTemplate), {
            onSubmit: (price) => {
                lot.placeBid(price);
                auction.render({
                    status: lot.status,
                    time: lot.timeStatus,
                    label: lot.auctionStatus,
                    nextBid: lot.nextBid,
                    history: lot.history
                });
            }
        });

        modal.render({
            content: card.render({
                title: lot.title,
                image: lot.image,
                description: lot.description.split("\n"),
                status: auction.render({
                    status: lot.status,
                    time: lot.timeStatus,
                    label: lot.auctionStatus,
                    nextBid: lot.nextBid,
                    history: lot.history
                })
            })
        });

        if (lot.status === 'active') {
            auction.focus();
        }
    };

    if (lot) {
        api.getLotItem(lot.id)
            .then((result) => {
                lot.description = result.description;
                lot.history = result.history;
                showItem(lot);
            })
            .catch((err) => {
                console.error(err);
            })
    } else {
        modal.close();
    }
});

events.on('modal:open', () => {
    page.locked = true;
});

events.on('modal:close', () => {
    page.locked = false;
});