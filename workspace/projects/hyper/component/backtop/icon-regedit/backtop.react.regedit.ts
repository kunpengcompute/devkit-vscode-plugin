import { HyReactIcon } from '../../icon-lib/domain';
import {
  toTopNormalLight,
  toTopHoverLight,
  toTopActiveLight,
  toTopNormalDark,
  toTopHoverDark,
  toTopActiveDark,
} from './backtop.static.regedit';

export const toTopReactLight: HyReactIcon = {
  name: 'toTopReactLight',
  data: {
    normal: toTopNormalLight.name,
    hover: toTopHoverLight.name,
    active: toTopActiveLight.name,
  },
};

export const toTopReactDark: HyReactIcon = {
  name: 'toTopReactDark',
  data: {
    normal: toTopNormalDark.name,
    hover: toTopHoverDark.name,
    active: toTopActiveDark.name,
  },
};
