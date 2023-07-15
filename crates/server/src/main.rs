use std::{thread, time::Duration};

use async_net::SocketAddrV4;
use futures_lite::future;

mod connection;

fn main() {
    const PORT: Option<&str> = option_env!("AERO_SERVER_PORT");
    println!("Launching the Aero server service.");
    
    let port = PORT.map(|port_env| port_env.parse::<usize>().expect("parsing port_env")).unwrap_or_else(|| 43594);
    let server_addr: SocketAddrV4 = format!("127.0.0.1:{}", port).parse().expect("parsing server socket addr");
    // future::block_on(async move {
    //     let mut server = Server::listen(server_addr).await.expect("binding tcp server.");
    //     println!("Aero server is now listening for incoming connection on port {}", port);
    //     if let Err(e) = server.accept_connection().await {
    //         println!("failed to accept server connection: {:?}", e);
    //     }
    // });

    thread::sleep(Duration::from_secs(10));
    log::info!("Exiting process...");
}