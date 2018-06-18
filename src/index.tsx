export * from './Recomposer';
import { Recomposer as R } from './Recomposer';

// TODO: extends props functions to define OuterProps automatically
export class Recomposer<OuterProps extends object> extends R<OuterProps> {}

export default Recomposer;
