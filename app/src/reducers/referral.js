export default (state = [], action) => {
  switch (action.type) {
    case 'IS_REGISTERED_REFERRAL':
      return action.payload
    default:
      return state
  }
}
