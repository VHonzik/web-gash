import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { GashImpl, Output } from './GashImp';
import { ListDataInput, ListInput, RadioDataInput, RadioInput } from './ListInput';

function simulateKeyPress(key: string) {
  const event = new KeyboardEvent('keyboardPress', {key});
  GashImpl.keyDown(event);
}

describe('RadioInput', function() {
  it('returns a selected option', async function() {
    expect.assertions(1);
    const promise = RadioInput(['a', 'b'], <span />);

    simulateKeyPress(' ');
    simulateKeyPress('Enter');

    await expect(promise).resolves.toBe(0);
  });
  it('returns navigated and selected option', async function() {
    expect.assertions(1);
    const promise = RadioInput(['a', 'b', 'c'], <span />);

    simulateKeyPress('ArrowDown');
    simulateKeyPress('ArrowDown');
    simulateKeyPress('ArrowUp');
    simulateKeyPress(' ');
    simulateKeyPress('Enter');

    await expect(promise).resolves.toBe(1);
  });
  it('returns a quick-selected option', async function() {
    expect.assertions(1);
    const promise = RadioInput(['a', 'b'], <span />);
    simulateKeyPress('ArrowDown');
    simulateKeyPress('Enter');
    await expect(promise).resolves.toBe(1);
  });
  it('wraps around when navigating', async function() {
    expect.assertions(1);
    const promise = RadioInput(['a', 'b'], <span />);

    simulateKeyPress('ArrowDown');
    simulateKeyPress('ArrowDown');
    simulateKeyPress('Enter');

    await expect(promise).resolves.toBe(0);
  });
  it('returns actually selected option', async function() {
    expect.assertions(1);
    const promise = RadioInput(['a', 'b'], <span />);

    simulateKeyPress(' ');
    simulateKeyPress(' ');
    simulateKeyPress('ArrowDown');
    simulateKeyPress(' ');
    simulateKeyPress('Enter');

    await expect(promise).resolves.toBe(1);
  });
  it('rejects on cancel', async function() {
    expect.assertions(1);
    const promise = RadioInput(['a', 'b'], <span />).catch(e => expect(e).toBe(undefined));
    simulateKeyPress('q');
    return promise;
  });
  it('renders options and prompt', async function() {
    expect.assertions(2);
    let promise: Promise<number> = Promise.resolve(0);
    act(() => {
      render(<Output />);
    });

    act(() => {
      promise = RadioInput(['foo', 'bar'], <span />);
    });

    const fooLine = screen.getByText(/foo/i);
    expect(fooLine).toBeInTheDocument();

    const barLine = screen.getByText(/^bar/i);
    expect(barLine).toBeInTheDocument();

    act(() => {
      simulateKeyPress('Enter');
    });

    return promise;
  });
  it('renders prompt and controls', async function() {
    expect.assertions(2);
    let promise: Promise<number> = Promise.resolve(0);
    act(() => {
      render(<Output />);
    });

    act(() => {
      promise = RadioInput(['0', '1'], <span>lol</span>);
    });


    const promptLine = screen.getByText(/lol/i);
    expect(promptLine).toBeInTheDocument();

    const controlsLine = screen.getByText(/Navigate with/i);
    expect(controlsLine).toBeInTheDocument();

    act(() => {
      simulateKeyPress('Enter');
    });

    return promise;
  });
  it('clears everything after resolve', async function() {
    expect.assertions(2);
    let promise: Promise<number> = Promise.resolve(0);
    act(() => {
      render(<Output />);
    });

    act(() => {
      promise = RadioInput(['foo', 'lol'], <span>bar</span>);
    });

    act(() => {
      simulateKeyPress('Enter');
    });

    expect(screen.queryByText(/foo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^bar/i)).not.toBeInTheDocument();

    return promise;
  });
});

describe('RadioDataInput', function() {
  it('returns selected number data', async function() {
    expect.assertions(1);
    const promise = RadioDataInput([3, 5], ['a', 'b'], <span />);

    simulateKeyPress(' ');
    simulateKeyPress('Enter');

    await expect(promise).resolves.toBe(3);
  });
  it('returns quick-selected string data', async function() {
    expect.assertions(1);
    const promise = RadioDataInput(['foo', 'bar'], ['a', 'b'], <span />);

    simulateKeyPress('ArrowDown');
    simulateKeyPress('Enter');

    await expect(promise).resolves.toBe('bar');
  });
  it('returns selected object data', async function() {
    expect.assertions(1);
    const promise = RadioDataInput([{foo: 'bar'}, {foo: 'lol'}], ['a', 'b'], <span />);

    simulateKeyPress(' ');
    simulateKeyPress('Enter');

    await expect(promise).resolves.toStrictEqual({foo: 'bar'});
  });
  it('rejects on cancel', async function() {
    expect.assertions(1);
    const promise = RadioDataInput(['foo', 'bar'], ['a', 'b'], <span />).catch(e => expect(e).toBe(undefined));
    simulateKeyPress('q');
    return promise;
  });
});

describe('ListInput', function() {
  it('returns selected options', async function() {
    expect.assertions(1);
    const promise = ListInput(['a', 'b', 'c'], 2, <span />);

    simulateKeyPress(' ');
    simulateKeyPress('ArrowDown');
    simulateKeyPress(' ');
    simulateKeyPress('Enter');

    await expect(promise).resolves.toStrictEqual([0, 1]);
  });
  it('requires to have exact selection length', async function() {
    expect.assertions(1);
    const promise = ListInput(['a', 'b', 'c'], 2, <span />);

    simulateKeyPress(' ');
    simulateKeyPress('Enter');
    simulateKeyPress('ArrowDown');
    simulateKeyPress(' ');
    simulateKeyPress('ArrowDown');
    simulateKeyPress(' ');
    simulateKeyPress('Enter');
    simulateKeyPress(' ');
    simulateKeyPress('Enter');

    await expect(promise).resolves.toStrictEqual([0, 1]);
  });
  it('rejects on cancel', async function() {
    expect.assertions(1);
    const promise = ListInput(['foo', 'bar'], 1, <span />).catch(e => expect(e).toBe(undefined));
    simulateKeyPress('q');
    return promise;
  });
});

describe('ListDataInput', function() {
  it('returns selected number data', async function() {
    expect.assertions(1);
    const promise = ListDataInput([3, 5, 7], ['a', 'b', 'c'], 2, <span />);

    simulateKeyPress(' ');
    simulateKeyPress('ArrowDown');
    simulateKeyPress(' ');
    simulateKeyPress('Enter');

    await expect(promise).resolves.toStrictEqual([3, 5]);
  });
  it('returns selected string data', async function() {
    expect.assertions(1);
    const promise = ListDataInput(['foo', 'lol', 'bar'], ['a', 'b', 'c'], 2, <span />);

    simulateKeyPress(' ');
    simulateKeyPress('ArrowUp');
    simulateKeyPress(' ');
    simulateKeyPress('Enter');

    await expect(promise).resolves.toStrictEqual(['foo', 'bar']);
  });
  it('rejects on cancel', async function() {
    expect.assertions(1);
    const promise = ListDataInput(['foo', 'bar'], ['a', 'b'], 2, <span />).catch(e => expect(e).toBe(undefined));
    simulateKeyPress('q');
    return promise;
  });
});