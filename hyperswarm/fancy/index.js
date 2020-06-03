/**
 * run
 * node . <name>
 *
 * This will join a channel with <name> or create one if it doen't exists
 * and output any message from that channel. Also stdin will go to that channel,
 * so it is basically a chat
 */
const readline = require('readline')
const hyperswarm = require('hyperswarm')
const sodium = require('sodium-universal')
const { grey } = require('kleur')

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
  // process.stdin.pipe(socket)
  const rl = readline.createInterface({
    input: process.stdin,
    output: socket,
    prompt: getDate()
  })
  const peerId = Buffer.alloc(crypto_generichash_BYTES)
  randombytes_buf(peerId)
  // dedup
  socket.write(peerId.toString('hex'))
  socket.once('data', (data) => {
    info.deduplicate(peerId, data)

    socket.on('data', (data) => {
      if (info.client) {
        console.log(grey().bold(getDate()), data.toString())
      }
    })

    rl.on('line', data => {
      if (!info.client) {
        socket.write(data)
      }
      // console.log(grey().bold(getDate()), data)
    })
  })
})

function getDate () {
  const now = new Date()
  return `[${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`
}
