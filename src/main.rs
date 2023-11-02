//use std::time::Duration;

//use ethers::providers::{Middleware, Provider, StreamExt, Ws};
//use ethers::types::Address;
//use ethers::utils::Ganache;

use jsonrpsee::{core::client::ClientT, http_client::HttpClientBuilder, rpc_params};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // // Provider
    // let provider_wss = Provider::<Ws>::connect("ws://127.0.0.1:8545").await?;
    // //let provider = Provider::try_from(endpoint)?.interval(Duration::from_millis(10));

    // // let other_address_hex = "0xaf206dCE72A0ef76643dfeDa34DB764E2126E646";
    // // let other_address = "0x3BC5Ab4695A87e67cB520f1081184135171D8e8F".parse::<Address>()?;
    // // let other_balance = provider.get_balance(other_address, None).await?;
    // // println!(
    // //     "Balance for address {}: {}",
    // //     other_address_hex, other_balance
    // // );
    // let mut stream = provider_wss.subscribe_blocks().await?.take(1000);
    // while let Some(block) = stream.next().await {
    //     println!(
    //         "Ts: {:?}, block number: {} -> {:?}",
    //         block.timestamp,
    //         block.number.unwrap(),
    //         block.hash.unwrap()
    //     );
    // }

    let client = HttpClientBuilder::default().build("http://localhost:8545")?;

    let s = String::from("0x0");
    let b = false;
    let params = rpc_params! {s, b};

    let rpc_response: Result<Option<serde_json::Value>, _> =
        client.request("eth_getBlockByNumber", params).await;

    let rpc2_response: Result<Option<serde_json::Value>, _> =
        client.request("trace_block", rpc_params! {"0x0"}).await;

    match rpc_response {
        Ok(Some(s)) => println!("ok some {s}"),
        Ok(None) => println!("ok none"),
        Err(e) => println!("%%%Error: {e:?}"),
    };

    match rpc2_response {
        Ok(Some(s)) => println!("ok some {s}"),
        Ok(None) => println!("ok none"),
        Err(e) => println!("%%%Error: {e:?}"),
    };

    Ok(())
}
