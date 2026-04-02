const express = require('express')
const http = require('http')
const { WebSocketServer } = require('ws')
const sqlite = require('sqlite3')

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

process.on('SIGINT', () => {
  wsServer.clients.forEach((client) => {
    client.close()
  })
  server.close(() => {
    shutdownDB()
  })
})

// WebSocket

const wsServer = new WebSocketServer({ server })

wsServer.on('connection', (ws) => {
  const numClients = wsServer.clients.size
  console.log(`Clients connected: ${numClients}`)
  wsServer.broadcast(`Current visitors: ${numClients}`)

  if (ws.readyState === ws.OPEN) ws.send('Welcome!')

  db.run(`INSERT INTO visitors(count, time) VALUES(${numClients}, datetime('now'))`)

  ws.on('close', () => {
    console.log('A client has disconnected')
    wsServer.broadcast(`Current visitors: ${wsServer.clients.size}`)
  })

  ws.on('error', console.error)
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

// Database

const db = new sqlite.Database(':memory:')

db.serialize(() => {
  db.run(`
    CREATE TABLE visitors(
      count INTEGER,
      time TEXT
    )
  `)
})

const getCounts = () => {
  db.each('SELECT * FROM visitors', (_error, row) => {
    console.log(row)
  })
}

const shutdownDB = () => {
  getCounts()
  console.log('Shutting down db')
  db.close()
}
