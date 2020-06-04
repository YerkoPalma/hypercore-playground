# hypercore-playground
[![Build Status](https://img.shields.io/travis/YerkoPalma/hypercore-playground/master.svg?style=flat-square)](https://travis-ci.org/YerkoPalma/hypercore-playground) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> Simple playground on the hyper stack

## Motivation

I always found fascinating the tech behind some p2p technology.
Lastly I've saw some pretty interesting things about beaker browser, this
[talk](https://www.youtube.com/watch?v=rJ_WvfF3FN8) and, more deeply this 
[post](https://infocivics.com/).
However, this intersting distributed world seemed just to complicated to me,
and even though the teams behind the tech I was watching (The 
[hyper stack](https://github.com/hypercore-protocol) and 
[Dat project](https://github.com/datproject) before that) have done an amazing
job on their documentation, I still haven't find any beginner friendly introduction.

So I decided to try already those libraries, by making some simple chat like examples, 
and share what I found, this isn't the beginner guide I was looking for, because I 
can't even assure I would come to something useful, but it's going to be at least 
something fun.

## File structure

I have organized this repo in folders grouped by the main module that I'm testing 
in it, the organization is clear but very opinionated.

## Discovers

### [`hyperswarm`][hyperswarm]

> A high-level API for finding and connecting to peers who are interested in a "topic."

- *minimal*: Here is what I have as a _minimal_ hyperswarm implementation. 
It could be even more minimal by using nodes native crypto module instead of sodium. 
This one was surprisingly easy, but has some drawbacks. When a peer process is killed 
it kills all other peers, this seems to be because I'm connecting directly to the process 
stdio streams.
- *fancy*: This one was a mess. I just tried to make it look like a chat by changing the log, but it seems to be quite difficult to change `process.stdout` as many sites suggest. So this is broken.
- *universal-chat*: This is basically [RangerMauve/hyperswarm-universal-chat][hyperswarm-universal-chat]

## License
[MIT](/license)

[hyperswarm]: https://github.com/hyperswarm/hyperswarm
[hyperswarm-universal-chat]: https://github.com/RangerMauve/hyperswarm-universal-chat