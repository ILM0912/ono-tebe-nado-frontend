import { bem, ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { LotStatus } from "../../types";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard<T> {
    image: string;
    title: string;
    description?: string | string[];
    status: T;
}

export class Card<T> extends Component<ICard<T>> {
    protected el_title: HTMLElement;
    protected el_image?: HTMLImageElement;
    protected el_description?: HTMLElement;
    protected el_button?: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this.el_title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this.el_image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this.el_button = container.querySelector(`.${blockName}__button`);
        this.el_description = container.querySelector(`.${blockName}__description`);

        if (actions?.onClick) {
            if (this.el_button) {
                this.el_button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this.el_title, value);
    }

    get title(): string {
        return this.el_title.textContent || '';
    }

    set image(value: string) {
        this.setImage(this.el_image, value, this.title)
    }

    set description(value: string | string[]) {
        if (Array.isArray(value)) {
            this.el_description.replaceWith(...value.map(str => {
                const descTemplate = this.el_description.cloneNode() as HTMLElement;
                this.setText(descTemplate, str);
                return descTemplate;
            }));
        } else {
            this.setText(this.el_description, value);
        }
    }
}

export type CatalogElementStatus = {
    status: LotStatus,
    info: string
};

export class CatalogElement extends Card<CatalogElementStatus> {
    protected el_status: HTMLElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card', container, actions);
        this.el_status = ensureElement<HTMLElement>(`.card__status`, container);
    }

    set status({ status, info }: CatalogElementStatus) {
        this.setText(this.el_status, info);
        this.toggleClass(this.el_status, bem(this.blockName, 'status', 'active').name, status === 'active');
        this.toggleClass(this.el_status, bem(this.blockName, 'status', 'closed').name, status === 'closed');
    }
}