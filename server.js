/*Server side*/

/*params*/
const params = {
    port: 5555,
    key: '1234567890123456',
    alg: 'camellia-128-ecb'
};

/*Crypto part*/
const crypto = require('crypto');
let cipher = crypto.Cipheriv(params.alg, Buffer.from(params.key,'utf8'),'');
let decipher = crypto.Decipheriv(params.alg, Buffer.from(params.key,'utf8'),'');

/*UDP part */
const dgram = require('dgram');
let counter = 0;
let udpServer = dgram.createSocket('udp4');
udpServer.on('message',(msg,rinfo)=>{
  if(msg.length>=32 && msg.length % 16 === 0){
      counter++;
      //Parasite load
      let p = decipher.update(msg.toString('hex'),'hex','hex');
      p=p.split('').join('');
      p = cipher.update(p,'hex','hex');
      //
      let out = Buffer.from(p, 'hex');
      udpServer.send(out,rinfo.port,rinfo.address);
  }
});
udpServer.bind(params.port);
setInterval(()=>{console.log(counter)},2500);