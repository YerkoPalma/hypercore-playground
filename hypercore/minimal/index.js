const ram = require('random-access-memory')
const hypercore = require('hypercore')
const key = Buffer.from('abcdefghijklmnopqrstuv', 'base64')

const argv = require('minimist')(process.argv.slice(2), {
  string: ['key', 'send', 'load'],
  boolean: ['read'],
  alias: {
    k: 'key',
    s: 'send',
    r: 'read',
    p: 'position',
    w: 'watch',
    l: 'load'
  }
})

let feed
if (argv.key) {
  feed = hypercore(argv.load ? argv.load : ram, argv.key, { valueEncoding: 'utf-8' })
} else {
  feed = hypercore(argv.load ? argv.load : ram, key, { valueEncoding: 'utf-8' })
}

if (argv.send) {
  console.log('sending', argv.send)
  feed.append(argv.send, (err, seq) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log('seq', seq)
    feed.head((err, data) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      console.log('added:', data)
    })
  })
}

if (argv.read) {
  if (argv.position) {
    feed.get(argv.position, { valueEncoding: 'utf-8' }, console.log)
  } else {
    feed.head({ valueEncoding: 'utf-8' }, console.log)
  }
}
console.log(`Created feed with key ${feed.key.toString('hex')}`)
