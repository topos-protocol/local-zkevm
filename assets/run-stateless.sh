#!/usr/bin/bash

OUT_DIR=$PWD/new-dev
WITNESSDB=$OUT_DIR/chaindata/
STATEFILE=$PWD/new-jerrigon-state

function get_latest_block_height() {
    latest_block=$(curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest", false],"id":1}' -s http://localhost:$JERIGON_RPC_PORT | jq -r '.result.number' | xargs printf "%d\n")
    echo "✅ Latest block height: $latest_block"
}

function start_jerrigon() {
    # Launch the node
    erigon --chain=dev --mine \
           --private.api.addr=localhost:9090 \
           --datadir=$OUT_DIR \
           --http.addr=0.0.0.0 \
           --http.port=$JERIGON_RPC_PORT \
           --http.api=eth,erigon,web3,net,debug,trace,txpool,parity,admin \
           --staticpeers=enode://$ERIGON_ENODE@node-erigon:30303 \
           --http.corsdomain="*" &

    jerrigon_pid=$!

    echo
    echo "✅ Started jerrigon `erigon --version` at pid: $jerrigon_pid"
}

function stop_jerrigon() {
    kill "$jerrigon_pid"
    wait "$jerrigon_pid"

    echo
    echo "✅ Stopped jerrigon"
}

function generate_witness() {
    # Get latest generated witness
    if [[ ! -e ./start.index ]]; then
        echo -n 1 > start.index
    fi
    start_block=$(cat start.index)
    end_block=$latest_block

    echo
    echo "🤖 Running the stateless command for $start_block..$end_block"
    state stateless --block $start_block --stopBlock $end_block --datadir=$OUT_DIR \
                    --witnessDbFile $WITNESSDB \
                    --statefile $STATEFILE \
                    --chain dev \
                    --verbosity debug

    echo -n $end_block > start.index
    echo "✅ Generated the witnesses for $start_block..$end_block"
}

# Workaround until there are ways to generate
# the witnesses in parallel of the running node
function main() {
    start_jerrigon
    sleep 2
    get_latest_block_height
    end_block=$latest_block
    while true; do
        sleep $GENERATION_INTERVAL
        get_latest_block_height
        if [[ $latest_block -ne $end_block ]]; then
            stop_jerrigon
            generate_witness
            start_jerrigon
        fi
    done
}

main
