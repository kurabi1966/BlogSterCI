const redis = require('redis');
// const redisUrl = 'redis://127.0.0.1:6379';
const keys = require('../config/keys')

const client = redis.createClient(keys.redisUrl);

const util = require('util');
client.hget = util.promisify(client.hget);

const mongoose = require('mongoose');

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}){
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function(){
  if(!this.useCache){
      return exec.apply(this, arguments);
  }
  const key = JSON.stringify( Object.assign({}, this.getQuery(), {collection: this.mongooseCollection.name}));

  const cacheValue = await client.hget(this.hashKey, key);

  if(cacheValue){
    console.log('Reading from redix');

    const doc = JSON.parse(cacheValue);
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc)
  }

  console.log('Reading from Mongoose');

  const result = await exec.apply(this,arguments);
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 3600);
  return result;
}

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
}
