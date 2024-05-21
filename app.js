const express = require('express');
const redis = require('redis');
const client = redis.createClient({
    url: 'redis://192.168.1.11:6379',
    password: "trabalho",
});
module.exports = client;
const chaves = require('./routers/chaves.js')(client);
const hashes = require('./routers/hashes.js')(client);
const sorted_sets = require('./routers/sorted_sets.js')(client);

client.on('error', err => console.log('Redis Client Error', err));

client.connect().then(() => {console.log('Connected to Redis');
    
const app = express();
    
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('assets'));
app.use('/chaves', chaves);
app.use('/hashes', hashes);
app.use('/sorted_sets', sorted_sets);
    
app.listen(3000, () => {
  console.log('Site funcionando no port 3000');
});
    
app.get('/', function (req, res){
  res.render('main', {mensagem: "Escolha um exemplo"});
});
}).catch(err => {console.error('Failed to connect to Redis', err);});

process.on('SIGINT', () => {
  client.disconnect();
  console.log('Disconnected from Redis');
  process.exit();
});

process.on('SIGTERM', () => {
  client.disconnect();
  console.log('Disconnected from Redis');
  process.exit();
});
