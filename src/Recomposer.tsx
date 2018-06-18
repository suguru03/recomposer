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

export type PropsHandler = (...args: any[]) => any;
export type PropsHandlerMap<HandlerKey extends string = string> = Record<HandlerKey, PropsHandler>;

export class Recomposer<
  OuterProps extends object = {},
  InnerProps extends object = OuterProps,
  InnerState extends object = {}
> {
  private opts: Function[];
  constructor(opts: Function[] = []) {
    this.opts = opts;
  }

  enhance(Component: ComponentType<InnerProps & InnerState>): ComponentClass<OuterProps> {
    return compose<InnerProps & InnerState, OuterProps>(...this.opts)(Component);
  }

  mapProps<NextProps extends object = InnerProps>(propsMapper: mapper<InnerProps, NextProps>) {
    return new Recomposer<OuterProps, NextProps, InnerState>([
      ...this.opts,
      mapProps<NextProps, InnerProps>(propsMapper),
    ]);
  }

  withProps<NextProps extends object = InnerProps>(
    propsMapper: NextProps | mapper<InnerProps, NextProps>,
  ) {
    return new Recomposer<OuterProps, NextProps, InnerState>([
      ...this.opts,
      withProps<NextProps, InnerProps>(propsMapper),
    ]);
  }

  withPropsOnChange<NextProps extends object = InnerProps>(
    shouldMapOrKeys: Array<Extract<keyof InnerProps, string>> | predicateDiff<InnerProps>,
    propsMapper: mapper<InnerProps, NextProps>,
  ) {
    return new Recomposer<OuterProps, NextProps, InnerState>([
      ...this.opts,
      withPropsOnChange<NextProps, InnerProps>(shouldMapOrKeys, propsMapper),
    ]);
  }

  withHandlers<HandlerKey extends string = string>(
    handlerCreators:
      | HandleCreators<InnerProps, PropsHandlerMap<HandlerKey>>
      | HandleCreatorsFactory<InnerProps, PropsHandlerMap<HandlerKey>>,
  ) {
    return new Recomposer<OuterProps, InnerProps & PropsHandlerMap<HandlerKey>, InnerState>([
      ...this.opts,
      withHandlers<InnerProps, PropsHandlerMap<HandlerKey>>(handlerCreators),
    ]);
  }

  defaultProps<NextProps extends object = InnerProps>(props: NextProps) {
    return new Recomposer<OuterProps, NextProps, InnerState>([
      ...this.opts,
      defaultProps<NextProps>(props),
    ]);
  }

  renameProp<OldName extends Extract<keyof InnerProps, string>, NewName extends string>(
    oldName: OldName,
    newName: NewName,
  ) {
    return new Recomposer<
      OuterProps,
      Omit<InnerProps, OldName> & Record<NewName, InnerProps[OldName]>,
      InnerState
    >([...this.opts, renameProp(oldName, newName)]);
  }

  withState<TState, TStateName extends string, TStateUpdaterName extends string>(
    stateName: TStateName,
    stateUpdaterName: TStateUpdaterName,
    initialState: TState | mapper<InnerProps, TState>,
  ) {
    return new Recomposer<
      OuterProps,
      InnerProps & Record<TStateName, TState> & Record<TStateUpdaterName, StateUpdater<TState>>,
      InnerState & Record<TStateName, TState>
    >([
      ...this.opts,
      withState<InnerProps, TState, TStateName, TStateUpdaterName>(
        stateName,
        stateUpdaterName,
        initialState,
      ),
    ]);
  }

  withStateHandlers<NextState extends InnerState = InnerState, HandlerKey extends string = string>(
    createProps: NextState | mapper<InnerProps, NextState>,
    stateUpdaters: StateUpdaters<
      InnerProps,
      NextState,
      Pick<StateHandlerMap<NextState>, HandlerKey>
    >,
  ) {
    return new Recomposer<
      OuterProps,
      InnerProps & NextState & Pick<StateHandlerMap<NextState>, HandlerKey>,
      NextState
    >([
      ...this.opts,
      withStateHandlers<NextState, Pick<StateHandlerMap<NextState>, HandlerKey>, InnerProps>(
        createProps,
        stateUpdaters,
      ),
    ]);
  }

  onlyUpdateForKeys<
    Keys extends Extract<Array<keyof InnerProps & InnerState>, string> = Extract<
      Array<keyof InnerProps & InnerState>,
      string
    >
  >(keys: Keys) {
    return new Recomposer<OuterProps, InnerProps, InnerState>([
      ...this.opts,
      onlyUpdateForKeys<Keys>(keys),
    ]);
  }

  pure() {
    return new Recomposer<OuterProps, InnerProps, InnerState>([...this.opts, pure]);
  }
}
