/**
 * run
 * node . <name>
 *
 * This will join a channel with <name> or create one if it doen't exists
 * and output any message from that channel. Also stdin will go to that channel,
 * so it is basically a chat
 */
const hyperswarm = require('hyperswarm')
const sodium = require('sodium-universal')

const { crypto_generichash, crypto_generichash_BYTES, randombytes_buf } = sodium
const swarm = hyperswarm()

const name = process.argv[2]

// create discovery key
const key = Buffer.alloc(crypto_generichash_BYTES)
crypto_generichash(key, Buffer.from(name))

swarm.join(key, {
  announce: true,
  lookup: true
})

swarm.on('connection', (socket, info) => {
  process.stdin.pipe(socket)
  const peerId = Buffer.alloc(crypto_generichash_BYTES)
  randombytes_buf(peerId)
  // dedup
  socket.write(peerId.toString('hex'))
  socket.once('data', (data) => {
    info.deduplicate(peerId, data)
  })
  socket.on('data', (data) => {
    if (info.client) {
      console.log(data.toString().slice(0, -1))
    }
  })
})

process.on('exit', () => {
  swarm.leave(key)
})
