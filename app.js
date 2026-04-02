const express = require('express')
const http = require('http')
const { WebSocketServer } = require('ws')

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

const wsServer = new WebSocketServer({ server })

wsServer.on('connection', (ws) => {
  const numClients = wsServer.clients.size
  console.log(`Clients connected: ${numClients}`)
  wsServer.broadcast(`Current visitors: ${numClients}`)

  if (ws.readyState === ws.OPEN) ws.send('Welcome!')

  ws.on('close', () => {
    console.log('A client has disconnected')
    wsServer.broadcast(`Current visitors: ${wsServer.clients.size}`)
  })

  ws.on('error', console.error);
})

/**
 * Broadcast data to all connected clients
 * @param {Object} data
 * @void
 */
wsServer.broadcast = (data) => {
  console.log('Broadcasting: ', data)
  wsServer.clients.forEach((client) => {
    client.send(data)
  })
}
