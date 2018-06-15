import React from 'react';
import { mount } from 'enzyme';
import * as sinon from 'sinon';

import { Recomposer } from '../';

/**
 * @see https://github.com/acdlite/recompose/blob/master/src/packages/recompose/__tests__/mapProps-test.js
 */
test('mapProps maps owner props to child props', () => {
  interface InnerProps {
    str: string;
  }
  interface InnerState {
    strings: string[];
  }
  type Props = InnerProps & InnerState;

  // type test
  const Component = ({ str }: Props) => (str ? null : null);
  new Recomposer()
    .withState('strings', 'updateStrings', ['do', 're', 'mi'])
    .mapProps(({ strings, ...rest }) => ({
      ...rest,
      str: strings.join(''),
    }))
    .enhance(Component);

  const component: any = sinon.spy(Component);
  component.displayName = 'component';

  const StringConcat = new Recomposer()
    .withState('strings', 'updateStrings', ['do', 're', 'mi'])
    .mapProps(({ strings, ...rest }) => ({
      ...rest,
      str: strings.join(''),
    }))
    .enhance(component);

  expect(StringConcat.displayName).toBe('withState(mapProps(component))');

  mount(<StringConcat />);
  const { updateStrings } = component.firstCall.args[0];
  updateStrings(strings => [...strings, 'fa']);

  expect(component.firstCall.args[0].str).toBe('doremi');
  expect(component.secondCall.args[0].str).toBe('doremifa');
});
