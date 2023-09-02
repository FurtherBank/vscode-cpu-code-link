import Color from 'color';

export const theme = (c: string, isDark?: boolean) => {
  if (isDark) {
    const color = Color(c);
    const darkenLightness = Math.round((100 - color.lightness()) * 0.85 + 15);
    const darkColor = color.lightness(darkenLightness).hex();

    return darkColor;
  }
  return c;
};
