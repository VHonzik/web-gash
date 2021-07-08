export { CommandColored, Terminal } from "./Gash";
export * from "./components/Line";
export { Colored, ColoredProps } from "./components/Colored";
export { default as ICommand, AutoCompleteResultType, AutoCompleteResult, ParsingFailureReason, ParsingResult} from './ICommand';
export * from './Parsers';

import { Gash } from './Gash';
export default Gash;