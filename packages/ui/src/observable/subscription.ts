import { Subscription } from "rxjs";

export type IndexedSubscription = { index: number; subscription: Subscription };

export class SubscriptionSet {
    private count: number;
    private subscriptions: Array<IndexedSubscription>;

    constructor() {
        this.subscriptions = new Array();
    }

    public push(subscription: Subscription) {
        const oldCount = this.count;
        this.count = this.subscriptions.push({ index: oldCount, subscription });
    }

    public pop(subscription: IndexedSubscription) {
        this.count -= this.subscriptions.splice(subscription.index, 1).length;
    }

    public * iterator(): Generator<Subscription, void, Subscription> {
        for (const { subscription } of this.subscriptions) {
            yield subscription;
        }
    }

    public forEach(fn: (subscription: Subscription) => void) {
        for (const { subscription } of this.subscriptions) {
            fn(subscription);
        }
    }

    public drain(fn: (subscription: Subscription) => boolean) {
        this.subscriptions.filter(({ subscription }) => fn(subscription)).splice(0)
    }
}