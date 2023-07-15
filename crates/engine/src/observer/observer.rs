use serde::Deserialize;

use super::ops::ObservedError;
use crate::error::AeroError;
use std::marker::PhantomData;

/// A consumer of some [Subject](crate::observer::subject::Subject) operation capable of yielding values of the associated `Value` type.
pub trait Observer {
    type Oid: Copy;
    type Value;

    /// Sets the next value emitted by the subject.
    fn next(&mut self, value: Self::Value);

    /// A handle for performing any logic upon yielding an error.
    fn error(self, err: AeroError);

    /// Consumes this observer, performing any finalizations before dropping the reference.
    fn complete(self);

    /// A flag denoting if the [Subject](crate::observer::subject::Subject) being targeted is finished.
    fn is_finished(&self) -> bool {
        false
    }

    /// The object identifier for this observer.
    fn id(&self) -> Self::Oid;
}

pub struct IndexedObserver<T> {
    id: usize,
    recv_error: bool,
    _marker: PhantomData<T>,
    on_error: Option<ObservedError>,
}

impl<T> Observer for IndexedObserver<T> where T: for<'de> Deserialize<'de> {
    type Oid = usize;
    type Value = T;

    fn next(&mut self, _value: T) {
        todo!()
    }

    fn error(self, err: AeroError) {
        if let Some(mut handle) = self.on_error {
            (&mut *handle)(err)
        }
    }

    fn complete(self) {
        todo!()
    }

    fn id(&self) -> Self::Oid {
        self.id
    }
}
