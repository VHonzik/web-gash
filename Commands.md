# Commands and Keywords

Once you have *gash* terminal running, see [README](./README.md) if you need help with setting up *gash* library, you can start implementing your game by adding your own commands and keywords.

Commands are usually short one-word strings player enters into the terminal, via keyboard, and executes by hitting Enter key. They will then perform some game logic and inform the player about the outcome. This sort of interaction works best with games where time is not relevant or discrete, in a sense where each player action takes specified amount of time.

Keywords are not executable as commands but often represent entities in the game. They can serve as parameters to command calls or help explain the game logic and story via `man` command.

## Commands

Commands in the eyes of *gash* are objects that implement `ICommand` interface and that are registered through `Gash.registerCommand()`. Here is how a registered command might look like, bar any implementation:

```js
import Gash, { AutoCompleteResult, ICommand, ParsingResult } from "web-gash";

// Can be placed pretty much anywhere as long the register call below can see it
class ScanCommand implements ICommand {
  name: string = 'scan';

  parse(line: string): ParsingResult {
    // TODO implementation, see below
  }
  autocomplete(line: string): AutoCompleteResult {
    // TODO implementation, see below
  }
  printManPage(): void {
    // TODO implementation, see below
  }
  available(): boolean {
    return true;
  }
}

// Can be for example called right after `Gash.init()`
Gash.registerCommand(new StatusCommand());
```

### name

The `name` property is meant to be what user has to type to invoke the command and is used as such by *gash* parsers, more on them later, and built-in `man` and `list` commands.

### parse()

The `parse()` method of each registered command will be called in a loop when users enters a `line` and submits it with Enter key. The order of the loop is the same as order of the commands registration. The loop breaks as soon as a command returns `ParsingResult.success === true` or `ParsingResult.success === false` with `ParsingResult.failureReason !== ParsingFailureReason.WrongCommand`. The commands themselves are responsible to "parse" the input line and tell *gash* if the input line matches the command syntax and if it is valid call. While this puts the burden of parsing on each command, it allows more flexibility and does not impose any particular command grammar on the *gash* library. In addition, *gash* provides solid built-in parser combinators so implementing `parse()` method should be very simple in most scenarios. Let's look at an example:

```js
import Gash, { AutoCompleteResult, ICommand, CommandAutoCompleter, CommandColored, CommandParser, CommandParserResult, Line, NumberParameter, ParsingResult, TextParameter } from "web-gash";

class ScanCommand implements ICommand {

  // ...

  parse(line: string): ParsingResult {
    const paramsParsers = NumberParameter().then(NumberParameter()).then(TextParameter());
    const result = CommandParser(this, paramsParsers).parse(line);
    if (result.success) {
      const firstParam: number = parseInt(result.params[0]);
      const secondParam: number = parseInt(result.params[1]);
      const thirdParam: string = result.params[2];

      // Perform validation of the parameters values while informing the player if they are invalid
      if (firstParam <= 0.0) {
        Gash.writeLine(<Line systemMessage><CommandColored>scan</CommandColored> only accepts positive first parameter.</Line>);
        Gash.writeLine(<Line />);
      } else {
        // Execute the command game logic
        // ...
      }
    }
    return result;
  }

  // ...
}
```

Feel free to browse the comments on `CommandParser` and related parser interfaces and if you are not familiar with the functional parser combinators I would recommend looking into that topic, it's an interesting one. A good place to start might be the documentations of [masala parser](https://github.com/masala/masala-parser) which the *gash* library is using under the hood. You can also implement your own parsers by implementing `LowLevelParser` interface but that is outside of the scope of this guide.

Note that `CommandParser` does impose a grammar on the commands, roughly `commandBody options parameters` in that order. The `commandBody` will simply parse the input line for `ICommand.name`. Options take two forms, short or long. Short form is one letter prefixed by `-` such as `-a`. Multiple short options can be combined together, for example `-bf` are two options `b` and `f`. Long form is prefixed by `--` and can be multiple words separated by single `-` such as `--foo-bar`. Options are always optional, wink, but unknown option will result in a parsing failure. Parameters are defined by a chain of `LowLevelParser` including "high-order" parsers such as `.then()`, `.or()`, `.optional()`, `.repeat()`.

