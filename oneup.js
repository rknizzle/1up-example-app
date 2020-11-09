const axios = require('axios')

// create a new user in the 1up platform
function createUser(username) {
  return axios({
    method: 'POST',
    validateStatus: () => true,
    url: 'https://api.1up.health/user-management/v1/user',
    data: {
      app_user_id: user,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    }
  })
  .then((res) => {
    if (res.data.success) {
      return res.data
    } else {
      throw new Error(`createUser failed with status code ${res.status} and error ${res.data.error}`)
    }
  })
}

// get an auth code for a 1up user that can be exchanged for an access token
function getAuthCodeForExistingUser(userId) {
  return axios({
    method: 'POST',
    validateStatus: () => true,
    url: 'https://api.1up.health/user-management/v1/user/auth-code',
    data: {
      app_user_id: userId,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    }
  })
  .then((res) => {
    if (res.data.success) {
      return res.data
    } else {
      throw new Error(`getAuthCodeForExistingUser failed with status code ${res.status} and error: '${res.data.error}'`)
    }
  })
}

// trade an auth code for an access and refresh token to access the 1up API
function getAccessToken(code) {
  return axios({
    method: 'POST',
    validateStatus: () => true,
    url: 'https://api.1up.health/fhir/oauth2/token',
    data: {
      code: code,
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    }
  })
  .then((res) => {
    if (res.status === 200) {
      return res.data
    } else {
      throw new Error(`getAccessToken failed with status code ${res.status} and error: '${res.data.error}'`)
    }
  })
}

// get a new access token using the refresh token
function refreshAccessToken(refreshToken) {
  return axios({
    method: 'POST',
    validateStatus: () => true,
    url: 'https://api.1up.health/fhir/oauth2/token',
    data: {
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    }
  })
  .then((res) => {
    if (res.status === 200) {
      return res.data
    } else {
      throw new Error(`refreshAccessToken failed with status code ${res.status} and error ${res.data.error}`)
    }
  })
}

// get the ID of the current patient
function getPatientId(accessToken) {
  return axios({
    method: 'GET',
    validateStatus: () => true,
    url: 'https://api.1up.health/fhir/dstu2/patient',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    }
  })
  .then((res) => {
    if (res.status === 200) {
      return res.data
    } else {
      throw new Error(`getPatientId failed with status code ${res.status} and error ${res.data.error}`)
    }
  })
}

// get a single page of fhir data for a patient
function getFhirDataPage(accessToken, fhirVersion, patientId, nextUrl) {
  if (nextUrl) {
    url = nextUrl
  } else {
    url = `https://api.1up.health/fhir/${fhirVersion}/Patient/${patientId}/$everything`
  }

  return axios({
    method: 'GET',
    validateStatus: () => true,
    url: url,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    }
  })
  .then((res) => {
    if (res.status === 200) {
      return res.data
    } else {
      throw new Error(`getFhirPageData failed with status code ${res.status} and error ${res.data.error}`)
    }
  })
}

async function getAllFhirData(accessToken, fhirVersion, patientId) {
  let allData = []
  let res
  let nextUrl = undefined

  do {
    // get a page of FHIR data
    res = await getFhirDataPage(accessToken, fhirVersion, patientId, nextUrl)

    // add the data to the full list of patient data
    allData = [].concat(allData, res.entry)

    // if theres a link in the response, there are no more resources to fetch
    moreResourcesRemaining = res.link

    // if there are more resources to fetch, get the next url
    if (moreResourcesRemaining) nextUrl = res.link[1].url

  } while (moreResourcesRemaining)

  return allData
}

module.exports = {
  createUser,
  getAccessToken,
  getAllFhirData,
  getAuthCodeForExistingUser,
  getPatientId,
  refreshAccessToken,
}
