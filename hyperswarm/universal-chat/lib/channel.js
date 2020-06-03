const EventEmitter = require('events')

module.exports.Channel = class Channel extends EventEmitter {
  constructor (chat, key, name) {
    super()

    this.name = name
    this.key = key
    this.chat = chat
    this.peers = new Set()

    this.handlePeer = this.handlePeer.bind(this)

    this.chat.on('peer', this.handlePeer)
  }

  handlePeer (peer) {
    peer.once('channel', (channel) => {
      if (channel === this.key) {
        this.addPeer(peer)
      }
    })
  }

  addPeer (peer) {
    this.peers.add(peer)
    this.emit('peer', peer)

    peer.once('disconnected', () => {
      this.peers.delete(peer)
      this.emit('peer-disconnected', peer)
    })
    peer.on('message', (data) => {
      this.emit('message', peer, data)
    })
  }

  send (message) {
    this.broadcast({
      type: 'message',
      message
    })
  }

  broadcast (data) {
    for (const peer of this.peers) {
      peer.send(data)
    }
  }

  close () {
    this.chat.removeListener('peer', this.handlePeer)

    for (const peer of this.peers) {
      peer.destroy()
    }

    this.emit('closed')

    this.chat = null
  }
}
