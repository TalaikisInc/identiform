import { post } from 'utils/api'

const encrypt = async (account, text) => {
  const body = {
    pathname: process.env.REACT_APP_PATHNAME,
    user: account,
    text
  }
  const res = await post('KEYS_ENCRYPT_ECDH', body)
  return res
}

export default encrypt
