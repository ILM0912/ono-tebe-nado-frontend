import './scss/styles.scss';

import {AuctionAPI} from "./components/AuctionAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import { cloneTemplate, ensureElement } from "./utils/utils";
import { AppData, CatalogChanged } from './components/AppData';
import { Page } from './components/Page';
import { CatalogElement } from './components/common/Card';

const events = new EventEmitter();
const api = new AuctionAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны
const CatalogElementTemplate = ensureElement<HTMLTemplateElement>('#card');

// Модель данных приложения
const appData = new AppData({}, events);


// Глобальные контейнеры
const page = new Page(document.body, events);

// Переиспользуемые части интерфейса


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
    console.log("event");
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