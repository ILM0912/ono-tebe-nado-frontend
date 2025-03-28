import _ from "lodash";
import {dayjs, formatNumber} from "../utils/utils";

import { Model } from "./base/Model";
import { IEvents } from "./base/events";

import { ILot, LotStatus, IOrder, IOrderResult, IBid, FormErrors, IOrderForm, IAppData } from "../types";

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