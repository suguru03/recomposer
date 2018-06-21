import React from 'react';
import { mount } from 'enzyme';

import { Recomposer } from '../';

/**
 * @see https://github.com/acdlite/recompose/blob/master/src/packages/recompose/__tests__/branch-test.js
 */
test('branch tests props and applies one of two HoCs, for true and false', () => {
  const SayMyName = new Recomposer()
    .withState('isBad', 'updateIsBad', false)
    .branch(
      props => props.isBad,
      new Recomposer().withProps({ name: 'Heisenberg' }),
      new Recomposer().withProps({ name: 'Walter' }),
    )
    .enhance(({ isBad, name, updateIsBad }) => (
      <div>
        <div className="isBad">{isBad ? 'true' : 'false'}</div>
        <div className="name">{name}</div>
        <button onClick={() => updateIsBad(b => !b)}>Toggle</button>
      </div>
    ));

  expect(SayMyName.displayName).toBe('withState(branch(Component))');

  const wrapper = mount(<SayMyName />);
  const getIsBad = () => wrapper.find('.isBad').text();
  const getName = () => wrapper.find('.name').text();
  const toggle = wrapper.find('button');

  expect(getIsBad()).toBe('false');
  expect(getName()).toBe('Walter');

  toggle.simulate('click');

  expect(getIsBad()).toBe('true');
  expect(getName()).toBe('Heisenberg');
});
