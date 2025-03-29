import _ from "lodash";
import {dayjs, formatNumber} from "../utils/utils";

import { Model } from "./base/Model";
import { IEvents } from "./base/events";

import { ILot, LotStatus, IOrder, IOrderResult, IBid, FormErrors, IOrderForm, IAppData } from "../types";
import { AuctionAPI } from "./AuctionAPI";
import {API_URL, CDN_URL} from "../utils/constants";

export type CatalogChanged = {
    catalog: LotElement[];
    preview: ILot | null;
}

export class LotElement extends Model<ILot> {
    //ILotItem
    id: string;
    title: string;
    about: string;
    description: string;
    image: string;
    
    //IAuction
    status: LotStatus;
    datetime: string;
    price: number;
    minPrice: number;
    history: number[];

    get statusInfo(): string {
        switch (this.status) {
            case "active":
                return `Открыто до ${dayjs(this.datetime).format('D MMMM [в] HH:mm')}`
            case "closed":
                return `Закрыто ${dayjs(this.datetime).format('D MMMM [в] HH:mm')}`
            case "wait":
                return `Откроется ${dayjs(this.datetime).format('D MMMM [в] HH:mm')}`
            default:
                return this.status;
        }
    }

    get nextBid(): number {
        return Math.floor(this.price * 1.1);
    }

    placeBid(price: number): void {
        if (price <= this.history.at(-1)) {
            console.log('Ставка должна быть больше предыдущей');
            return;
        }

        this.price = price;
        this.history.shift();
        this.history.push(price);

        // ну я пытался но оно не работает
        const api = new AuctionAPI(CDN_URL, API_URL);
        api.placeBid(this.id, {price: this.price});


        if (price > (this.minPrice * 10)) {
            this.status = 'closed';
        }
        this.emitChanges('auction:changed', { id: this.id, price });
    }

    get timeStatus(): string {
        if (this.status === 'closed') return 'Аукцион завершен';
        else return dayjs
            .duration(dayjs(this.datetime).valueOf() - Date.now())
            .format('D[д] H[ч] m[ мин] s[ сек]');
    }

    get auctionStatus(): string {
        switch (this.status) {
            case 'closed':
                return `Продано за ${formatNumber(this.price)}₽`;
            case 'wait':
                return 'До начала аукциона';
            case 'active':
                return 'До закрытия лота';
            default:
                return '';
        }
    }
}

export class AppData extends Model<IAppData> {
    catalog: LotElement[];
    preview: ILot | null;

    setCatalog(elements: ILot[]) {
        this.catalog = elements.map(
            elements => new LotElement(elements, this.events)
        );
        this.emitChanges('catalog:changed', { catalog: this.catalog });
    }

    setPreview(lot: ILot) {
        this.preview = lot;
        this.emitChanges('preview:changed', lot);
    }
}