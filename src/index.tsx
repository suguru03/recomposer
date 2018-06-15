export * from './Recomposer';
import { Recomposer as R } from './Recomposer';

export class Recomposer<OuterProps extends object> extends R<OuterProps> {}

export default Recomposer;
