import '@testing-library/jest-dom'
import { act, render, screen } from "@testing-library/react";
import { Terminal } from "./Gash";

describe('Terminal component', function() {
  it('passes cursor and prompt props', function() {
    act(() => {
      render(<Terminal cursor={{symbol:' Foo'}} prompt={{promptText: 'Bar'}} />);

      const cursorElement = screen.getByText(/Foo/i);
      const promptElement = screen.getByText(/Bar/i);
      expect(cursorElement).toBeInTheDocument();
      expect(promptElement).toBeInTheDocument();
    });
  });
});