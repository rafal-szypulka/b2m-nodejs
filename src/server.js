'use strict'
const express = require('express')

var health = true;
var msg;

const app = express()
const port = process.env.PORT || 3001

app.get('/', (req, res, next) => {
var delay = Math.round(Math.random() * 400);
  setTimeout(() => {
   res.json({ status: 'ok', transactionTime: delay + 'ms' })
   next()
 }, delay)
})


app.get('/healthz', (req, res, next) => {
  if(health) {
   res.json({ status: 'ok'})
   next()
 } else {
   next(new Error('Application unhealthy'))
 }
})

app.get('/bad-health', (req, res, next) => {
  health = false
  res.json({ status: 'App health set to \'false\''})
  next()
})

app.get('/checkout', (req, res, next) => {
  const paymentMethod = Math.round(Math.random() * 100) > 20 ? 'card' : 'paypal'
  const errorState =  Math.round(Math.random() * 100) > 20 ? 0 : 1
  var delay = Math.round(Math.random() * 100);
  if (errorState) {
    msg = 'RSAP0010E: Severe problem detected'
    next(new Error(msg))
  } else {
    msg = 'RSAP0001I: Transaction OK'
   setTimeout(() => {
    res.json({ status: msg, transactionTime: delay + 'ms' })
    next()
   }, delay)
  }
})

app.use((err, req, res, next) => {
  res.statusCode = 500
  res.json({ error: err.message })
  next()
})

const server = app.listen(port, () => {
  console.log(`btm-node.js app listening on port ${port}!`)
})

process.on('SIGTERM', () => {
  clearInterval(metricsInterval)

  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    process.exit(0)
  })
})
