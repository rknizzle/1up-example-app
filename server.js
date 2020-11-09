require('dotenv').config()
const express = require('express')
const app = express()
const session = require('express-session')
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(session({ secret: 'secret' }))

const oneup = require('./oneup.js')

// TODO: login

app.get('/', async (req, res) => {
  // For now just immediately pull up the quick connect page upon loading the website as an example
  // 1up user that has previously been created.
  let result = await oneup.getAuthCodeForExistingUser('example1')
  accessCode = result.code
  result = await oneup.getAccessToken(accessCode)

  // store the access token in a session to access patient data later
  req.session.oneUpAccessToken = result.access_token

  let cernerSystemId = 4707
  res.redirect(`https://quick.1up.health/connect/${cernerSystemId}?access_token=${result.access_token}`)
})

app.get('/callback', async (req, res) => {
  const data = await oneup.getAllFhirData(req.session.oneUpAccessToken, 'dstu2', 'e467f71f186f')
  res.render('dashboard.ejs', { data })
})

const port = 8080
app.listen(port, () => {
  console.log(`1Up Example Web Server listening on port ${port}`)
})
