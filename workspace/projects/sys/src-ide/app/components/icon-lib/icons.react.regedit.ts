import { IReactIcon } from './domain';
import {
  addActive,
  addDisabled,
  addHover,
  addNormal,
} from './icons.static.regedit';
import {
  sortClick,
  sortDisabled,
  sortHover,
  sortNormal,
} from './regedit/memory-diagnosis/sort.regedit';
import {
  allMemoryLeakClick,
  allMemoryLeakDisabled,
  allMemoryLeakHover,
  allMemoryLeakNormal,
} from './regedit/memory-diagnosis/all-memory-leak.regedit';
import {
  selfMemoryLeakClick,
  selfMemoryLeakDisabled,
  selfMemoryLeakHover,
  selfMemoryLeakNormal,
} from './regedit/memory-diagnosis/self-memory-leak.regedit';
import {
  arrowDownDoubleClick,
  arrowDownDoubleDisabled,
  arrowDownDoubleHover,
  arrowDownDoubleNormal,
} from './regedit/memory-diagnosis/arrow-down-double.regedit';
import {
  codeViewClick,
  codeViewDisabled,
  codeViewHover,
  codeViewNormal,
} from './regedit/memory-diagnosis/exception-code.regedit';
import {
  codeViewSelectedClick,
  codeViewSelectedDisabled,
  codeViewSelectedHover,
  codeViewSelectedNormal,
} from './regedit/memory-diagnosis/exception-code-select.regedit';

import {
  chartViewClick,
  chartViewDisabled,
  chartViewHover,
  chartViewNormal,
} from './regedit/micarch/chartView.regedit';
import {
  chartViewDarkClick,
  chartViewDarkDisabled,
  chartViewDarkHover,
  chartViewDarkNormal,
} from './regedit/micarch/chartViewDark.regedit';
import {
  chartViewSelectedClick,
  chartViewSelectedDisabled,
  chartViewSelectedHover,
  chartViewSelectedNormal,
} from './regedit/micarch/chartViewSelected.regedit';
import {
  chartViewSelectedDarkClick,
  chartViewSelectedDarkDisabled,
  chartViewSelectedDarkHover,
  chartViewSelectedDarkNormal,
} from './regedit/micarch/chartViewSelectedDark.regedit';
import {
  tableViewClick,
  tableViewDisabled,
  tableViewHover,
  tableViewNormal,
} from './regedit/micarch/tableView.regedit';
import {
  tableViewDarkClick,
  tableViewDarkDisabled,
  tableViewDarkHover,
  tableViewDarkNormal,
} from './regedit/micarch/tableViewDark.regedit';
import {
  tableViewSelectedClick,
  tableViewSelectedDisabled,
  tableViewSelectedHover,
  tableViewSelectedNormal,
} from './regedit/micarch/tableViewSelected.regedit';
import {
  tableViewSelectedDarkClick,
  tableViewSelectedDarkDisabled,
  tableViewSelectedDarkHover,
  tableViewSelectedDarkNormal,
} from './regedit/micarch/tableViewSelectedDark.regedit';
import {
  filterClick,
  filterDisabled,
  filterHover,
  filterNormal,
} from './regedit/systab-detail/filter.regedit';
import {
  filterDarkClick,
  filterDarkDisabled,
  filterDarkHover,
  filterDarkNormal,
} from './regedit/systab-detail/filterDark.regedit';

