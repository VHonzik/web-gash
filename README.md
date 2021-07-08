# web-gash

Acronym for game-again shell, borrowing the pun from [Bash (Unix shell)](https://en.wikipedia.org/wiki/Bash_(Unix_shell)), *web-gash* is a JS library for web console games.

This library is a port and successor to my .NET core [gash](https://github.com/VHonzik/gash) library.

## Features
- Runs inside modern browsers for even more cross-platform opportunities
- Fully functional and already styled terminal [React](https://reactjs.org/) component
- Command driven logic
  - Well documented and typed interface to define and register new commands with robust parsing helpers
  - Commands have syntax inspired by Unix shell commands including parameters and options support
  - Built-in Unix inspired "man" type of command for manual pages of commands and keywords
  - Built-in "list available commands" command
- Built-in tab auto-complete functionality
- Unix shell style command history (up/down arrows)
- Written in [Typescript](https://www.typescriptlang.org/)
- Very quick to set-up if you have a React app

## Getting started

I suggest starting with Typescript template of [Create React App](https://create-react-app.dev/docs/getting-started#creating-a-typescript-app).

### Installation
Install the package with npm: `npm install web-gash`

### Set-up

First we need to initialize the gash library:

```js
// index.tsx/index.js or similar entry-point

import Gash from 'web-gash';

// Before ReactDOM.render initialize the gash library. Note that unless you pass `false` to the `init` gash will automatically register the built-in commands `man` and `list`.
Gash.init();

ReactDOM.render(
//...
```

The default styling uses [Inconsolata](https://fonts.google.com/specimen/Inconsolata) font from Google Fonts library. I chose not to ship it with gash but you can easily add it to your app, for example with css import:

```css
/* Add to the top of index.css */
@import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap');
```

Then finally we add the `Terminal` component to our app:

```js
import { Terminal } from 'web-gash';

// App.tsx/App.js or similar top-level component
function App() {
  return (
    <Terminal />
  );
}
```

And that's it, once you start the app you will see a full-screen styled terminal and you can start calling commands such as `man man` and play around with Tab auto-completion. Next step is adding your own commands and keywords: TODO

