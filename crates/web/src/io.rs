


#[derive(Clone)]
pub struct Sender(pub Option<futures::channel::mpsc::UnboundedSender<Vec<u8>>>);

pub struct Receiver(pub futures::channel::mpsc::UnboundedReceiver<Vec<u8>>);
