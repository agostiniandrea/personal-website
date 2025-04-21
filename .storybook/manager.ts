import { addons } from '@storybook/addons';
import { create } from '@storybook/theming';

const theme = create({
  base: 'light',
  brandTitle: 'Il Nostro Blog',
  brandUrl: 'https://ilnostroblog.it',
});

addons.setConfig({
  theme,
}); 