import { connect } from "nats";

/**
 * 
 * @param server - a string of the nats server to connect to, e.g. "localhost:4222"
 * @returns 
 */
async function getNatsConnection(server: string){
    console.log('Connecting to server...', server);
    return await connect({ servers: server });
}


async function startServer(){
    let natsConnection = await getNatsConnection("127.0.0.1:4555");
    
    console.log('Connected to server');
    natsConnection.subscribe("test", {
        callback(err, msg) {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`Received: ${msg.data}`);
        },
    });
}

startServer();
