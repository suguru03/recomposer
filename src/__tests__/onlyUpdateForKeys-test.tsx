import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';

import { Recomposer } from '../';

/**
 * @see https://github.com/acdlite/recompose/blob/master/src/packages/recompose/__tests__/onlyUpdateForKeys-test.js
 */
test('onlyUpdateForKeys implements shouldComponentUpdate()', () => {
  const component: any = sinon.spy(() => null);
  component.displayName = 'component';

  const Counter = new Recomposer()
    .withState('counter', 'updateCounter', 0)
    .withState('foobar', 'updateFoobar', 'foobar')
    .onlyUpdateForKeys(['counter'])
    .enhance(component);

  expect(Counter.displayName).toBe('withState(withState(onlyUpdateForKeys(component)))');

  mount(<Counter />);
  const { updateCounter, updateFoobar } = component.firstCall.args[0];

  expect(component.lastCall.args[0].counter).toBe(0);
  expect(component.lastCall.args[0].foobar).toBe('foobar');

  // Does not update
  updateFoobar('barbaz');
  expect(component.calledOnce).toBe(true);

  updateCounter(42);
  expect(component.calledTwice).toBe(true);
  expect(component.lastCall.args[0].counter).toBe(42);
  expect(component.lastCall.args[0].foobar).toBe('barbaz');
});
