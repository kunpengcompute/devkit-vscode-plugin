import { IReactIcon } from './domain';

import {
  expandDownNormal,
  expandDownHover,
  expandDownActive,
  expandDownDisabled,
} from './regedit/expand-down.regedit';
import {
  expandDownDarkNormal,
  expandDownDarkHover,
  expandDownDarkActive,
  expandDownDarkDisabled,
} from './regedit/expand-down-dark.regedit';
import {
  expandUpNormal,
  expandUpHover,
  expandUpActive,
  expandUpDisabled,
} from './regedit/expand-up.regedit';
import {
  expandUpDarkNormal,
  expandUpDarkHover,
  expandUpDarkActive,
  expandUpDarkDisabled,
} from './regedit/expand-up-dark.regedit';
import {
  fullScreenActiveDark,
  fullScreenActiveLight,
  fullScreenHoverDark,
  fullScreenHoverLight,
  fullScreenNormalDark,
  fullScreenNormalLight,
} from './regedit/full-screen.regedit';
import {
  exitFullActiveDark,
  exitFullActiveLight,
  exitFullHoverDark,
  exitFullHoverLight,
  exitFullNormalDark,
  exitFullNormalLight,
} from './regedit/exit-full.regedit';

import {
  zoomInActiveDark,
  zoomInActiveLight,
  zoomInHoverDark,
  zoomInHoverLight,
  zoomInNormalDark,
  zoomInNormalLight,
} from './regedit/zoom-in.regedit';

import {
  zoomOutActiveDark,
  zoomOutActiveLight,
  zoomOutHoverDark,
  zoomOutHoverLight,
  zoomOutNormalDark,
  zoomOutNormalLight,
} from './regedit/zoom-out.regedit';

export default {
  zoomInDark: {
    name: 'zoomInDark',
    data: {
      normal: zoomInNormalDark.name,
      hover: zoomInHoverDark.name,
      active: zoomInActiveDark.name,
    },
  } as IReactIcon,
  zoomInLight: {
    name: 'zoomInLight',
    data: {
      normal: zoomInNormalLight.name,
      hover: zoomInHoverLight.name,
      active: zoomInActiveLight.name,
    },
  } as IReactIcon,
  zoomOutDark: {
    name: 'zoomOutDark',
    data: {
      normal: zoomOutNormalDark.name,
      hover: zoomOutHoverDark.name,
      active: zoomOutActiveDark.name,
    },
  } as IReactIcon,
  zoomOutLight: {
    name: 'zoomOutLight',
    data: {
      normal: zoomOutNormalLight.name,
      hover: zoomOutHoverLight.name,
      active: zoomOutActiveLight.name,
    },
  } as IReactIcon,
  expandDown: {
    name: 'expandDown',
    data: {
      normal: expandDownNormal.name,
      hover: expandDownHover.name,
      active: expandDownActive.name,
      disabled: expandDownDisabled.name,
    },
  } as IReactIcon,
  expandDownDark: {
    name: 'expandDownDark',
    data: {
      normal: expandDownDarkNormal.name,
      hover: expandDownDarkHover.name,
      active: expandDownDarkActive.name,
      disabled: expandDownDarkDisabled.name,
    },
  } as IReactIcon,
  expandUp: {
    name: 'expandUp',
    data: {
      normal: expandUpNormal.name,
      hover: expandUpHover.name,
      active: expandUpActive.name,
      disabled: expandUpDisabled.name,
    },
  } as IReactIcon,
  expandUpDark: {
    name: 'expandUpDark',
    data: {
      normal: expandUpDarkNormal.name,
      hover: expandUpDarkHover.name,
      active: expandUpDarkActive.name,
      disabled: expandUpDarkDisabled.name,
    },
  } as IReactIcon,
  fullScreenLight: {
    name: 'expandUpDark',
    data: {
      normal: fullScreenNormalLight.name,
      hover: fullScreenHoverLight.name,
      active: fullScreenActiveLight.name,
    },
  } as IReactIcon,
  fullScreenDark: {
    name: 'expandUpDark',
    data: {
      normal: fullScreenNormalDark.name,
      hover: fullScreenHoverDark.name,
      active: fullScreenActiveDark.name,
    },
  } as IReactIcon,
  exitFullLight: {
    name: 'expandUpDark',
    data: {
      normal: exitFullNormalLight.name,
      hover: exitFullHoverLight.name,
      active: exitFullActiveLight.name,
    },
  } as IReactIcon,
  exitFullDark: {
    name: 'expandUpDark',
    data: {
      normal: exitFullNormalDark.name,
      hover: exitFullHoverDark.name,
      active: exitFullActiveDark.name,
    },
  } as IReactIcon,
};
