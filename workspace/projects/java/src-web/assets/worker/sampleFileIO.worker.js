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

addEventListener('message', function (data) {
  var newdata = data.data;

  if (newdata.type === 'sFileioWorker') {
    var data2 = handleData(newdata.data);
    postMessage(data2);
  }

  if (newdata.type === 'sFileioWorker_close') {
    close();
  }
});

function handleData(data) {
  var tableListData = [];
  var fileIOData = {};
  data.content.forEach(function (item) {
    var fileData = {};
    handleSampleFileIOData(fileData, item);
    var data = handleViewData(fileData)[0];
    tableListData.push(data);
    fileIOData = Object.assign(fileIOData, fileData);
  });
  return {
    tableListData: tableListData,
    fileIOData: fileIOData
  };
}

function handleSampleFileIOData(fileData, data) {
  var path = data.path;
  var baseIO = data.basicIOSummary;
  var timeZone = data.timeZone.sort();
  var threadsMap = data.ioSummaryMap;
  handleBasicIOData(fileData, path, baseIO, timeZone);

  for (var key in threadsMap) {
    if (Object.prototype.hasOwnProperty.call(threadsMap, key)) {
      var element = threadsMap[key];
      handleBasicIOData(fileData[path].threads, key, element, timeZone);
    }
  }
} // eslint-disable-next-line max-params


function handleBasicIOData(target, path, baseIO, timeZone) {
  if (!target[path]) {
    target[path] = {
      path: path,
      totalIOTime: 0,
      totalCount: 0,
      readCount: 0,
      writeCount: 0,
      bytesRead: 0,
      bytesWritten: 0,
      readSpeed: [],
      writeSpeed: [],
      timeList: [],
      stackTrace: [],
      threads: {},
      isSelect: false,
      showDetails: false
    };
  }

  target[path].totalIOTime += Number(baseIO.totalIOTime);
  target[path].totalCount += Number(baseIO.totalCount);
  target[path].readCount += Number(baseIO.readCount);
  target[path].writeCount += Number(baseIO.writeCount);
  target[path].bytesRead += Number(baseIO.bytesRead);
  target[path].bytesWritten += Number(baseIO.bytesWritten);
  target[path].timeList = timeZone;
  target[path].readSpeed = handleSpeedList(timeZone, baseIO.readEventMap);
  target[path].writeSpeed = handleSpeedList(timeZone, baseIO.writeEventMap);
}

function handleSpeedList(timeZone, speedListData) {
  var speedList = Object.values
    ? Object.values(speedListData)
    : Object.keys(speedListData).map(function (key) {
      return speedListData[key];
    });
  var speed = fillZero(timeZone.length);
  if (speedList.length !== 0) {
    speedList.forEach(function (item) {
      const index = findIndexMath(timeZone, item)
      if (index !== -1) {
        speed[index] = item.speed;
      }
    });
  }
  return speed;
}

function handleViewData(threadsData) {
  if (threadsData) {
    return Object.values
      ? Object.values(threadsData)
      : Object.keys(threadsData).map(function (key) {
        return threadsData[key];
      });
  }

  return Object.values
    ? Object.values(fileIOData)
    : Object.keys(fileIOData).map(function (key) {
      return fileIOData[key];
    });
}

/**
 * ie不兼容fill()方法，用自定义方法实现
 * @param  length 长度
 * @returns 指定长度、填充为0的数组
 */
function fillZero(length) {
  let arr = []
  for (let i = 0; i < length; i++) {
    arr.push(0);
  }
  return arr;
}

/**
 * ie不兼容findIndex,自定义方法实现
 * @param arr 当前数组
 * @param callback 回调
 * @returns 索引
 */
function findIndexMath(arr, item) {
  let idx = -1;
  arr.forEach(function (time, index) {
    if (time === Math.ceil(item.startTime / 1000)) {
      idx = index;
    }
  })
  return idx;
}