import React from 'react'

import Async from 'components/Async'
const Balance = Async(() => import('components/users/Balance'))
const Address = Async(() => import('components/users/Address'))
const UserData = Async(() => import('components/users/UserData'))

const Home = () => (
  <div>
    <Address />
    <Balance />
    <UserData />
  </div>
)

export default Home