export default {
  addIcon: {
    name: 'addIcon',
    data: {
      normal: addNormal.name,
      hover: addHover.name,
      active: addActive.name,
      disabled: addDisabled.name,
    },
  } as IReactIcon,
  codeView: {
    name: 'codeView',
    data: {
      normal: codeViewNormal.name,
      hover: codeViewHover.name,
      active: codeViewClick.name,
      disabled: codeViewDisabled.name,
    },
  } as IReactIcon,
  codeViewSelected: {
    name: 'codeViewSelected',
    data: {
      normal: codeViewSelectedNormal.name,
      hover: codeViewSelectedHover.name,
      active: codeViewSelectedClick.name,
      disabled: codeViewSelectedDisabled.name,
    },
  } as IReactIcon,
  sort: ({
      name: 'sort',
      data: {
          normal: sortNormal.name,
          hover: sortHover.name,
          active: sortClick.name,
          disabled: sortDisabled.name,
      },
  } as IReactIcon),
  allMemoryLeak: ({
      name: 'allMemoryLeak',
      data: {
          normal: allMemoryLeakNormal.name,
          hover: allMemoryLeakHover.name,
          active: allMemoryLeakClick.name,
          disabled: allMemoryLeakDisabled.name,
      },
  } as IReactIcon),
  selfMemoryLeak: ({
      name: 'selfMemoryLeak',
      data: {
          normal: selfMemoryLeakNormal.name,
          hover: selfMemoryLeakHover.name,
          active: selfMemoryLeakClick.name,
          disabled: selfMemoryLeakDisabled.name,
      },
  } as IReactIcon),
  arrowDownDouble: {
    name: 'arrowDownDouble',
    data: {
      normal: arrowDownDoubleNormal.name,
      hover: arrowDownDoubleHover.name,
      active: arrowDownDoubleClick.name,
      disabled: arrowDownDoubleDisabled.name,
    },
  } as IReactIcon,
  chartView: {
    name: 'chartView',
    data: {
      normal: chartViewNormal.name,
      hover: chartViewHover.name,
      active: chartViewClick.name,
      disabled: chartViewDisabled.name,
    },
  } as IReactIcon,
  chartViewDark: {
    name: 'chartViewDark',
    data: {
      normal: chartViewDarkNormal.name,
      hover: chartViewDarkHover.name,
      active: chartViewDarkClick.name,
      disabled: chartViewDarkDisabled.name,
    },
  } as IReactIcon,
  chartViewSelected: {
    name: 'chartViewSelected',
    data: {
      normal: chartViewSelectedNormal.name,
      hover: chartViewSelectedHover.name,
      active: chartViewSelectedClick.name,
      disabled: chartViewSelectedDisabled.name,
    },
  } as IReactIcon,
  chartViewSelectedDark: {
    name: 'chartViewSelectedDark',
    data: {
      normal: chartViewSelectedDarkNormal.name,
      hover: chartViewSelectedDarkHover.name,
      active: chartViewSelectedDarkClick.name,
      disabled: chartViewSelectedDarkDisabled.name,
    },
  } as IReactIcon,
  tableView: {
    name: 'tableView',
    data: {
      normal: tableViewNormal.name,
      hover: tableViewHover.name,
      active: tableViewClick.name,
      disabled: tableViewDisabled.name,
    },
  } as IReactIcon,
  tableViewDark: {
    name: 'tableViewDark',
    data: {
      normal: tableViewDarkNormal.name,
      hover: tableViewDarkHover.name,
      active: tableViewDarkClick.name,
      disabled: tableViewDarkDisabled.name,
    },
  } as IReactIcon,
  tableViewSelected: {
    name: 'tableViewSelected',
    data: {
      normal: tableViewSelectedNormal.name,
      hover: tableViewSelectedHover.name,
      active: tableViewSelectedClick.name,
      disabled: tableViewSelectedDisabled.name,
    },
  } as IReactIcon,
  tableViewSelectedDark: {
    name: 'tableViewSelectedDark',
    data: {
      normal: tableViewSelectedDarkNormal.name,
      hover: tableViewSelectedDarkHover.name,
      active: tableViewSelectedDarkClick.name,
      disabled: tableViewSelectedDarkDisabled.name,
    },
  } as IReactIcon,
  filter: {
    name: 'tableViewSelectedDark',
    data: {
      normal: filterNormal.name,
      hover: filterHover.name,
      active: filterClick.name,
      disabled: filterDisabled.name,
    },
  } as IReactIcon,
  filterDark: {
    name: 'tableViewSelectedDark',
    data: {
      normal: filterDarkNormal.name,
      hover: filterDarkHover.name,
      active: filterDarkClick.name,
      disabled: filterDarkDisabled.name,
    },
  } as IReactIcon,
};
