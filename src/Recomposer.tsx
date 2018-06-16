import { ComponentClass, ComponentType } from 'react';
import {
  compose,
  mapProps,
  withProps,
  withPropsOnChange,
  withHandlers,
  defaultProps,
  renameProp,
  withState,
  withStateHandlers,
  onlyUpdateForKeys,
  pure,
  mapper,
  predicateDiff,
  StateHandler,
  StateHandlerMap,
  StateUpdaters,
  HandleCreators,
  HandleCreatorsFactory,
} from 'recompose';

export { StateHandler };

export type Omit<T, K extends keyof T> = Pick<
  T,
  ({ [P in keyof T]: P } & { [P in K]: never } & { [x: string]: never })[keyof T]
>;
export type StateUpdater<TState> = (state: TState) => TState;
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
  InnerState extends object = {},
  InnerPropsHanderMap extends PropsHandlerMap<InnerProps> = {},
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

  mapProps<IP extends object = InnerProps>(propsMapper: mapper<OuterProps, IP>) {
    return new Recomposer<
      OuterProps,
      IP,
      InnerState,
      PropsHandlerMap<IP>,
      InnerStateUpdaterMap,
      ActualOuterProps
    >([...this.opts, mapProps<IP, OuterProps>(propsMapper)]);
  }

  withProps<IP extends object = InnerProps>(propsMapper: IP | mapper<OuterProps, IP>) {
    return new Recomposer<
      IP,
      IP,
      InnerState,
      PropsHandlerMap<IP>,
      InnerStateUpdaterMap,
      ActualOuterProps
    >([...this.opts, withProps<IP, OuterProps>(propsMapper)]);
  }

  withPropsOnChange<IP extends object = InnerProps>(
    shouldMapOrKeys:
      | Array<Extract<keyof ActualOuterProps, string>>
      | predicateDiff<ActualOuterProps>,
    propsMapper: mapper<ActualOuterProps, IP>,
  ) {
    return new Recomposer<
      IP,
      IP,
      InnerState,
      PropsHandlerMap<IP>,
      InnerStateUpdaterMap,
      ActualOuterProps
    >([...this.opts, withPropsOnChange<IP, ActualOuterProps>(shouldMapOrKeys, propsMapper)]);
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

  defaultProps<IP extends object = InnerProps>(props: IP) {
    return new Recomposer<
      IP,
      IP,
      InnerState,
      PropsHandlerMap<IP>,
      InnerStateUpdaterMap,
      ActualOuterProps
    >([...this.opts, defaultProps<IP>(props)]);
  }

  renameProp<OldName extends Extract<keyof OuterProps, string>, NewName extends string>(
    oldName: OldName,
    newName: NewName,
  ) {
    return new Recomposer<
      Omit<OuterProps, OldName> & Record<NewName, OuterProps[OldName]>,
      InnerState,
      PropsHandlerMap<Omit<OuterProps, OldName> & Record<NewName, OuterProps[OldName]>>,
      InnerStateUpdaterMap,
      ActualOuterProps
    >([...this.opts, renameProp(oldName, newName)]);
  }

  withState<TState, TStateName extends string, TStateUpdaterName extends string>(
    stateName: TStateName,
    stateUpdaterName: TStateUpdaterName,
    initialState: TState | mapper<OuterProps, TState>,
  ) {
    return new Recomposer<
      OuterProps & Record<TStateName, TState> & Record<TStateUpdaterName, StateUpdater<TState>>,
      InnerProps,
      InnerState & Record<TStateName, TState>,
      InnerPropsHanderMap,
      StateHandlerMap<InnerState & Record<TStateName, TState>> &
        Record<TStateUpdaterName, StateUpdater<TState>>,
      ActualOuterProps
    >([
      ...this.opts,
      withState<OuterProps, TState, TStateName, TStateUpdaterName>(
        stateName,
        stateUpdaterName,
        initialState,
      ),
    ]);
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
    return new Recomposer<
      OuterProps,
      InnerProps,
      InnerState,
      InnerPropsHanderMap,
      InnerStateUpdaterMap,
      ActualOuterProps
    >([...this.opts, onlyUpdateForKeys(keys)]);
  }

  pure() {
    return new Recomposer<
      OuterProps,
      InnerProps,
      InnerState,
      InnerPropsHanderMap,
      InnerStateUpdaterMap,
      ActualOuterProps
    >([...this.opts, pure]);
  }
}
