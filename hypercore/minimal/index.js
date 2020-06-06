const net = require('net')
const hypercore = require('hypercore')
// const readline = require('readline')

const key = Buffer.from('abcdefghijklmnopqrstuv', 'base64')
const dataPath = process.argv[2] || './.data'
const port = parseInt(process.env.PORT, 10) || 2020

const feed = hypercore(dataPath, key, { valueEncoding: 'utf-8' })
feed.on('ready', () => {
  console.log(`peer ${feed.key.toString('hex')} ready!`)
})
feed.on('error', error => {
  console.log('[Error]', error)
})
feed.on('append', () => {
  console.log('* New data appended')
})
feed.on('peer-add', peer => {
  console.log('* someone connected')
  console.log(`${feed.peers.length} connected`)
})

let feedStream
let connection
// try to connect
const server = net.createServer(socket => {
  // handle server
  connection = socket
  feedStream = feed.replicate(false, { live: true })
  socket.pipe(feedStream).pipe(socket)
})
  .on('connection', connection => {
    connection.on('data', data => {
      if (data.toString('utf8').indexOf('stdin>') > -1) {
        console.log('server> ', data.toString('utf8').slice(6))
      }
    })
  })
  .once('error', err => {
    if (err.code === 'EADDRINUSE') {
      server.close()
      // handle client
      const socket = net.connect(port, setup)
      connection = socket
      connection.on('data', data => {
        if (data.toString('utf8').indexOf('stdin>') > -1) {
          console.log('socket> ', data.toString('utf8').slice(6))
        }
      })
      feedStream = feed.replicate(true, { live: true })
      socket.pipe(feedStream).pipe(socket)
    }
  }).listen(port, setup)

function setup () {
  // connect streams
  const readable = feed.createReadStream({ live: true })
  process.stdin.on('data', data => {
    console.log('stdin>', data.toString('utf8'))
    feed.append(data, () => {
      connection.write(`stdin>${data}`)
    })
  })
  readable.on('data', data => {
    console.log('stream>', data)
  })
}
