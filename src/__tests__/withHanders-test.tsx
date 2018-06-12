import * as React from 'react';
import { mount } from 'enzyme';
import * as sinon from 'sinon';

import { Recomposer } from '../Recomposer';

/**
 * @see https://github.com/acdlite/recompose/blob/master/src/packages/recompose/__tests__/withHandlers-test.js
 */
test('withHandlers passes handlers to base component', () => {
  let submittedFormValue;
  const enhanceForm = new Recomposer()
    // TODO: can not resolve types automatically
    .withState('value', 'updateValue', '')
    .withHandlers({
      onChange: props => event => {
        props.updateValue(event.target.value);
      },
      onSubmit: props => () => {
        submittedFormValue = props.value;
      },
    });

  const Form = enhanceForm.enhance(({ value, onChange, onSubmit }) => (
    <form onSubmit={onSubmit}>
      <label>
        Value
        <input type="text" value={value} onChange={onChange} />
      </label>
      <p>{value}</p>
    </form>
  ));

  const wrapper = mount(<Form />);
  const input = wrapper.find('input');
  const output = wrapper.find('p');
  const form = wrapper.find('form');

  input.simulate('change', { target: { value: 'Yay' } });
  expect(output.text()).toBe('Yay');

  input.simulate('change', { target: { value: 'Yay!!' } });
  expect(output.text()).toBe('Yay!!');

  form.simulate('submit');
  expect(submittedFormValue).toBe('Yay!!');
});

test('withHandlers passes immutable handlers', () => {
  const recomposer = new Recomposer().withHandlers({
    handler: () => () => null,
  });
  const component = sinon.spy(() => null);
  const Div = recomposer.enhance(component);

  const wrapper = mount(<Div />);
  wrapper.setProps({ foo: 'bar' });

  expect(component.calledTwice).toBe(true);
  expect(component.firstCall.args[0].handler).toBe(component.secondCall.args[0].handler);
});

test('withHandlers allow handers to be a factory', () => {
  interface OuterProps {
    hello: string;
  }
  const recomposer = new Recomposer<OuterProps>().withHandlers(initialProps => {
    let cache: any;
    return {
      handler: () => () => {
        if (cache) {
          return cache;
        }
        cache = { ...initialProps };
        return cache;
      },
    };
  });

  const componentHandlers: any[] = [];
  const componentHandlers2: any[] = [];

  const Component = recomposer.enhance(({ handler }) => {
    componentHandlers.push(handler());
    return null;
  });

  const Component2 = recomposer.enhance(({ handler }) => {
    componentHandlers2.push(handler());
    return null;
  });

  const wrapper = mount(<Component hello={'foo'} />);
  wrapper.setProps({ hello: 'bar' });
  expect(componentHandlers[0]).toBe(componentHandlers[1]);

  // check that cache is not shared
  mount(<Component2 hello={'foo'} />);
  expect(componentHandlers[0]).toEqual(componentHandlers2[0]);
  expect(componentHandlers[0]).not.toBe(componentHandlers2[0]);
});
