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

module.exports = {
  createUser,
  getAuthCodeForExistingUser,
}
