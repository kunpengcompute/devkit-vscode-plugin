"use strict";
// 定义assign方法
if (typeof Object.assign != 'function') {
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) {
      'use strict';
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }
      let obj = Object(target);
      for (var idx = 1; idx < arguments.length; idx++) {
        var nextSource = arguments[idx];
        if (nextSource != null) {
          for (let nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              obj[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return obj;
    },
    writable: true,
    configurable: true
  });
}

var baseTop = 0;
var gridHeight = 16;
var gridInertvalHeight = 32;
var defaultOptions = [];
var defaultLen = 0;
var deleteItems = {};
var deleteStart = 3;
var deleteStartLen = 8;
var getDatas = {
  spec: [],
  values: {}
};
var sData = {};
var fake = {};
var startTime = 0;
var endTime = 0;
var optionsAll = {
  opts: {},
  default: {},
  xLabels: [],
  parsed: {}
};
var count = 1;
var oldThread = [];
var limitCount = 16;
var lastPostMsgTime = 0;
addEventListener('message', function (data) {
  var newdata = data.data;

  if (newdata.type === 'default') {
    defaultOptions = newdata.data;
    defaultLen = defaultOptions.length;
  }

  if (newdata.type === 'ws') {
    var response = parseData(newdata.data);
    const nowDate = Date.now();
    if (nowDate - this.lastPostMsgTime >= 2000) {
      this.lastPostMsgTime = nowDate;
      postMessage(response);
    }
  }

  if (newdata.type === 'historyData') {
    optionsAll.xLabels = optionsAll.xLabels.concat(newdata.data.xLabels);
    getDatas.values = newdata.data.parsed.values;
  }
});

function getDiffArr(array1, array2) {
  const result = [];
  for (var i = 0; i < array2.length; i++) {
    const obj = array2[i];
    const num = obj.threadId;
    var isExist = false;
    for (let j = 0; j < array1.length; j++) {
      const aj = array1[j];
      const n = aj.threadId;
      if (n == num) {
        isExist = true;
        break;
      }
    }
    if (!isExist) {
      result.push(obj);
    }
  }
  return result;
}
function parseData(data) {
  if (count > 1) {
    var diffArr = getDiffArr(data.thread, oldThread);
  }
  oldThread = data.thread;
  count++;

  optionsAll.opts = {};
  optionsAll.default = {};
  data.thread.forEach(function (thread) {
    var datas = getDatas.spec.filter(function (item) {
      return thread.threadId === item.id;
    });

    if (datas.length === 0) {
      getDatas.spec.push({
        name: thread.threadName,
        id: thread.threadId
      });
    }
  });

  if (!getDatas.spec.length) {
    return;
  }

  endTime = data.endTime;
  var startTimeItem = data.startTime;
  optionsAll.xLabels.push(formatLabel(endTime / 1000));
  if (optionsAll.xLabels.length > limitCount) {
    optionsAll.xLabels.shift();
  }
  getDatas.spec.forEach(function (item, index) {
    sData[item.id] = [];
    fake[item.id] = [];
    var curThread = data.thread.filter(function (thr) {
      return thr.threadId === item.id;
    });

    if (!getDatas.values[item.id]) {
      getDatas.values[item.id] = [];
      deleteItems[item.id] = 0;
    }

    getDatas.values[item.id].push({
      start: startTimeItem,
      end: endTime,
      status: curThread.length && curThread[0].threadState || ''
    });

    if (curThread.length && curThread[0].threadState) {
      deleteItems[item.id] += 1;
    } else {
      deleteItems[item.id] -= 1;
    }

    if (deleteItems[item.id] < deleteStart && getDatas.values[item.id].length >= deleteStartLen) {
      delete deleteItems[item.id];
      delete getDatas.values[item.id];
      delete sData[item.id];
      delete fake[item.id];
      defaultOptions = defaultOptions.filter(function (opt) {
        return opt.id !== item.id;
      });
      getDatas.spec.splice(index, 1);
    } else {
      getDatas.values[item.id].forEach(function (val, idx) {
        var color = '#ffffff';

        if (!val.status) {
          return;
        }

        if (val.status) {
          color = val.status === 'RUNNABLE' ? '#7ADFA0' : val.status === 'WAITING' || val.status === 'TIMED_WAITING' ? '#FDCA5A' : '#F45C5E';
        }

        sData[item.id].push([{
          xAxis: val.start,
          itemStyle: {
            color: color
          }
        }, {
          xAxis: Number(val.end) + 1000
        }]);
        fake[item.id].push({
          name: item.name + ',' + idx,
          value: [val.start, val.end]
        });
      });
    }
  });
  Object.keys(getDatas.values).forEach(function (key, index) {
    deleteItems[key] = deleteItems[key] > limitCount ? limitCount : deleteItems[key];

    if (getDatas.values[key].length > limitCount) {
      getDatas.values[key].shift();

      if (sData[key].length > limitCount) {
        sData[key].shift();
      }

      if (fake[key].length > limitCount) {
        fake[key].shift();
      }
    }

    if (index === 0) {
      var len = getDatas.values[key].length;
      startTime = getDatas.values[key][0].start;
      endTime = getDatas.values[key][len - 1].end;
    }
  });

  var options = updataOption(getDatas.spec);
  var optionsDefault = defaultOptions.length > 0 ? updataOption(defaultOptions) : undefined;
  optionsAll.opts = options;
  optionsAll.default = optionsDefault;
  optionsAll.parsed = getDatas;
  return optionsAll;
}

