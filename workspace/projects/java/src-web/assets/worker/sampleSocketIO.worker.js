"use strict";

addEventListener('message', function (data) {
  var newdata = data.data;

  if (newdata.type === 'sSocketioWorker') {
    var tableListData = handleData(newdata.data);
    postMessage({
      tableListData: tableListData
    });
  }

  if (newdata.type === 'sSocketioWorker_close') {
    close();
  }
});

function handleData(data) {
  var tableListData = [];
  data.content.forEach(function (item) {
    var fileData = {};
    handleSampleFileIOData(fileData, item);
    var data = handleViewData(fileData)[0];
    tableListData.push(data);
  });
  return tableListData;
}

function handleSampleFileIOData(fileData, data) {
  var path = data.ip;
  var baseIO = data.basicIOSummary;
  var timeZone = data.timeZone.sort();
  var threadsMap = data.ioSummaryMap;
  handleBasicIOData(fileData, path, baseIO, timeZone);

  for (var key in threadsMap) {
    if (Object.prototype.hasOwnProperty.call(threadsMap, key)) {
      var element = threadsMap[key].basicIOSummary;
      var threads = threadsMap[key].threadIOSummaryMap;
      handleBasicIOData(fileData[path].threads, key, element, timeZone);

      for (var keys in threads) {
        if (Object.prototype.hasOwnProperty.call(threads, keys)) {
          var ele = threads[keys];
          handleBasicIOData(fileData[path].threads[key].threads, keys, ele, timeZone);
        }
      }
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
      const index = findIndexMath(timeZone,item)
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
function fillZero(length) {
  let arr = []
  for (let i = 0; i < length; i++) {
    arr.push(0);
  }
  return arr;
}

function findIndexMath(arr, item) {
  let idx = -1;
  arr.forEach(function (time, index) {
    if (time === Math.ceil(item.startTime / 1000)) {
      idx = index;
    }
  })
  return idx;
}