use std::{rc::Rc, cell::RefCell, sync::{Weak, atomic::{AtomicUsize, Ordering}}, collections::{HashSet, HashMap}};
use rt::Task;
use serde_json::Value;
use futures::Stream;

pub mod rt;
pub mod error;
pub mod messages;

pub type WindowId = usize;
pub type WorkspaceId = usize;
pub type PeerId = usize;
pub type ViewId = usize;

pub fn next_window_id() -> usize {
    static ID_PROVIDER: AtomicUsize =  AtomicUsize::new(1);
    ID_PROVIDER.fetch_add(1, Ordering::SeqCst)
}

pub trait View: Stream {
    fn component_name(&self) -> &'static str;
    fn will_mount(&mut self, _: &mut Window, _: WeakViewHandle<Self>) where Self: Sized;
    fn render(&self) -> Option<Value>;
    fn dispatch_action(&mut self, _: Value, _: &mut Window);
}

pub struct Window(Rc<RefCell<Inner>>);

pub struct Inner {
    root_view: Option<ViewHandle>,
    next_view_id: ViewId,
    views: HashMap<ViewId, Rc<RefCell<dyn View<Item = ()>>>>,
    inserted: HashSet<ViewId>,
    removed: HashSet<ViewId>,
    focused: Option<ViewId>,
    height: f64,
    update_stream_counter: usize,
    update_stream_task: Option<Task<Value>>,
}

pub struct ViewHandle {
    pub view_id: ViewId,
    inner: Weak<RefCell<Inner>>,
}

pub struct WeakViewHandle<T: ?Sized>(Weak<RefCell<T>>);