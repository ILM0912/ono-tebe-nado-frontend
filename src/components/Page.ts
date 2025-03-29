import { Component } from "./base/Component";
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";

interface IPage {
    catalog: HTMLElement[];
}

export class Page extends Component<IPage> {
    protected el_catalog: HTMLElement;


    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.el_catalog = ensureElement<HTMLElement>('.catalog__items');
    }

    set catalog(items: HTMLElement[]) {
        this.el_catalog.replaceChildren(...items);
    }
}