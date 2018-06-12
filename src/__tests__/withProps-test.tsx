import React from 'react';
import { shallow } from 'enzyme';

import { Recomposer } from '../Recomposer';

const div = props => null;

test('withProps passes additional props to base component', () => {
  const DoReMi = new Recomposer().withProps({ 'data-so': 'do', 'data-la': 'fa' }).enhance(div);

  const div1 = shallow(<DoReMi />).find(div);
  expect(div1.prop('data-so')).toBe('do');
  expect(div1.prop('data-la')).toBe('fa');
});

test('withProps takes precedent over owner props', () => {
  const DoReMi = new Recomposer().withProps({ 'data-so': 'do', 'data-la': 'fa' }).enhance(div);

  const div1 = shallow(<DoReMi data-la="ti" />).find(div);
  expect(div1.prop('data-so')).toBe('do');
  expect(div1.prop('data-la')).toBe('fa');
});

test('withProps should accept function', () => {
  const DoReMi = new Recomposer()
    .withProps(props => ({
      'data-so': props['data-la'],
    }))
    .enhance(div);

  const div1 = shallow(<DoReMi data-la="la" />).find('div');
  expect(div1.prop('data-so')).toBe('la');
});
