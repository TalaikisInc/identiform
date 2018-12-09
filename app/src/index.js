import 'babel-core/register'
import 'babel-polyfill'
import React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import assert from 'assert'

import reducers from './reducers'
import App from './containers/App'
// import registerServiceWorker from './registerServiceWorker'
import unregister from './registerServiceWorker'
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore)

assert.equal(typeof process.env.REACT_APP_ENCRYPTION_PASS, 'string', 'We need password!')
assert.equal(typeof process.env.REACT_APP_HASH_PASS, 'string', 'We need hash password!')
assert.equal(typeof process.env.REACT_APP_SLACK_KEY, 'string', 'We need Slack API key!')
assert.equal(typeof process.env.REACT_APP_CHANNEL_ID, 'string', 'We need Chnnel ID!')
assert.equal(typeof process.env.REACT_APP_EMAIL_HOST, 'string', 'We need email host')
assert.equal(typeof process.env.REACT_APP_EMAIL_USER, 'string', 'We need email user!')
assert.equal(typeof process.env.REACT_APP_EMAIL_PASSWORD, 'string', 'We need email password!')
assert.equal(typeof process.env.REACT_APP_API_URL, 'string', 'We need API url!')

window.addEventListener('error', e => {
  fetch('/errors', {
    method: 'POST',
    body: `${e.message} (in ${e.filename} ${e.lineno}:${e.colno})`
  })
})

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <App />
  </Provider>,
  document.getElementById('root')
)

// registerServiceWorker()
unregister()
