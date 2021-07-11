/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Prompt } from './GashImp';

describe('Prompt component', function() {
  it('renders props text', function() {
    const {queryByText} = render(
      <Prompt promptText='Foo'/>
    );
    expect(queryByText(/Foo/i)).toBeTruthy();
  })
})
