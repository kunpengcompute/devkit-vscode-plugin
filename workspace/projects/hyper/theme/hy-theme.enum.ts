/**
 * 主题
 */
export enum HyTheme {
  Dark = 'dark',
  Grey = 'grey',
  Light = 'light',
}

/**
 * 所有主题的类名的 set 集合
 */
export const themeSet = new Set([HyTheme.Dark, HyTheme.Light, HyTheme.Grey]);
