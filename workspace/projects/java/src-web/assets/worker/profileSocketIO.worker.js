"use strict";

/* eslint-disable complexity */
var fileDatas = {};
var seocnd = 1000 * 1000
addEventListener("message", function (data) {
  // eslint-disable-next-line no-console
  var newdata = data.data;

  if (newdata.type === "socketIOWs") {
    handleIoData(newdata.data);    
  }

  if (newdata.type === "socketIOWs_close") {
    close();
  }
});

function handleIoData(data) {
  data.forEach(function (item) {
    postMessage(handleEach(item));
  });
}

function getValues(data) {
  // 兼容 ie ie不支持Object.values
  var values = Object.values
    ? Object.values(data)
    : Object.keys(data).map(function (key) {
        return data[key];
      });
  values = values.sort(function (a, b) {
    return b.count - a.count;
  });
  return values;
}
function handleEach(item) {
  var descArr = item.attributes_.description.split(":");
  var ip = descArr[0];
  var host = descArr[1];
  var itemFd = item.attributes_.fd;
  var threadName = item.attributes_.threadName;
  var byte = Number(item.attributes_.throughPut);
  var type = item.attributes_.type;
  var isWrite = type === "write";
  var isRead = type === "read";
  var root = {
    label: "root",
    children: [],
  };
  var option = {
    stackTrace: trackFormat(item.allStackTraces_, root),
    start: dateFormat(item.start_, "hh:mm:ss"),
    originTime: item.start_,
    type: type,
    threadName: threadName,
    duration: item.duration_,
    byte: byte,
    rate: Number(onChangeRate(byte, item.duration_))
  };
  var currentData = {
    ip: ip,
    host: host,
    fd: {
      fileDes: itemFd,
      duration: item.duration_,
      count: isWrite || isRead ? 1 : 0,
      wCount: isWrite ? 1 : 0,
      rCount: isRead ? 1 : 0,
      rByte: isRead ? byte : 0,
      wByte: isWrite ? byte : 0,
      startTime: dateFormat(item.start_, "hh:mm:ss"),
      options: []
    }
  }
  currentData.fd.options.push(option)
  return currentData;
}
function formatType(method) {
  if (method.indexOf("open") >= 0) {
    return "open";
  }

  if (method.indexOf("close") >= 0) {
    return "close";
  }

  if (method.indexOf("write") >= 0) {
    return "write";
  }

  if (method.indexOf("read") >= 0) {
    return "read";
  }
}

function trackFormat(stackTrack, theTree) {
  var node = theTree;
  stackTrack.forEach(function (item) {
    node.children = node.children || [];
    var label =
      item.className_ + " " + item.methodName_ + "(" + item.lineNum_ + ")";
    var obj = {
      label: label,
      expanded: false,
      children: [],
    };
    node.children.push(obj);
    node = obj;
  });
  return JSON.parse(JSON.stringify(theTree));
}

function dateFormat(date, fmt) {
  var getDate = new Date(date);
  var o = {
    "M+": getDate.getMonth() + 1,
    "d+": getDate.getDate(),
    "h+": getDate.getHours(),
    "m+": getDate.getMinutes(),
    "s+": getDate.getSeconds(),
    "q+": Math.floor((getDate.getMonth() + 3) / 3),
    S: getDate.getMilliseconds(),
  };

  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      String(getDate.getFullYear()).substr(4 - RegExp.$1.length)
    );
  }

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1
          ? o[k]
          : ("00" + o[k]).substr(String(o[k]).length)
      );
    }
  }

  return fmt;
}
function onChangeRate(byte, dura) {
    if (byte === 0) {
      return 0;
    }
    if (dura === 0) {
      return 0;
    }
    const KB = (byte / 1024);
    const s = dura / seocnd;
    return (KB / s).toFixed(2);
  }