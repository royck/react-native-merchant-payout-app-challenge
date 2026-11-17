import { fireEvent, render, screen } from '@testing-library/react-native';

import { CurrencyDropdown } from './CurrencyDropdown';

describe('CurrencyDropdown', () => {
  it('shows the selected currency and keeps options collapsed initially', () => {
    render(<CurrencyDropdown value="GBP" onChange={jest.fn()} />);

    expect(screen.getByLabelText('Currency, GBP').props.accessibilityState)
      .toMatchObject({ expanded: false });
    expect(screen.queryByRole('menuitem', { name: 'EUR' })).toBeNull();
  });

  it('opens the options and marks the selected currency', () => {
    render(<CurrencyDropdown value="EUR" onChange={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Currency, EUR'));

    expect(screen.getByLabelText('Currency, EUR').props.accessibilityState)
      .toMatchObject({ expanded: true });
    expect(screen.getByRole('menuitem', { name: 'EUR' }).props.accessibilityState)
      .toMatchObject({ selected: true });
    expect(screen.getByRole('menuitem', { name: 'GBP' }).props.accessibilityState)
      .toMatchObject({ selected: false });
  });

  it('changes the selected currency and closes the options', () => {
    const onChange = jest.fn();
    render(<CurrencyDropdown value="GBP" onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('Currency, GBP'));
    fireEvent.press(screen.getByRole('menuitem', { name: 'EUR' }));

    expect(onChange).toHaveBeenCalledWith('EUR');
    expect(screen.queryByRole('menuitem', { name: 'EUR' })).toBeNull();
  });
});
