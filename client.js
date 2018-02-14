/*Client side*/

const cluster = require('cluster');




    /*params*/
    const params = {
        //host: '10.0.0.226',
        //host: '18.196.98.15',
        host: '77.52.209.24',
        port: 5555,
        key: '1234567890123456',
        alg: 'camellia-128-ecb',
        threads: 10,
        messages: 100000,
        packets: 10000,
        interval: 5,
        random: 5
    };
if(cluster.isMaster){
    for(let i=0; i<params.threads; i++){
        cluster.fork();
    }
    process.on('exit',()=>{
        for(let w in cluster.workers){
            try{cluster.workers[w].kill()}
            catch(e){}
        }
    });
}
else {
    /*Crypto part*/
    const crypto = require('crypto');
    let cipher = crypto.Cipheriv(params.alg, Buffer.from(params.key, 'utf8'), '');
    let decipher = crypto.Decipheriv(params.alg, Buffer.from(params.key, 'utf8'), '');

    /*UDP part */
    let sent = 0;
    let replies = 0;
    let message = crypto.randomBytes(64);
    let encoded = Buffer.from(cipher.update(message.toString('hex'), 'hex', 'hex'), 'hex');
    const dgram = require('dgram');

    let udpClient = dgram.createSocket('udp4');
    udpClient.on('message', (msg, rinfo) => {
        replies++;
    });

    function send() {
        if(sent<params.messages){
            udpClient.send(encoded, params.port, params.host);
            sent++;
        }
        else {
            setTimeout(()=>{console.log(`=======FINAL=======\nSent: ${sent}, Replies: ${replies}`); process.exit()},5000)
        }
    }

    for (let i = 0; i < params.packets; i++) {
        setTimeout(() => {
            setInterval(send, params.interval * 1000)
        }, getRandomTime(0, params.random));
    }

    setInterval(() => {
        console.log(`Sent: ${sent}, Replies: ${replies}`)
    }, 5000);

    /**/
    function getRandomTime(min, max) {
        return Math.floor(Math.random() * (max - min + 1) * 1000) + min;
    }

}