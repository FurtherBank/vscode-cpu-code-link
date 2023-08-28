import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(
    <App
      data={{
        importPath: 'root',
        realFilePath: 'root.tsx',
        children: [],
      }}
      isDark={true}
    />
  );
  // const linkElement = screen.getByText(/learn react/i);
  // expect(linkElement).toBeInTheDocument();
});
