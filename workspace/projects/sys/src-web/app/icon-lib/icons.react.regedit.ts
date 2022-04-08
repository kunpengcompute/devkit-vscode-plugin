import { IReactIcon } from './domain';
import {
    addActive, addDisabled, addHover, addNormal,
} from './icons.static.regedit';

import {
    addProjectClick, addProjectDisabled, addProjectHover, addProjectNormal
} from './regedit/project-management/addProject.regedit';
import {
  refreshProjectClick,
  refreshProjectDisabled,
  refreshProjectHover,
  refreshProjectNormal } from './regedit/project-management/refreshProject.regedit';
import {
    importTaskClick, importTaskDisabled, importTaskHover, importTaskNormal
} from './regedit/project-management/importTask.regedit';
import {
    exportTaskClick, exportTaskDisabled, exportTaskHover, exportTaskNormal
} from './regedit/project-management/exportTask.regedit';
import {
    createTaskClick, createTaskDisabled, createTaskHover, createTaskNormal
} from './regedit/project-management/createTask.regedit';
import { deleteProjectClick, deleteProjectDisabled, deleteProjectHover, deleteProjectNormal
} from './regedit/project-management/deleteProject.regedit';
import { editProjectClick, editProjectDisabled, editProjectHover, editProjectNormal
} from './regedit/project-management/editProject.regedit';
import { restartTaskClick, restartTaskDisabled, restartTaskHover, restartTaskNormal
} from './regedit/project-management/restartTask.regedit';
import {
    associationNodeNormal, associationNodeHover, associationNodeActive, associationNodeDisabled
} from './regedit/project-management/associationNode.regedit';
import {
    viewTaskDetailNormal, viewTaskDetailHover, viewTaskDetailActive, viewTaskDetailDisabled
  } from './regedit/project-management/viewTaskDetail.regedit';
import {
    reanalyzeIconNormal, reanalyzeIconHover, reanalyzeIconActive, reanalyzeIconDisabled
} from './regedit/project-management/reanalyzeIcon.regedit';
import {
    startTaskClick, startTaskDisabled, startTaskHover, startTaskNormal
} from './regedit/project-management/startTask.regedit';
import {
    stopTaskClick, stopTaskDisabled, stopTaskHover, stopTaskNormal
} from './regedit/project-management/stopTask.regedit';

import { filterClick, filterDisabled, filterHover, filterNormal } from './regedit/systab-detail/filter.regedit';
import { moreClick, moreDisabled, moreHover, moreNormal } from './regedit/restab-detail/more.regedit';
import { typicalConfigClick, typicalConfigDisabled, typicalConfigHover, typicalConfigNormal
} from './regedit/systab-detail/typicalConfig.regedit';

import {
    chartViewClick, chartViewDisabled, chartViewHover, chartViewNormal
} from './regedit/micarch/chartView.regedit';
import { chartViewSelectedClick, chartViewSelectedDisabled, chartViewSelectedHover, chartViewSelectedNormal
} from './regedit/micarch/chartViewSelected.regedit';
import {
    tableViewClick, tableViewDisabled, tableViewHover, tableViewNormal
} from './regedit/micarch/tableView.regedit';
import { tableViewSelectedClick, tableViewSelectedDisabled, tableViewSelectedHover, tableViewSelectedNormal
} from './regedit/micarch/tableViewSelected.regedit';

import { applicationDisabled, applicationHover, applicationNormal } from './regedit/create-task/application.regedit';
import {
    cplusAnalysisDisabled, cplusAnalysisHover, cplusAnalysisNormal } from './regedit/create-task/cplusAnalysis.regedit';
import { memAccessAnalysisDisabled, memAccessAnalysisHover, memAccessAnalysisNormal
} from './regedit/create-task/memAccessAnalysis.regedit';
import { ioAnalysisDisabled, ioAnalysisHover, ioAnalysisNormal } from './regedit/create-task/ioAnalysis.regedit';
import {
    lockAnalysisDisabled, lockAnalysisHover, lockAnalysisNormal } from './regedit/create-task/lockAnalysis.regedit';
import {
    microAnalysisDisabled, microAnalysisHover, microAnalysisNormal } from './regedit/create-task/microAnalysis.regedit';
