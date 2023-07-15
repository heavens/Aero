use std::ops::{DerefMut, Deref};

use crate::error::AeroError;

pub struct ObservedError<E = AeroError> {
    handle: Box<dyn FnMut(E)>
}

impl<E> ObservedError<E> {
    pub fn new(handle: impl FnMut(E) + 'static) -> Self {
        Self {
            handle: Box::new(handle)
        }
    }
}

impl<E: 'static> Deref for ObservedError<E> {
    type Target = dyn FnMut(E);

    fn deref(&self) -> &Self::Target {
        &self.handle
    }
}

impl<E> DerefMut for ObservedError<E> where ObservedError<E>: Deref {
    fn deref_mut(&mut self) -> &mut Self::Target {
        todo!()
    }
}