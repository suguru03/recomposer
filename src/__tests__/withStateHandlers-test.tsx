import * as React from 'react';
import { mount } from 'enzyme';

import { Recomposer, StateUpdaterMap } from '../';

/**
 * @see https://github.com/acdlite/recompose/blob/master/src/packages/recompose/__tests__/withStateHandlers-test.js
 */
test('withStateHandlers should persist events passed as argument', () => {
  interface InnerState {
    readonly value: string;
  }
  type InnerStateUpdaterMap = StateUpdaterMap<InnerState, 'onChange'>;
  type Props = InnerState & InnerStateUpdaterMap;

  const Component = ({ value, onChange }: Props) => (
    <div>
      <input type="text" value={value} onChange={onChange} />
      <p>{value}</p>
    </div>
  );
  const initState = { value: '' };
  const stateUpdaterMap = {
    onChange: () => e => ({
      value: e.target.value,
    }),
  };
  const InputComponent = new Recomposer()
    .withStateHandlers<InnerState, InnerStateUpdaterMap>(initState, stateUpdaterMap)
    .enhance(Component);

  const wrapper = mount(<InputComponent />);
  const input = wrapper.find('input');
  const output = wrapper.find('p');
  // having that enzyme simulate does not simulate real situation
  // emulate persist
  input.simulate('change', {
    persist() {
      this.target = { value: 'Yay' };
    },
  });
  expect(output.text()).toBe('Yay');

  input.simulate('change', { target: { value: 'empty' } });
  expect(output.text()).toBe('empty');
});
