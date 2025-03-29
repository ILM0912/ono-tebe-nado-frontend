import { Form } from "./common/Form";
import { IOrderForm } from "../types";
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";

export class Order extends Form<IOrderForm> {
    protected el_formErrors: HTMLElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this.el_formErrors = ensureElement<HTMLElement>('.form__errors', this.container);
    }

    setFormErrors(error: string) {
        this.el_formErrors.textContent = error;

        if (error) {
            this.el_formErrors.style.display = 'block';
        } else {
            this.el_formErrors.style.display = 'none';
        }
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }
}