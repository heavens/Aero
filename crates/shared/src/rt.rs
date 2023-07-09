use std::{marker::PhantomData, task::{Poll, Context}, pin::Pin};

use futures::Future;

pub struct Task<T> {
    _marker: PhantomData<T>
}

unsafe impl<T> Send for Task<T> {}
unsafe impl<T> Sync for Task<T> {}

impl<T> Future for Task<T> {
    type Output = Option<T>;

    fn poll(self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<Self::Output> {
        
        Poll::Pending
    }
}