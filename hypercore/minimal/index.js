const net = require('net')
const hypercore = require('hypercore')

const key = Buffer.from(process.argv[2] || 'abcdefghijklmnopqrstuv', 'base64')
const port = process.env.PORT || 2020

const feed = hypercore('./.data', key, { valueEncoding: 'utf-8' })
let feedStream
// try to connect
const server = net.createServer(socket => {
  // handle server
  feedStream = feed.replicate(false, { live: true, ack: true })
  feedStream.on('ack', ack => {
    console.log('Got ack', ack.start, ack.length)
  })
  socket.pipe(feedStream).pipe(socket)
})
  .once('error', err => {
    if (err.code === 'EADDRINUSE') {
      server.close()
      // handle client
      const socket = net.connect(port)
      feedStream = feed.replicate(true, { live: true, ack: true })
      feedStream.on('ack', ack => {
        console.log('Got ack', ack.start, ack.length)
      })
      socket.pipe(feedStream).pipe(socket)
    }
  }).listen(port)
