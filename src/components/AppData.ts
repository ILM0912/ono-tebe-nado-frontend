import _ from "lodash";
import {dayjs, formatNumber} from "../utils/utils";

import { Model } from "./base/Model";
import { IEvents } from "./base/events";

import { ILot, LotStatus, IOrder, IOrderResult, IBid, FormErrors, IOrderForm, IAppData } from "../types";

export type CatalogChanged = {
    catalog: LotElement[];
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
}

export class AppData extends Model<IAppData> {
    catalog: LotElement[];

    setCatalog(elements: ILot[]) {
        this.catalog = elements.map(
            elements => new LotElement(elements, this.events)
        );
        this.emitChanges('catalog:changed', { catalog: this.catalog });
    }
}