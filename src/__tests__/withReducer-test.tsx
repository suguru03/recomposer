import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';

import { Recomposer } from '../';

const SET_COUNTER = 'SET_COUNTER';

/**
 * @see https://github.com/acdlite/recompose/blob/master/src/packages/recompose/__tests__/withReducer-test.js
 */
test('adds a stateful value and a function for updating it', () => {
  const component: any = sinon.spy(() => null);
  component.displayName = 'component';

  interface State {
    counter: number;
  }
  const initialState: State = { counter: 0 };

  const reducer = (state: State, action) =>
    action.type === SET_COUNTER ? { counter: action.payload } : state;

  const Counter = new Recomposer()
    .withReducer('state', 'dispatch', reducer, initialState)
    .flattenProp('state')
    .enhance(component);

  expect(Counter.displayName).toBe('withReducer(flattenProp(component))');

  mount(<Counter />);
  const { dispatch } = component.firstCall.args[0];

  expect(component.lastCall.args[0].counter).toBe(0);

  dispatch({ type: SET_COUNTER, payload: 18 });
  expect(component.lastCall.args[0].counter).toBe(18);
});
