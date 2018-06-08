import * as React from 'react';
import { Recomposer, StateUpdaterMap } from './Recomposer';

interface OuterProps {
    value: string;
}

interface InnerProps {
    value: string;
}

interface InnerState {
    open: boolean;
}

type InnerStateUpdaterMap = StateUpdaterMap<InnerState, 'onClick'>;

const initState = ({ value}: OuterProps) => ({ open: !!value });
const stateUpdaterMap = {
    onClick: ({ open }: InnerState) => () => ({})
};

const Component = ({ value, open, onClick }: InnerProps & InnerState & InnerStateUpdaterMap) => (<input value={value} onClick={onClick}/>);

new Recomposer<OuterProps, InnerProps, InnerState, InnerStateUpdaterMap>()
  .withStateHanlders(initState, stateUpdaterMap)
  .onlyUpdateForKeys(['value'])
  .enhance(Component);
