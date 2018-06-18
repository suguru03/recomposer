import {
  Recomposer as R,
  StateUpdater,
  StateUpdaterMap,
  PropsHandler,
  PropsHandlerMap,
} from './Recomposer';

export { StateUpdater, StateUpdaterMap, PropsHandler, PropsHandlerMap };

// TODO: extends props functions to define OuterProps automatically
export class Recomposer<OuterProps extends object> extends R<OuterProps> {}

export default Recomposer;
