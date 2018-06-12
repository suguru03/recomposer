import { ComponentClass, ComponentType } from 'react';
import {
  compose,
  mapProps,
  withProps,
  withState,
  withHandlers,
  withStateHandlers,
  onlyUpdateForKeys,
  pure,
  mapper,
  StateHandler,
  StateHandlerMap,
  StateUpdaters,
  HandleCreators,
  HandleCreatorsFactory,
} from 'recompose';

export { StateHandler };

export type StateUpdaterMap<InnerState, UpdaterKey extends string> = Pick<
  StateHandlerMap<InnerState>,
  UpdaterKey
>;

export type PropsHandler<OuterProps> = (props: OuterProps) => Function;
export type PropsHandlerFactory<OuterProps, HandlerFactoryKey extends string = string> = (
  props: OuterProps,
) => Record<HandlerFactoryKey, PropsHandler<OuterProps>>;
export type PropsHandlerMap<OuterProps, HandlerKey extends string = string> = Record<
  HandlerKey,
  PropsHandler<OuterProps> | PropsHandlerFactory<OuterProps>
>;

export class Recomposer<
  OuterProps extends object = {},
  InnerProps extends object = OuterProps,
  InnerState extends object = InnerProps,
  InnerPropsHanderMap extends PropsHandlerMap<OuterProps> = {},
  InnerStateUpdaterMap extends StateHandlerMap<InnerState> = {},
  ActualOuterProps extends object = OuterProps,
  ActualInnerProps extends object = InnerProps &
    InnerState &
    InnerPropsHanderMap &
    InnerStateUpdaterMap
> {
  private opts: Function[];
  constructor(opts: Function[] = []) {
    this.opts = opts;
  }

  enhance(Component: ComponentType<ActualInnerProps>): ComponentClass<ActualOuterProps> {
    return compose<ActualInnerProps, ActualOuterProps>(...this.opts)(Component);
  }

  mapProps<IP extends InnerProps = InnerProps>(propsMapper: mapper<OuterProps, IP>) {
    return new Recomposer<
      OuterProps,
      IP,
      InnerState,
      InnerPropsHanderMap,
      InnerStateUpdaterMap,
      ActualOuterProps
    >([...this.opts, mapProps<IP, OuterProps>(propsMapper)]);
  }

  withProps<IP extends InnerProps & OuterProps = InnerProps & OuterProps>(
    propsMapper: IP | mapper<OuterProps, IP>,
  ) {
    return new Recomposer<
      IP,
      IP,
      InnerState,
      InnerPropsHanderMap,
      InnerStateUpdaterMap,
      ActualOuterProps
    >([...this.opts, withProps<IP, OuterProps>(propsMapper)]);
  }

  withState<
    IS extends InnerState = InnerState,
    ISU extends StateHandlerMap<IS> &
      StateUpdaterMap<InnerState, Extract<keyof InnerStateUpdaterMap, string>> = StateUpdaterMap<
      IS,
      Extract<keyof InnerStateUpdaterMap, string>
    >
  >(
    stateName: keyof IS,
    stateUpdaterName: keyof ISU,
    initialState: IS[keyof IS] | mapper<OuterProps, IS[keyof IS]>,
  ) {
    return new Recomposer<
      OuterProps & IS & ISU,
      InnerProps,
      IS,
      InnerPropsHanderMap,
      ISU,
      ActualOuterProps
    >([
      ...this.opts,
      withState<OuterProps, IS[keyof IS], string, string>(
        stateName as string,
        stateUpdaterName as string,
        initialState,
      ),
    ]);
  }

  withHandlers<IH extends InnerPropsHanderMap = InnerPropsHanderMap>(
    handlerCreators: HandleCreators<OuterProps, IH> | HandleCreatorsFactory<OuterProps, IH>,
  ) {
    return new Recomposer<
      OuterProps & IH,
      InnerProps,
      InnerState,
      IH,
      InnerStateUpdaterMap,
      ActualOuterProps
    >([...this.opts, withHandlers<OuterProps, IH>(handlerCreators)]);
  }

  withStateHandlers<
    IS extends InnerState = InnerState,
    ISU extends StateHandlerMap<IS> &
      StateUpdaterMap<InnerState, Extract<keyof InnerStateUpdaterMap, string>> = StateUpdaterMap<
      IS,
      Extract<keyof InnerStateUpdaterMap, string>
    >
  >(createProps: IS | mapper<OuterProps, IS>, stateUpdaters: StateUpdaters<OuterProps, IS, ISU>) {
    return new Recomposer<
      OuterProps & IS & ISU,
      InnerProps,
      IS,
      InnerPropsHanderMap,
      ISU,
      ActualOuterProps
    >([...this.opts, withStateHandlers<IS, ISU, OuterProps>(createProps, stateUpdaters)]);
  }

  onlyUpdateForKeys(keys: Array<keyof ActualInnerProps>) {
    return new Recomposer([...this.opts, onlyUpdateForKeys(keys)]);
  }

  pure() {
    return new Recomposer([...this.opts, pure]);
  }
}

export default Recomposer;
