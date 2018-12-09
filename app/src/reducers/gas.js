export default (state = [], action) => {
  switch (action.type) {
    case 'FETCH_GAS':
      return action.payload
    default:
      return state
  }
}