As mentioned before the implementations of the commands decide if the input line matches the command syntax. *gash* only looks at the resulting `ParsingResult` and acts in the following scenarios:
 - Not one command succeeded and all the commands returned `ParsingFailureReason.WrongCommand` as the reason for the failure
 - Any command fails and returns `ParsingFailureReason.MissingParam` as the reason
 - Any command fails and returns `ParsingFailureReason.UnrecognizedOption` as the reason

In all these cases a an error message is presented to the player and nothing happens.

As you can see in the above example *gash* also does not call the command back if it succeeds. It's up to to the command implementation to perform the game logic inside the `parse()` method if it deems the input line matching and all parameters have valid values. That is important concept so let me stress it out:

**Command itself knows if the input line matches its syntax so the actual command execution should be done in the `parse()` method itself.**

A common pattern that emerges from this, which can also be seen in the above example, `const result = CommandParser(...).parse(line);` => `if (result.success)` => check the parameters => if all looks good, execute the command => finally `return result;`.

### autocomplete()

Auto-completion is similar scenario to `parse()` method but less complicated. *gash* once again calls all registered commands `autocomplete()` methods when the player presses Tab key. However, there are no early breaks this time around. If there is only one command that returned `AutoCompleteResultType.SingleMatchFound` or `AutoCompleteResultType.MultipleMatchesFound` the input line will be replaced by the `AutoCompleteResult.fixedValue`. Of course, helper parsers for auto-completion are also provided. Here is an example:

```js
import Gash, { AutoCompleteKeywords, AutoCompleteNumber, AutoCompleteResult, ICommand, CommandAutoCompleter } from "web-gash";

class ScanCommand implements ICommand {

  // ...

  autocomplete(line: string): AutoCompleteResult {
    const keywords:IKeyword[] =  [ /* ... */ ];
    return CommandAutoCompleter(this, AutoCompleteNumber().then(AutoCompleteNumber()).then(AutoCompleteKeywords(keywords))).autocomplete(line);
  }

  // ...
}
```

What's noteworthy is that unlike in the `parse()` method where we are parsing parameters as generic strings and only afterwards check their values, auto-completion is usually only done for a set of known values. In this case specifically a collection of `IKeyword`s. The same recommendation about combinator parsers apply for the `autocomplete()` but note that the auto-completion parsers are not as powerful as `parse()` parsers.

### printManPage()

This method is called by *gash* when player calls the built-in `man` command with the user command `name` property, e.g. `man scan`. While it is totally up to the user to print any information about the command, the built-in commands `man` and `list` use `Gash.writeManPage` which outputs a pre-formatted manual page and it is recommended to use it for the user commands as well:

```js
import Gash, { Colored, CommandColored, ICommand, Line } from "web-gash";

class ScanCommand implements ICommand {

  // ...

  printManPage(): void {
    Gash.writeManPage(this, [
      <Line systemMessage><CommandColored>{this.name}</CommandColored> <Colored background={someColor} foreground='black'>firstNumberParam</Colored> <Colored background={someColor} foreground='black'>secondNumberParam</Colored> <Colored background={someOtherColor} foreground='black'>thirdParameter</Colored></Line>
    ], [
      <Line systemMessage>Describe what the command does here.</Line>,
      <Line systemMessage>Also what are valid values for the parameters.</Line>,
      <Line systemMessage>And any other note-worthy information.</Line>,
    ]);
  }

  // ...
}
```

The above example is highlighting couple of conventions as well. The synopsis lines should use `<CommandColored>{this.name}</CommandColored>` to mark the command body. If a parameter must be one of a set of values which share coloring, such as as keyword group, they should be represented by `<Colored background={someColor} foreground='black'>...</Colored>` component, note the "inverted" colors, where `someColor` is the coloring shared by the set.

Note that if the built-in commands are not registered: `Gash.init(false)`, this method will never be called and is irrelevant.

### available()

