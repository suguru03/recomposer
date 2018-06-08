import * as React from 'react';
import * as r from 'recompose';

const noop = () => {}; // tslint:disable-line:no-empty

export class Recomposer<
    OuterProps extends object = {},
    InnerProps extends object = OuterProps,
    InnerState extends object = InnerProps,
    InnerStateUpdaters extends r.StateHandlerMap<InnerState> = {},
    Props extends object = InnerProps & InnerState & InnerStateUpdaters
> {
    private opts: {
        withStateHandlers?: {
            createProps: InnerState | r.mapper<OuterProps, InnerState>;
            stateUpdaters: InnerStateUpdaters;
        };
        onlyUpdateForKeys?: Array<keyof Props>;
    } = {};

    enhance(Component: React.ComponentType<Props>) {
        const { withStateHandlers, onlyUpdateForKeys } = this.opts;
        return r.compose(
            withStateHandlers
                ? r.withStateHandlers<InnerState, InnerStateUpdaters, OuterProps>(
                      withStateHandlers.createProps,
                      withStateHandlers.stateUpdaters ? withStateHandlers.stateUpdaters : ({} as any),
                  )
                : noop,
            onlyUpdateForKeys ? r.onlyUpdateForKeys(onlyUpdateForKeys) : r.pure,
        )(Component);
    }

    withStateHanlders(
        createProps: InnerState | r.mapper<OuterProps, InnerState>,
        stateUpdaters: InnerStateUpdaters,
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
