import 'isomorphic-fetch'
const apiUrl = `${process.env.REACT_APP_API_URL}/`

const requestHeaders = {
  'Content-Type': 'application/json'
}

export async function post(action, data) {
  const options = {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify({
      action: action,
      apiKey: process.env.REACT_APP_API_KEY,
      data
    })
  }

  return fetch(apiUrl, options).then((res) => {
    if (res.status >= 400) {
      throw new Error('Bad response from server')
    }
    return res.json()
  })
}