Availability functionality is of limited usefulness but I chose to port it from my [previous gash library](https://github.com/VHonzik/gash) anyway. It only applies to built-in `list` command and simply skips the command from `list` output if it returns `false`. One use-case might be if you want to unlock some commands later in the game or be temporarily unavailable based on the current game state. It does not change the fact the command is registered to *gash* and its `parse()` and `autocomplete()` will be called regardless of the return value of `available()`. That said, the only built-in way for players to discover commands is the `list` command so unless player is told about the command elsewhere, not being in the `list` output means player has no knowledge of it.

Note that if the built-in commands are not registered: `Gash.init(false)`, this method will never be called and is irrelevant.

## Keywords

Keywords must implement `IKeyword` interface and be registered through `Gash.registerKeyword()`. Here is how a simple keyword might look like:

```js
class CoalKeyword implements IKeyword {
  name(): string {
    return 'coal';
  }

  printManPage(): void {
    Gash.writeLine(<Line systemMessage>Description of the coal resource.</Line>);
    Gash.writeLine(<Line />);
  }
}

const coalKeyword = new CoalKeyword();

Gash.registerKeyword(coalKeyword);
```

### name()

Unlike commands keywords use function for `name`, more on that later, but otherwise it serves the same purpose. Built-in command `man` will use the `name()` when parsing its one argument and if it is match call `IKeyword.printManPage()`. Additionally *gash* auto-completion parser `AutoCompleteKeywords` will use `name()` to auto-complete the passed keywords.

### printManPage()

As noted above, the built-in `man` command will invoke this function when the player types `man` and the keyword `name`, in the above example keyword `man coal`. Unlike for commands there is no recommended structure for the "man page" of keywords. It should explain the entity or the mechanic, it can tell some story bits and it can even change it's output depending on the current game state.

Note that if the built-in commands are not registered, this function will never be called.

### Keywords as class instances

A common troupe that arise when creating keywords is that they form "groups" of related keywords. We might want to add wood as another resource to the `CoalKeyword` above. Another class implementing `IKeyword` is of course an option but if we find we print very similar information or we want to share formatting between them, we should consider switching to instance approach:

```js
class ResourceKeyword implements IKeyword {
  constructor(public resourceName: string, private manLines: JSX.Element[]) {
  }

  name(): string {
    // This is the reason `name` is a function for keywords
    return this.resourceName;
  }

  printManPage(): void {
    // Assuming we have a game instance managing resources in a string dictionary
    // ResourceComponent is defined below
    Gash.writeLine(<Line systemMessage><ResourceComponent resource={this} /> is one of the resources in the game. You currently have {game.getResourceAmount(this.resourceName)}</Line>);
    for (let i = 0; i < this.manLines.length; i++) {
      const line = this.manLines[i];
      Gash.writeLine(line);
    }
    Gash.writeLine(<Line />);
  }
}

const coalKeyword = new ResourceKeyword('coal', [
  // Coal React component is defined below
  <Line systemMessage><Coal /> is used for heating of homes during winter.</Line>,
]);
const woodKeyword = new ResourceKeyword('wood', []);

Gash.registerKeyword(coalKeyword);
Gash.registerKeyword(woodKeyword);

// React components to display the resources

interface PluralProps {
  plural?: boolean
}

interface ResourceProps extends PluralProps {
  resource: ResourceKeyword,
}

const yellowColor: string = '#fdd835';

function ResourceComponent(props: ResourceProps): JSX.Element {
  return (
    <span><Colored foreground={yellow}>{props.resource.name()}</Colored>{props.plural ? 's' : ''}</span>
  );
}

function Coal(props: PluralProps) : JSX.Element {
  return <ResourceComponent subroutine={coalKeyword} {...props} />
}

function Wood(props: PluralProps) : JSX.Element {
  return <ResourceComponent subroutine={woodKeyword} {...props} />
}
```

This approach makes adding new keywords to this group very easy and guides player visually as well.

## Keyword group

Concept that arises naturally from the above instance approach is that it would be nice if we could display these groups as entries in the output of `man man`. It is a small detail but *gash* provides a functionality for it through `IKeywordGroup` interface and `Gash.registerKeywordGroup()`. Following in the line of resource keywords:

```js
const yellowColor: string = '#fdd835';
Gash.registerKeywordGroup({ placeholderName: 'resource', color: yellowColor, colorName: 'yellow' });
```