import { panoramicAnalysisDisabled, panoramicAnalysisHover, panoramicAnalysisNormal
} from './regedit/create-task/panoramicAnalysis.regedit';
import {
    processAnalysisDisabled, processAnalysisHover, processAnalysisNormal
} from './regedit/create-task/processAnalysis.regedit';
import {
    resourceAnalysisDisabled, resourceAnalysisHover, resourceAnalysisNormal
} from './regedit/create-task/resourceAnalysis.regedit';
import { systemDisabled, systemHover, systemNormal } from './regedit/create-task/system.regedit';
import { hpcAnalysisDisabled, hpcAnalysisHover, hpcAnalysisNormal } from './regedit/create-task/hpcAnalysis.regedit';
import { sortClick, sortDisabled, sortHover, sortNormal } from './regedit/memory-diagnosis/sort.regedit';
import { allMemoryLeakClick, allMemoryLeakDisabled, allMemoryLeakHover, allMemoryLeakNormal
} from './regedit/memory-diagnosis/all-memory-leak.regedit';
import { selfMemoryLeakClick, selfMemoryLeakDisabled, selfMemoryLeakHover, selfMemoryLeakNormal
} from './regedit/memory-diagnosis/self-memory-leak.regedit';
import { arrowDownDoubleClick, arrowDownDoubleDisabled, arrowDownDoubleHover, arrowDownDoubleNormal
} from './regedit/memory-diagnosis/arrow-down-double.regedit';
import {
    codeViewClick, codeViewDisabled, codeViewHover, codeViewNormal
} from './regedit/memory-diagnosis/exception-code.regedit';
import { codeViewSelectedClick, codeViewSelectedDisabled, codeViewSelectedHover, codeViewSelectedNormal
} from './regedit/memory-diagnosis/exception-code-select.regedit';
export default {
    addIcon: ({
        name: 'addIcon',
        data: {
            normal: addNormal.name,
            hover: addHover.name,
            active: addActive.name,
            disabled: addDisabled.name,
        },
    } as IReactIcon),
    addProject: ({
        name: 'addProject',
        data: {
            normal: addProjectNormal.name,
            hover: addProjectHover.name,
            active: addProjectClick.name,
            disabled: addProjectDisabled.name,
        },
    } as IReactIcon),
    refreshProject: ({
        name: 'refreshProject',
        data: {
            normal: refreshProjectNormal.name,
            hover: refreshProjectHover.name,
            active: refreshProjectClick.name,
            disabled: refreshProjectDisabled.name,
        },
    } as IReactIcon),
    importTask: ({
        name: 'importTask',
        data: {
            normal: importTaskNormal.name,
            hover: importTaskHover.name,
            active: importTaskClick.name,
            disabled: importTaskDisabled.name,
        },
    } as IReactIcon),
    exportTask: ({
        name: 'exportTask',
        data: {
            normal: exportTaskNormal.name,
            hover: exportTaskHover.name,
            active: exportTaskClick.name,
            disabled: exportTaskDisabled.name,
        },
    } as IReactIcon),
    createTask: ({
        name: 'createTask',
        data: {
            normal: createTaskNormal.name,
            hover: createTaskHover.name,
            active: createTaskClick.name,
            disabled: createTaskDisabled.name,
        },
    } as IReactIcon),
    deleteProject: ({
        name: 'deleteProject',
        data: {
            normal: deleteProjectNormal.name,
            hover: deleteProjectHover.name,
            active: deleteProjectClick.name,
            disabled: deleteProjectDisabled.name,
        },
    } as IReactIcon),
    editProject: ({
        name: 'editProject',
        data: {
            normal: editProjectNormal.name,
            hover: editProjectHover.name,
            active: editProjectClick.name,
            disabled: editProjectDisabled.name,
        },
    } as IReactIcon),
    restartTask: ({
        name: 'restartTask',
        data: {
            normal: restartTaskNormal.name,
            hover: restartTaskHover.name,
            active: restartTaskClick.name,
            disabled: restartTaskDisabled.name,
        },
    } as IReactIcon),
    startTask: ({
        name: 'startTask',
        data: {
            normal: startTaskNormal.name,
            hover: startTaskHover.name,
            active: startTaskClick.name,
            disabled: startTaskDisabled.name,
        },
    } as IReactIcon),
    stopTask: ({
        name: 'stopTask',
        data: {
            normal: stopTaskNormal.name,
            hover: stopTaskHover.name,
            active: stopTaskClick.name,
            disabled: stopTaskDisabled.name,
        },
    } as IReactIcon),
    associationNode: ({
        name: 'associationNode',
        data: {
            normal: associationNodeNormal.name,
            hover: associationNodeHover.name,
            active: associationNodeActive.name,
            disabled: associationNodeDisabled.name
        },
    } as IReactIcon),
    reanalyzeIcon: ({
        name: 'reanalyzeIcon',
        data: {
            normal: reanalyzeIconNormal.name,
            hover: reanalyzeIconHover.name,
            active: reanalyzeIconActive.name,
            disabled: reanalyzeIconDisabled.name
        }
    } as IReactIcon),
    viewTaskDetail: ({
        name: 'viewTaskDetail',
        data: {
            normal: viewTaskDetailNormal.name,
            hover: viewTaskDetailHover.name,
            active: viewTaskDetailActive.name,
            disabled: viewTaskDetailDisabled.name
        }
    } as IReactIcon),

    filter: ({
        name: 'filter',
        data: {
            normal: filterNormal.name,
            hover: filterHover.name,
            active: filterClick.name,
            disabled: filterDisabled.name,
        },
    } as IReactIcon),
    more: ({
        name: 'more',
        data: {
            normal: moreNormal.name,
            hover: moreHover.name,
            active: moreClick.name,
            disabled: moreDisabled.name,
        },
    } as IReactIcon),
    typicalConfig: ({
        name: 'typicalConfig',
        data: {
            normal: typicalConfigNormal.name,
            hover: typicalConfigHover.name,
            active: typicalConfigClick.name,
            disabled: typicalConfigDisabled.name,
        },
    } as IReactIcon),

    chartView: ({
        name: 'chartView',
        data: {
            normal: chartViewNormal.name,
            hover: chartViewHover.name,
            active: chartViewClick.name,
            disabled: chartViewDisabled.name,
        },
    } as IReactIcon),
    chartViewSelected: ({
        name: 'chartViewSelected',
        data: {
            normal: chartViewSelectedNormal.name,
            hover: chartViewSelectedHover.name,
            active: chartViewSelectedClick.name,
            disabled: chartViewSelectedDisabled.name,
        },
    } as IReactIcon),
    codeView: ({
        name: 'codeView',
        data: {
            normal: codeViewNormal.name,
            hover: codeViewHover.name,
            active: codeViewClick.name,
            disabled: codeViewDisabled.name,
        },
    } as IReactIcon),
    codeViewSelected: ({
        name: 'codeViewSelected',
        data: {
            normal: codeViewSelectedNormal.name,
            hover: codeViewSelectedHover.name,
            active: codeViewSelectedClick.name,
            disabled: codeViewSelectedDisabled.name,
        },
    } as IReactIcon),
    tableView: ({
        name: 'tableView',
        data: {
            normal: tableViewNormal.name,
            hover: tableViewHover.name,
            active: tableViewClick.name,
            disabled: tableViewDisabled.name,
        },
    } as IReactIcon),
    tableViewSelected: ({
        name: 'tableViewSelected',
        data: {
            normal: tableViewSelectedNormal.name,
            hover: tableViewSelectedHover.name,
            active: tableViewSelectedClick.name,
            disabled: tableViewSelectedDisabled.name,
        },
    } as IReactIcon),

    application: ({
        name: 'application',
        data: {
            normal: applicationNormal.name,
            hover: applicationHover.name,
            disabled: applicationDisabled.name,
        },
    } as IReactIcon),
    cplusAnalysis: ({
        name: 'cplusAnalysis',
        data: {
            normal: cplusAnalysisNormal.name,
            hover: cplusAnalysisHover.name,
            disabled: cplusAnalysisDisabled.name,
        },
    } as IReactIcon),
    memAccessAnalysis: ({
        name: 'memAccessAnalysis',
        data: {
            normal: memAccessAnalysisNormal.name,
            hover: memAccessAnalysisHover.name,
            disabled: memAccessAnalysisDisabled.name,
        },
    } as IReactIcon),
    ioAnalysis: ({
        name: 'ioAnalysis',
        data: {
            normal: ioAnalysisNormal.name,
            hover: ioAnalysisHover.name,
            disabled: ioAnalysisDisabled.name,
        },
    } as IReactIcon),
    lockAnalysis: ({
        name: 'lockAnalysis',
        data: {
            normal: lockAnalysisNormal.name,
            hover: lockAnalysisHover.name,
            disabled: lockAnalysisDisabled.name,
        },
    } as IReactIcon),
    microAnalysis: ({
        name: 'microAnalysis',
        data: {
            normal: microAnalysisNormal.name,
            hover: microAnalysisHover.name,
            disabled: microAnalysisDisabled.name,
        },
    } as IReactIcon),
    panoramicAnalysis: ({
        name: 'panoramicAnalysis',
        data: {
            normal: panoramicAnalysisNormal.name,
            hover: panoramicAnalysisHover.name,
            disabled: panoramicAnalysisDisabled.name,
        },
    } as IReactIcon),
    processAnalysis: ({
        name: 'processAnalysis',
        data: {
            normal: processAnalysisNormal.name,
            hover: processAnalysisHover.name,
            disabled: processAnalysisDisabled.name,
        },
    } as IReactIcon),
    resourceAnalysis: ({
        name: 'resourceAnalysis',
        data: {
            normal: resourceAnalysisNormal.name,
            hover: resourceAnalysisHover.name,
            disabled: resourceAnalysisDisabled.name,
        },
    } as IReactIcon),
    system: ({
        name: 'system',
        data: {
            normal: systemNormal.name,
            hover: systemHover.name,
            disabled: systemDisabled.name,
        },
    } as IReactIcon),
    hpcAnalysis: ({
        name: 'system',
        data: {
            normal: hpcAnalysisNormal.name,
            hover: hpcAnalysisHover.name,
            disabled: hpcAnalysisDisabled.name,
        },
    } as IReactIcon),
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
    arrowDownDouble: ({
        name: 'arrowDownDouble',
        data: {
            normal: arrowDownDoubleNormal.name,
            hover: arrowDownDoubleHover.name,
            active: arrowDownDoubleClick.name,
            disabled: arrowDownDoubleDisabled.name,
        },
    } as IReactIcon),
};
