const EventEmitter = require('events')
const ndjson = require('ndjson')
const sodium = require('sodium-universal')

const { crypto_generichash_BYTES, randombytes_buf } = sodium

module.exports.Peer = class Peer extends EventEmitter {
  constructor (connection, info) {
    super()

    const peer = info.peer
    this.info = info

    const peerId = Buffer.alloc(crypto_generichash_BYTES)
    randombytes_buf(peerId)

    this.connection = connection
    this.incoming = ndjson.parse()
    this.outgoing = ndjson.stringify()

    connection.pipe(this.incoming)
    this.outgoing.pipe(connection)

    this.send({
      type: 'peerID',
      id: peerId
    })
    this.incoming.once('peerID', (data) => {
      info.deduplicate(peerId, data.id)
    })

    this.incoming.on('data', (data) => {
      this.emit('data', data)
      const { type } = data

      this.emit(type, data)
    })

    this.connection.on('error', (e) => {
      this.emit('connection-error', e)
    })

    this.connection.once('close', () => {
      this.emit('disconnected')
    })

    if (peer && peer.topic) {
      const channel = peer.topic.toString('hex')
      this.send({
        type: 'handshake',
        channel
      })
      setTimeout(() => {
        this.emit('channel', channel)
      }, 0)
    } else {
      this.once('handshake', ({ channel }) => {
        this.send({
          type: 'handshake',
          channel
        })
        this.emit('channel', channel)
      })
    }
  }

  send (data) {
    this.outgoing.write(data)
  }

  destroy () {
    this.connection.end()
  }
}
