import { userStates, roles } from 'utils/data'

export async function stateMap(res) {
  let label
  userStates.map(async (e) => {
    if (e.value === res.toNumber()) {
      label = e.label
    }
  })
  return label
}

export async function roleMap(res) {
  let label
  roles.map(async (e) => {
    if (e.value === res.toNumber()) {
      label = e.label
    }
  })
  return label
}
