use super::observer::Observer;

pub struct SubscribeFn<I>(Box<dyn FnMut(I)>);

pub struct Subscription<T> {
    func: SubscribeFn<T>
}

impl<T> Drop for Subscription<T> {
    fn drop(&mut self) {
        log::debug!("dropped subscription");   
    }
}

pub trait Subscribable<T, F> {
    fn subscribe(&self, func: impl FnMut(T) + 'static) -> Subscription<T>;
}

pub struct Subject<T> {
    closed: bool,
    observers: Vec<Box<dyn Observer<Oid = usize, Value = T>>>,
}

impl<T> Subject<T> {

    pub fn new() -> Self {
        Self { closed: false, observers: Vec::new() }
    }

    pub fn close(&mut self) {
        if self.closed {
            return;
        }

        self.closed = true;
        self.observers.clear();
    }
}

impl<T, F> Subscribable<T, F> for Subject<T> {
    fn subscribe(&self, func: impl FnMut(T) + 'static) -> Subscription<T> {
        let func = SubscribeFn(Box::new(func));
        Subscription { func }
    }
}
