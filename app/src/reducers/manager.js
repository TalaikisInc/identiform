export default (state = [], action) => {
  switch (action.type) {
    case 'IS_REGISTERED_MANAGER':
      return action.payload
    default:
      return state
  }
}
