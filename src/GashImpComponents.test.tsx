import '@testing-library/jest-dom'
import { render, screen, waitFor} from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { Line } from './components/Line';
import { Prompt, Cursor, InputText, GashImpl, Input, Output } from './GashImp';
import ICommand, { AutoCompleteResultType } from './ICommand';

describe('Prompt component', function() {
  it('renders props promptText', function() {
    render(<Prompt promptText='Foo'/>);
    const promptElement = screen.getByText(/Foo/i);
    expect(promptElement).toBeInTheDocument();
  });
  it('defaults to $', function() {
    render(<Prompt />);
    const promptElement = screen.getByText(/\$/i);
    expect(promptElement).toBeInTheDocument();
  });
});

describe('Cursor component', function() {
  it('renders props symbol', function() {
    render(<Cursor symbol='Foo' />);
    const cursorElement = screen.getByText(/Foo/i);
    expect(cursorElement).toBeInTheDocument();
  });
  it('defaults to _', function() {
    render(<Cursor />);
    const cursorElement = screen.getByText(/_/i);
    expect(cursorElement).toBeInTheDocument();
  });
  it('blinks by default', async function() {
    render(<Cursor />);
    const cursorElement = screen.getByText(/_/i);
    expect(cursorElement).toBeVisible();
    await waitFor(() => {
      expect(cursorElement).not.toBeVisible();
    });
    await waitFor(() => {
      expect(cursorElement).toBeVisible();
    });
  });
});

describe('InputText component', function() {
  afterEach(function () {
    GashImpl.clearCharacterBuffer();
  });
  it('renders cursor', function() {
    render(<InputText />);
    const cursorElement = screen.getByText(/_/i);
    expect(cursorElement).toBeInTheDocument();
  });
  it('reacts to keypress', function() {
    render(<InputText />);
    const event = new KeyboardEvent('eKeyboardPress', {key: 'e'});
    act(() => {
      GashImpl.keyDown(event);
    });
    const inputText = screen.getByText(/e/i);
    expect(inputText).toBeInTheDocument();
  });
  it('passes cursor props to cursor', function() {
    render(<InputText cursor={{symbol: 'Foo'}} />);
    const cursorElement = screen.getByText(/Foo/i);
    expect(cursorElement).toBeInTheDocument();
  });
});

describe('Input component', function() {
  it('passes cursor props to cursor and prompt props to prompt', function() {
    render(<Input cursor={{symbol: 'Foo'}} prompt={{promptText: 'Bar'}} />);
    const cursorElement = screen.getByText(/Foo/i);
    const promptElement = screen.getByText(/Bar/i);
    expect(cursorElement).toBeInTheDocument();
    expect(promptElement).toBeInTheDocument();
  });
  it('is hidden when input is disabled and shown when enabled again', async function() {
    act(() => {
      render(<Input prompt={{promptText: 'Bar'}} />);
    });
    // Prompt is direct child of input
    const inputElement = screen.getByText(/Bar/i).closest('div');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toBeVisible();

    act(() => {
      GashImpl.enableInput(false);
    });

    expect(inputElement).not.toBeVisible();

    act(() => {
      GashImpl.enableInput(true);
    });

    expect(inputElement).toBeVisible();
  });
});

describe('Output component', function() {
  it('displays written lines', function() {
    act(() => {
      render(<Output />);
    });

    act(() => {
      GashImpl.writeLine(<Line>Foo</Line>);
    });

    const outputLineElement = screen.getByText(/Foo/i);
    expect(outputLineElement).toBeInTheDocument();
  });
  it('displays temp lines', function() {
    act(() => {
      render(<Output />);
    });

    act(() => {
      GashImpl.writeTempLine(<Line>Bar</Line>, 0);
    });

    const outputLineElement = screen.getByText(/Bar/i);
    expect(outputLineElement).toBeInTheDocument();
  });
  it('clears temp lines', function() {
    act(() => {
      render(<Output />);
    });

    act(() => {
      GashImpl.writeTempLine(<Line>Bar</Line>, 0);
    });

    const outputLineElement = screen.getByText(/Bar/i);
    expect(outputLineElement).toBeInTheDocument();

    act(() => {
      GashImpl.clearTempLines();
    });

    expect(screen.queryByText(/Bar/i)).not.toBeInTheDocument();
  });
  it('outputs lines when writeManPage is called', function() {
    const fakeCommand: ICommand = {
      name: 'Baz',
      parse: function() { return {success: false }},
      autocomplete: function() {return { type: AutoCompleteResultType.NotMatching, fixedValue: ''}},
      available: function() { return false; },
      printManPage: function() { }
    }

    act(() => {
      render(<Output />);
    });

    act(() => {
      GashImpl.writeManPage(fakeCommand, [<Line tabs={2}>Foo</Line>], [<Line>Bar</Line>]);
    });

    const nameElement = screen.getAllByText(/Baz/i);
    expect(nameElement.length).toBeGreaterThan(0);

    const synopsisLineElement = screen.getByText(/Foo/i);
    expect(synopsisLineElement).toBeInTheDocument();

    const descriptionLineElement = screen.getByText(/Bar/i);
    expect(descriptionLineElement).toBeInTheDocument();
  })
});