function updataOption(items) {
  var options = {
    series: [],
    grid: [],
    xAxis: [],
    yAxis: [],
    xAxisIndexArr: []
  };
  items.forEach(function (item, index) {
    options.xAxisIndexArr.push(index * 2);
    options.xAxisIndexArr.push((index + 1) * 2 - 1);
    var offsetHeight = 0;
    options.grid.push(makeGrid(baseTop + gridHeight * index + (index + 1) * gridInertvalHeight, {}));
    options.grid.push(makeGrid(baseTop + gridHeight * index + index * gridInertvalHeight + offsetHeight, {
      show: true,
      height: 0,
      z: 1
    }));
    options.series.push({
      name: item.name + '(' + item.id + ')',
      type: 'line',
      symbol: 'circle',
      symbolSize: 2,
      coordinateSystem: 'cartesian2d',
      xAxisIndex: index * 2,
      yAxisIndex: index * 2,
      markArea: {
        data: sData[item.id]
      }
    });
    options.series.push({
      name: 'fake',
      type: 'line',
      symbol: 'none',
      symbolSize: 2,
      coordinateSystem: 'cartesian2d',
      itemStyle: {
        normal: {
          color: 'transparent'
        }
      },
      xAxisIndex: index * 2 + 1,
      yAxisIndex: index * 2 + 1,
      data: fake[item.id]
    });
    options.xAxis.push(makeXAxis(index * 2, {
      axisLine: {
        show: false
      },
      min: startTime,
      max: endTime,
      axisPointer: {
        show: false
      }
    }));
    options.xAxis.push(makeXAxis(index * 2 + 1, {
      position: 'top',
      axisLine: {
        show: false,
        onZero: false
      },
      axisPointer: {
        show: false
      }
    }));
    options.yAxis.push(makeYAxis(index * 2, {
      name: item.name + item.id
    }));
    options.yAxis.push(makeYAxis(index * 2 + 1, {}));
  });
  return options;
}

function makeXAxis(gridIndex, opt) {
  var options = {
    type: 'time',
    gridIndex: gridIndex,
    axisLine: {
      onZero: false,
      lineStyle: {
        color: '#ddd'
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      show: false
    },
    splitLine: {
      show: false,
      lineStyle: {
        color: '#ddd'
      }
    },
    min: startTime,
    max: endTime
  };

  if (opt) {
    Object.assign(options, opt);
  }

  return options;
}

function formatLabel(time) {
  var str = '';
  var h = Math.floor(time / 3600);
  var m = Math.floor((time - h * 3600) / 60);
  var s = Math.floor(time - h * 3600 - m * 60);
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  s = s < 10 ? '0' + s : s;
  str = h !== '00' ? h + ':' + m + ':' + s : m + ':' + s;
  return str;
}

function makeYAxis(gridIndex, opt) {
  var options = {
    type: 'value',
    offset: 30,
    gridIndex: gridIndex,
    nameLocation: 'middle',
    nameTextStyle: {
      color: '#333'
    },
    show: false,
    boundaryGap: ['30%', '30%'],
    axisTick: {
      show: false
    },
    axisLine: {
      lineStyle: {
        color: '#ccc'
      }
    },
    axisLabel: {
      show: false
    },
    splitLine: {
      show: false
    }
  };

  if (opt) {
    Object.assign(options, opt);
  }

  return options;
}

function makeGrid(top, opt) {
  var options = {
    top: top,
    left: 0,
    right: 60,
    height: gridHeight
  };

  if (opt) {
    Object.assign(options, opt);
  }

  return options;
}