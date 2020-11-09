require('dotenv').config()
const express = require('express')
const app = express()
const session = require('express-session')
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(session({ secret: 'secret' }))
app.use(express.urlencoded({
  extended: true
}))

const oneup = require('./oneup.js')

app.get('/', async (req, res) => {
  res.render('login.ejs')
})

app.post('/login', async (req, res) => {
  let accessCode = await oneup.createOrGetUser(req.body.username)
  result = await oneup.getAccessToken(accessCode)

  // store the access token in a session to access patient data later
  req.session.oneUpAccessToken = result.access_token

  // Check if this user is already signed into cerner
  let patient = await oneup.getPatient(req.session.oneUpAccessToken)

  let cernerSystemId = 4707
  if (patient.entry.length < 1) {
    res.redirect(`https://quick.1up.health/connect/${cernerSystemId}?access_token=${result.access_token}`)
  } else {
    req.session.patientId = patient.entry[0].resource.id
    res.redirect('/dashboard')
  }
})

app.get('/callback', async (req, res) => {
  let patient = await oneup.getPatient(req.session.oneUpAccessToken)
  req.session.patientId = patient.entry[0].resource.id
  res.redirect('/dashboard')
})

app.get('/dashboard', async (req, res) => {
  const data = await oneup.getAllFhirData(req.session.oneUpAccessToken, 'dstu2', req.session.patientId)
  res.render('dashboard.ejs', { data })
})

const port = 8080
app.listen(port, () => {
  console.log(`1Up Example Web Server listening on port ${port}`)
})
