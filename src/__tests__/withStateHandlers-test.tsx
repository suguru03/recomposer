import * as React from 'react';
import { mount } from 'enzyme';
// import * as sinon from 'sinon';

import { Recomposer, StateUpdaterMap } from '../Recomposer';

test('withStateHandlers should persist events passed as argument', () => {
  interface OuterProps {}
  type InnerProps = OuterProps;
  interface InnerState {
    readonly value: string;
  }
  type InnerStateUpdaterMap = StateUpdaterMap<InnerState, 'onChange'>;
  type Props = InnerProps & InnerState & InnerStateUpdaterMap;

  const Component = ({ value, onChange }: Props) => (
    <div>
      <input type="text" value={value} onChange={onChange} />
      <p>{value}</p>
    </div>
  );
  const InputComponent = new Recomposer<OuterProps, InnerProps, InnerState, InnerStateUpdaterMap>()
    .withStateHandlers(
      { value: '' },
      {
        onChange: () => e => ({
          value: e.target.value,
        }),
      },
    )
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
