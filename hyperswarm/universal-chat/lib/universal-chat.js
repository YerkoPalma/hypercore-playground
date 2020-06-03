const EventEmitter = require('events')
const hyperswarm = require('hyperswarm')
const sodium = require('sodium-universal')
const { Peer } = require('./peer')
const { Channel } = require('./channel')

const { crypto_generichash, crypto_generichash_BYTES } = sodium

module.exports.HyperswarmUniversalChat = class HyperswarmUniversalChat extends EventEmitter {
  constructor (opts = {}) {
    super()
    this.swarm = opts.swarm || hyperswarm(opts)
    this.channels = new Set()

    this.handleConnection = this.handleConnection.bind(this)

    this.swarm.on('connection', this.handleConnection)
  }

  handleConnection (connection, info) {
    const peer = new Peer(connection, info)
    this.emit('peer', peer)
  }

  channel (name) {
    const key = Buffer.alloc(crypto_generichash_BYTES)

    crypto_generichash(key, Buffer.from(name))

    const keyString = key.toString('hex')

    const channel = new Channel(this, keyString, name)

    this.swarm.join(key, {
      announce: true,
      lookup: true
    })

    this.emit('channel', channel)

    channel.once('closed', () => {
      this.swarm.leave(key)
    })

    return channel
  }

  destroy (cb) {
    this.swarm.removeListener('connection', this.handleConnection)
    this.swarm.destroy(cb)
    this.emit('destroyed')
  }
}
