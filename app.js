const express = require('express')
const http = require('http')

const PORT = 3000

const app = express()
const server = http.createServer()

app.get('/', (_req, res) => {
  res.sendFile('index.html', { root: __dirname })
})

server.on('request', app)

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})
