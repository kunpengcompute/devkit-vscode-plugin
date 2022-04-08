// '{0}事件所占总事件比例为{1}%'.format(a, b) => a事件所占总事件比例为b%
(String as any).prototype.format = function() {
  if (arguments.length === 0) {
    return this;
  }
  const param = arguments[0];
  let s = this;
  if (typeof (param) === 'object') {
    Object.keys(param).forEach(key => {
      s = s.replace(new RegExp('\\{' + key + '\\}', 'g'), param[key]);
    });
    return s;
  } else {
    for (let i = 0; i < arguments.length; i++) {
      s = s.replace(new RegExp(`\\{${i}\\}`, 'g'), arguments[i]);
    }
    return s;
  }
};
