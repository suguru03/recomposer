import { ComponentClass, ComponentType } from 'react';
import {
  compose,
  mapProps,
  withState,
  withStateHandlers,
  onlyUpdateForKeys,
  pure,
  mapper,
  StateHandlerMap,
  StateUpdaters,
} from 'recompose';

export type StateUpdaterMap<InnerState, UpdaterKey extends string> = Pick<
  StateHandlerMap<InnerState>,
  UpdaterKey
>;

export class Recomposer<
  OuterProps extends object = {},
  InnerProps extends object = OuterProps,
  InnerState extends object = InnerProps,
  InnerStateUpdaterMap extends StateHandlerMap<InnerState> = {},
  ActualOuterProps extends object = OuterProps,
  ActualInnerProps extends object = InnerProps & InnerState & InnerStateUpdaterMap
> {
  private opts: Function[];
  constructor(opts: Function[] = []) {
    this.opts = opts;
  }

  enhance(Component: ComponentType<ActualInnerProps>): ComponentClass<ActualOuterProps> {
    return compose<ActualInnerProps, ActualOuterProps>(...this.opts)(Component);
  }

  mapProps<IP extends InnerProps = InnerProps>(propsMapper: mapper<OuterProps, IP>): Recomposer {
    return new Recomposer<OuterProps, IP, InnerState, InnerStateUpdaterMap, ActualOuterProps>([
      ...this.opts,
      mapProps<IP, OuterProps>(propsMapper),
    ]);
  }

  withState<
    IS extends InnerState = InnerState,
    ISU extends StateHandlerMap<IS> &
      StateUpdaterMap<InnerState, Extract<keyof InnerStateUpdaterMap, string>> = StateUpdaterMap<
      IS,
      Extract<keyof InnerStateUpdaterMap, string>
    >
  >(
    stateName: Extract<keyof IS, string>,
    stateUpdaterName: Extract<keyof ISU, string>,
    initialState: IS[keyof IS] | mapper<OuterProps, IS[keyof IS]>,
  ) {
    return new Recomposer<OuterProps & IS & ISU, InnerProps, IS, ISU, ActualOuterProps>([
      ...this.opts,
      withState<OuterProps, IS[keyof IS], Extract<keyof IS, string>, Extract<keyof ISU, string>>(
        stateName,
        stateUpdaterName,
        initialState,
      ),
    ]);
  }

  withStateHandlers<
    IS extends InnerState = InnerState,
    ISU extends StateHandlerMap<IS> = StateHandlerMap<IS>
  >(createProps: IS | mapper<OuterProps, IS>, stateUpdaters: StateUpdaters<OuterProps, IS, ISU>) {
    return new Recomposer<OuterProps & IS & ISU, InnerProps, IS, ISU, ActualOuterProps>([
      ...this.opts,
      withStateHandlers<IS, ISU, OuterProps>(createProps, stateUpdaters),
    ]);
  }

  onlyUpdateForKeys(keys: Array<keyof ActualInnerProps>): Recomposer {
    return new Recomposer([...this.opts, onlyUpdateForKeys(keys)]);
  }

  pure(): Recomposer {
    return new Recomposer([...this.opts, pure]);
  }
}

export default Recomposer;
