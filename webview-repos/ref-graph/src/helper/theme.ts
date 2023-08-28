import Color from "color";

export const theme = (c: string, isDark?: boolean) => {
  if (isDark) {
    const color = Color(c);
    const lightness = color.lightness();
    const darkColor = color.lightness(100 - lightness).hex();
    console.log(c, 'darkColor', darkColor);
    
    return darkColor
  }
  return c;
};
