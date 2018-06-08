import { ComponentClass, ComponentType } from 'react';
import * as r from 'recompose';

const noop = () => {}; // tslint:disable-line:no-empty

export type StateUpdaterMap<InnerState, UpdaterKey extends string> = Pick<
  r.StateHandlerMap<InnerState>,
  UpdaterKey
>;

export class Recomposer<
  OuterProps extends object = {},
  InnerProps extends object = OuterProps,
  InnerState extends object = InnerProps,
  InnerStateUpdaterMap extends r.StateHandlerMap<InnerState> = {},
  Props extends object = InnerProps & InnerState & InnerStateUpdaterMap
> {
  private opts: {
    withStateHandlers?: {
      createProps: InnerState | r.mapper<OuterProps, InnerState>;
      stateUpdaters: r.StateUpdaters<OuterProps, InnerState, InnerStateUpdaterMap>;
    };
    onlyUpdateForKeys?: Array<keyof Props>;
  } = {};

  enhance(Component: ComponentType<Props>): ComponentClass<OuterProps> {
    const { withStateHandlers, onlyUpdateForKeys } = this.opts;
    return r.compose<Props, OuterProps>(
      withStateHandlers
        ? r.withStateHandlers<InnerState, InnerStateUpdaterMap, OuterProps>(
            withStateHandlers.createProps,
            withStateHandlers.stateUpdaters,
          )
        : noop,
      onlyUpdateForKeys ? r.onlyUpdateForKeys(onlyUpdateForKeys) : r.pure,
    )(Component);
  }

  withStateHanlders(
    createProps: InnerState | r.mapper<OuterProps, InnerState>,
    stateUpdaters: r.StateUpdaters<OuterProps, InnerState, InnerStateUpdaterMap>,
  ): this {
    this.opts.withStateHandlers = { createProps, stateUpdaters };
    return this;
  }

  onlyUpdateForKeys(keys: Array<keyof Props>) {
    this.opts.onlyUpdateForKeys = keys;
    return this;
  }
}

export default Recomposer;
