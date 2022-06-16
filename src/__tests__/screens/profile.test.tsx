import { render } from '@testing-library/react-native';
import React from 'react';

import { Profile } from '../../screens/Profile';

test('check if show correctly user input name placeholder', () => {
  const { getByPlaceholderText } = render(<Profile />);

  const inputName = getByPlaceholderText('Nome');
  
  expect(inputName).toBeTruthy();
});