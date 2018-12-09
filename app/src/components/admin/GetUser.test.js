import { shallow } from 'enzyme'
import { shallowToJson } from 'enzyme-to-json'

import GetUser from 'components/admin/GetUser'

describe('GetUser', () => {
  it('should render correctly', () => {
    const output = shallow(
      <GetUser />
    )
    expect(shallowToJson(output)).toMatchSnapshot()
    expect(output.state().loading).toEqual(false)
    output.simulate('click')
    expect(output.state().clicked).toEqual(true)
  })
})
