(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Chart = factory());
}(this, function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  var FIRST_INDEX = 1;
  var CHART_TYPE_X = 'x';
  var CHART_TYPE_LINE = 'line';
  var CHART_TYPE_AREA = 'area';
  var CHART_TYPE_BAR = 'bar';
  var X_AXIS_HEIGHT = 25;
  var X_LABEL_TIME_WIDTH = 50;
  var X_LABEL_DATE_WIDTH = 70;
  var X_TYPE_DATE = 'data';
  var Y_LABEL_SPACING = 20;
  var Y_STICK_LEFT = 'left';
  var Y_STICK_RIGHT = 'right';
  var MONTH_SHORT_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTH_FULL_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'Jule', 'August', 'September', 'October', 'November', 'December'];
  var DAY_SHORT_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function hasStatePercentage(state) {
    var has = false;
    state.yAxes.forEach(function (axis) {
      if (axis.visible) {
        has = has || axis.percentage;
      }
    });
    return has;
  }
  function prepareData(id, column, type, dataset) {
    return {
      id: id,
      column: column,
      type: type,
      color: dataset.colors[id],
      name: dataset.names[id],
      visible: true,
      groupId: null,
      yAxis: null,
      stacked: false,
      opacity: 1,
      power: 1,
      transitions: []
    };
  }
  function makeTransition(obj, prop, ts, duration, endValue) {
    obj.transitions.push([prop, ts, duration, obj[prop], endValue]);
  }
  function clearTransitions(obj) {
    obj.transitions.length = 0; // eslint-disable-line
  }
  var T_PROP = 0;
  var T_START_TS = 1;
  var T_DURATION = 2;
  var T_START_VALUE = 3;
  var T_END_VALUE = 4;
  function haveTransitions(obj) {
    return Boolean(obj.transitions.length);
  }
  function hasTransition(obj, name) {
    if (haveTransitions(obj)) {
      for (var i = 0; i < obj.transitions.length; i += 1) {
        if (obj.transitions[i][T_PROP] === name) {
          return true;
        }
      }
    }

    return false;
  }
  function applyTransitions(obj, currentTs) {
    if (!haveTransitions(obj)) {
      return 0;
    }

    var transitions = obj.transitions;
    var remindTransitions = transitions.length;

    for (var i = 0; i < transitions.length; i += 1) {
      var t = transitions[i];
      var startValue = t[T_START_VALUE];
      var endValue = t[T_END_VALUE];
      var nextValue = startValue + (currentTs - t[T_START_TS]) * (endValue - startValue) / t[T_DURATION];

      if (startValue > endValue && nextValue <= endValue || startValue <= endValue && nextValue >= endValue) {
        nextValue = endValue;
        remindTransitions -= 1;
      } // eslint-disable-next-line


      obj[t[T_PROP]] = nextValue;
    }

    if (transitions.length && !remindTransitions) {
      // eslint-disable-next-line
      transitions.length = 0;
    }

    return remindTransitions;
  }
  var log10 = Math.log10 || function (x) {
    return Math.log(x) / Math.LN10;
  };
  function getMinMax(column, startIndex, endIndex, mm) {
    /* eslint-disable no-param-reassign */
    var min = mm.min,
        max = mm.max;

    for (var idx = startIndex; idx <= endIndex; idx += 1) {
      if (column[idx] > max) {
        max = column[idx];
      }

      if (column[idx] < min) {
        min = column[idx];
      }
    }
    /* eslint-enable no-param-reassign */


    return {
      min: min,
      max: max
    };
  }
  function calcYTicks(min, max, ticks) {
    if (ticks === void 0) {
      ticks = 5;
    }

    var range = (max - min) * 0.75;
    var tempStep = range / ticks;
    var mag = Math.floor(log10(tempStep));
    var magPow = Math.pow(10, mag); // eslint-disable-line

    var magMsd = Math.floor(tempStep / magPow + 0.5);
    var step = magPow * magMsd;
    var nextMin = step * Math.floor(min / step);
    var nextMax = step * Math.ceil(max / step);
    var nextTicks = Math.round((nextMax - nextMin) / step); // TODO: проверить на маленьких числах

    if (nextTicks > ticks) {
      step = step < 10 ? step + 1 : Math.round(step * nextTicks / ticks);
      nextMax = nextMin + step * ticks;
    } else if (nextTicks < ticks) {
      nextMax = Math.round(step * ticks);
    }

    return {
      min: nextMin,
      max: nextMax,
      step: step
    };
    /* eslint-enable no-param-reassign, no-restricted-properties */
  }
  function calcXTickStep(scale, tickWidth) {
    var tmpStep = Math.round(tickWidth / scale);
    var tickStep = 1;

    while (tickStep < tmpStep) {
      tickStep *= 2;
    }

    return tickStep;
  }
  function correctXStartIndex(startIndex, tickStep) {
    while (startIndex < FIRST_INDEX) {
      startIndex += tickStep; // eslint-disable-line
    }

    return startIndex;
  }
  function formatDMn(d) {
    return d.getUTCDate() + " " + MONTH_SHORT_NAMES[d.getUTCMonth()];
  }
  function formatDMonth(d) {
    return d.getUTCDate() + " " + MONTH_FULL_NAMES[d.getUTCMonth()];
  }
  function formatDMonthYYYY(d) {
    return formatDMonth(d) + " " + d.getUTCFullYear();
  }
  function formatDayDMnYYYY(d) {
    return DAY_SHORT_NAMES[d.getUTCDay()] + ", " + formatDMn(d) + " " + d.getUTCFullYear();
  }

  function getRAF() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
      return window.setTimeout(callback, 1000 / 60);
    };
  }

  var rAF = getRAF();
  var createViewport = function createViewport(x, y, width, height) {
    return {
      x: x,
      y: y,
      width: width,
      height: height
    };
  };
  function createEl(tagName, cls, attrs) {
    var el = document.createElement(tagName);

    if (cls) {
      el.className = cls;
    }

    if (_typeof(attrs) === 'object') {
      // eslint-disable-next-line
      for (var attrName in attrs) {
        el.setAttribute(attrName, attrs[attrName]);
      }
    }

    return el;
  }
  function addClass(el, className) {
    var newClassName = el.className + " " + className; // eslint-disable-next-line no-param-reassign

    el.className = newClassName.trim();
  }
  function removeClass(el, className) {
    // eslint-disable-next-line no-param-reassign
    el.className = el.className.replace(className, '').replace(/\s/g, ' ').trim();
  }
  function hideEl(el) {
    // eslint-disable-next-line no-param-reassign
    el.style.display = 'none';
  }
  function showEl(el) {
    // eslint-disable-next-line no-param-reassign
    el.style.display = null;
  }
  function onEvent(el, eventNames, cb, options) {
    eventNames.split(',').forEach(function (name) {
      return el.addEventListener(name, cb, options);
    });
  }
  function offEvent(el, eventNames, cb) {
    eventNames.split(',').forEach(function (name) {
      return el.removeEventListener(name, cb);
    });
  }
  function getPageX(event) {
    return (event.touches ? event.touches[0] : event).pageX;
  }
  function getOffsetX(event) {
    if (event.touches) {
      var touch = event.touches[0];
      var rect = touch.target.getBoundingClientRect();
      return touch.clientX - rect.left;
    } else {
      return event.offsetX;
    }
  }
  function bindObjectMethods(object, methods) {
    methods.forEach(function (name) {
      if (name in object) {
        // eslint-disable-next-line no-param-reassign
        object[name] = object[name].bind(object);
      }
    });
  }

  var styles = {"-webkit-filter":"Filter_filter-1_Qgx","filter":"Filter_filter-1_Qgx","checkbox":"Filter_checkbox-37oPe","input":"Filter_input-yqUE1","icon":"Filter_icon-1IpOz","label":"Filter_label-3nMgK","day":"Filter_day-2l6Yo","night":"Filter_night-3MNmW"};

  function checkboxTpl(item) {
    var input = "<input class=\"" + styles.input + "\" name=\"" + item.id + "\" type=\"checkbox\" " + (item.visible ? 'checked' : '') + ">";
    var icon = "<div class=\"" + styles.icon + "\"></div>";
    var name = "<div class=\"" + styles.label + "\">" + item.name + "</div>";
    return "<label class=\"" + styles.checkbox + "\" style=\"color:" + item.color + "\">" + input + icon + name + "</label>";
  }

  var Filter =
  /*#__PURE__*/
  function () {
    function Filter(state, onChange) {
      this.themeName = null;
      this.state = state;
      this.$el = createEl('div', styles.filter);
      this.render();
      this.$el.addEventListener('change', function (_ref) {
        var _ref$target = _ref.target,
            name = _ref$target.name,
            checked = _ref$target.checked;
        return onChange(name, checked);
      });
    }

    var _proto = Filter.prototype;

    _proto.setTheme = function setTheme(themeName) {
      if (this.themeName) {
        removeClass(this.$el, styles[this.themeName]);
      }

      addClass(this.$el, styles[themeName]);
      this.themeName = themeName;
    };

    _proto.render = function render() {
      var data = this.state.data;

      if (data.length > 1) {
        this.$el.innerHTML = data.reduce(function (html, item) {
          return html + checkboxTpl(item);
        }, '');
      }
    };

    return Filter;
  }();

  var styles$1 = {"scroll":"Scroll_scroll-iTusj","canvas":"Scroll_canvas-2wzZL","cover":"Scroll_cover-3gg5l","day":"Scroll_day-nNWqJ","night":"Scroll_night-16SZq","slider":"Scroll_slider-2chX9","leftHand":"Scroll_leftHand-34oNu","rightHand":"Scroll_rightHand-3GcYT","centerHand":"Scroll_centerHand-7WkGf"};

  var _hands;
  var hands = (_hands = {}, _hands[styles$1.leftHand] = true, _hands[styles$1.rightHand] = true, _hands[styles$1.centerHand] = true, _hands);
  var sideSliderWidth = 15;

  var Scroll =
  /*#__PURE__*/
  function () {
    function Scroll(range, minRange, onChange) {
      this.themeName = null;
      this.range = range;
      this.minRange = minRange;
      this.state = {
        left: 0,
        right: 0
      };
      this.visible = true;
      this.activeControl = null;
      this.prevPageX = null;
      this.onChange = onChange;
      this.initDom();
      bindObjectMethods(this, ['handleMove', 'handleMoveEnd', 'handleMoveStart']);
      onEvent(this.$el, 'mousedown,touchstart', this.handleMoveStart);
    }

    var _proto = Scroll.prototype;

    _proto.initDom = function initDom() {
      this.$el = createEl('div', styles$1.scroll);
      this.$canvas = createEl('canvas', styles$1.canvas);
      this.$leftCover = createEl('div', styles$1.cover);
      this.$rightCover = createEl('div', styles$1.cover);
      this.$slider = createEl('div', styles$1.slider);
      this.$slider.innerHTML = "<div class=\"" + styles$1.leftHand + "\"></div><div class=\"" + styles$1.rightHand + "\"></div><div class=\"" + styles$1.centerHand + "\"></div>";
      this.$el.appendChild(this.$canvas);
      this.$el.appendChild(this.$leftCover);
      this.$el.appendChild(this.$rightCover);
      this.$el.appendChild(this.$slider);
    };

    _proto.destroy = function destroy() {
      this.activeControl = null;
      this.detachMoveEvents();
      offEvent(window, 'mousedown,touchstart', this.handleMoveStart);
    };

    _proto.update = function update() {
      var _this$$el = this.$el,
          offsetHeight = _this$$el.offsetHeight,
          offsetTop = _this$$el.offsetTop,
          offsetWidth = _this$$el.offsetWidth;
      this.vp = createViewport(0, offsetTop, offsetWidth, offsetHeight);
      this.width = this.vp.width - 2 * sideSliderWidth;
      this.leftMin = sideSliderWidth;
      this.rightMax = this.width + sideSliderWidth;
      this.updateState();
      this.redrawControls();
    };

    _proto.updateState = function updateState() {
      this.state.left = Math.round(this.range[0] * this.width) + sideSliderWidth;
      this.state.right = Math.round(this.range[1] * this.width) + sideSliderWidth;
      this.state.minWidth = Math.round(this.minRange * this.width);
    };

    _proto.updateRange = function updateRange() {
      this.range[0] = (this.state.left - sideSliderWidth) / this.width;
      this.range[1] = (this.state.right - sideSliderWidth) / this.width;
    };

    _proto.setTheme = function setTheme(themeName) {
      if (this.themeName) {
        removeClass(this.$el, styles$1[this.themeName]);
      }

      addClass(this.$el, styles$1[themeName]);
      this.themeName = themeName;
    };

    _proto.setRange = function setRange(range) {
      this.range = range;
      this.updateState();
    };

    _proto.attachMoveEvents = function attachMoveEvents() {
      onEvent(window, 'mousemove,touchmove', this.handleMove);
      onEvent(window, 'mouseup,touchend,touchcancel', this.handleMoveEnd);
    };

    _proto.detachMoveEvents = function detachMoveEvents() {
      offEvent(window, 'mousemove,touchmove', this.handleMove);
      offEvent(window, 'mouseup,touchend,touchcancel', this.handleMoveEnd);
    };

    _proto.handleMoveStart = function handleMoveStart(event) {
      var className = event.target.className;

      if (hands[className]) {
        this.activeControl = className;
        this.prevPageX = getPageX(event);
        this.attachMoveEvents();
      }
    };

    _proto.handleMove = function handleMove(event) {
      var _this = this;

      var delta = getPageX(event) - this.prevPageX;

      if (delta) {
        var appliedDelta = this.applyDelta(delta);

        if (appliedDelta) {
          this.prevPageX += appliedDelta;
          this.updateRange();
          this.onChange(this.range);
          rAF(function () {
            return _this.redrawControls();
          });
        }
      }
    };

    _proto.handleMoveEnd = function handleMoveEnd() {
      this.activeControl = null;
      this.detachMoveEvents();
    };

    _proto.applyDelta = function applyDelta(delta) {
      var _this$state = this.state,
          left = _this$state.left,
          right = _this$state.right,
          minWidth = _this$state.minWidth;
      var width = right - left;
      var appliedDelta = delta;
      var nextLeft = left;
      var nextRight = right;

      if (this.activeControl === styles$1.leftHand) {
        nextLeft += delta;

        if (nextLeft > right - minWidth) {
          nextLeft = right - minWidth;
        } else if (nextLeft < this.leftMin) {
          nextLeft = this.leftMin;
        }

        appliedDelta = nextLeft - left;
      } else if (this.activeControl === styles$1.rightHand) {
        nextRight += delta;

        if (nextRight < left + minWidth) {
          nextRight = left + minWidth;
        } else if (nextRight > this.rightMax) {
          nextRight = this.rightMax;
        }

        appliedDelta = nextRight - right;
      } else if (this.activeControl === styles$1.centerHand) {
        nextLeft += delta;
        nextRight += delta;

        if (nextRight > this.rightMax) {
          nextRight = this.rightMax;
          nextLeft = nextRight - width;
        } else if (nextLeft < this.leftMin) {
          nextLeft = this.leftMin;
          nextRight = nextLeft + width;
        }

        appliedDelta = nextLeft - left;
      }

      this.state.left = nextLeft;
      this.state.right = nextRight;
      return appliedDelta;
    };

    _proto.redrawControls = function redrawControls() {
      var $slider = this.$slider,
          $leftCover = this.$leftCover,
          $rightCover = this.$rightCover,
          width = this.width;
      var _this$state2 = this.state,
          left = _this$state2.left,
          right = _this$state2.right;
      $slider.style.cssText = "left:" + (left - sideSliderWidth) + "px; right: " + (width - right + sideSliderWidth) + "px";
      $leftCover.style.right = width - left + 2 * sideSliderWidth + "px";
      $rightCover.style.left = right + "px";
    };

    return Scroll;
  }();

  var XAxis =
  /*#__PURE__*/
  function () {
    function XAxis(column, type) {
      var dates = [];
      var labels = [];

      for (var i = FIRST_INDEX; i < column.length; i += 1) {
        dates[i] = new Date(column[i]);
      }

      this.dataSize = column.length - FIRST_INDEX;
      this.type = type;
      this.column = column;
      this.dates = dates;
      this.labels = labels;
      this.tickWidth = null;
      this.tickStep = null;
      this.indexStep = null;
      this.opacityStep = null;
      this.offset = 0;
      this.scale = 0;
      this.opacity = 0;
      this.transitions = [];
      this.preview = {
        offset: 0,
        scale: 0
      };
    }

    var _proto = XAxis.prototype;

    _proto.prepare = function prepare(width) {
      var lastIndex = this.dataSize - 1;
      var labelWidth = this.type === X_TYPE_DATE ? X_LABEL_DATE_WIDTH : X_LABEL_TIME_WIDTH;
      this.tickWidth = labelWidth / width;
      this.anchorIndex = Math.round(lastIndex * (1 - this.tickWidth / 2)) + FIRST_INDEX;
    };

    _proto.getLabel = function getLabel(index) {
      return formatDMn(this.dates[index]);
    };

    _proto.getOpacity = function getOpacity(index) {
      return 1;
    };

    _proto.updateScale = function updateScale(range, baseWidth, ts) {
      var rangeWidth = range[1] - range[0];
      var nextScale = baseWidth / ((this.dataSize - 1) * rangeWidth);
      var nextOffset = -(baseWidth * range[0] / rangeWidth + FIRST_INDEX * nextScale);
      var nextTickStep = calcXTickStep(nextScale, this.tickWidth);
      var offsetIndex = this.anchorIndex % nextTickStep;
      var nextStartIndex = Math.round((this.dataSize - 1) * range[0]) + FIRST_INDEX;
      nextStartIndex -= (nextStartIndex - offsetIndex) % nextTickStep;
      nextStartIndex = correctXStartIndex(nextStartIndex, nextTickStep);
      var tickStep = this.tickStep;
      var indexStep = this.indexStep,
          opacity = this.opacity,
          opacityStep = this.opacityStep;

      if (!tickStep) {
        clearTransitions(this);
        opacity = 1;
        indexStep = nextTickStep;
        opacityStep = nextTickStep;
      } else if (tickStep !== nextTickStep) {
        if (nextTickStep > tickStep) {
          opacity = 1; // startIndex !== nextStartIndex ? 0 : 1;

          indexStep = Math.max(1, nextTickStep / 2);
          opacityStep = nextTickStep;
        } else {
          opacity = 0;
          indexStep = nextTickStep;
          opacityStep = nextTickStep * 2;
        }

        if (ts) {
          clearTransitions(this);
          makeTransition(this, 'opacity', ts, 200, 1 - opacity);
        } else {
          opacity = 1 - opacity;
        }
      }

      this.offsetIndex = offsetIndex;
      this.startIndex = nextStartIndex;
      this.tickStep = nextTickStep;
      this.indexStep = indexStep;
      this.opacity = opacity;
      this.opacityStep = opacityStep;
      this.offset = nextOffset;
      this.scale = nextScale;
      this.preview.scale = baseWidth / (this.dataSize - 1);
      this.preview.offset = -FIRST_INDEX * this.preview.scale;
      this.init = false;
    };

    return XAxis;
  }();

  /* eslint-disable no-underscore-dangle */

  var YAxis =
  /*#__PURE__*/
  function () {
    function YAxis(stick) {
      this.color = null;
      this.visible = false;
      this.stick = stick; // right

      this.dataIds = [];
      this.totalStacked = [null];
      this.percentage = false; // draw scale

      this.opacity = 1;
      this.scale = 0; // visible scale

      this.ticks = null;
      this.transitions = [];
      this.preview = {
        scale: 0,
        ticks: null,
        visible: true,
        transitions: []
      };
    }

    var _proto = YAxis.prototype;

    _proto._updateScale = function _updateScale(context, startIndex, endIndex, dataById, ts) {
      var dataIds = this.dataIds;
      var isVisible = false;
      var hasStacked = false;
      var mm = {
        min: Infinity,
        max: -Infinity
      };

      for (var i = 0; i < dataIds.length; i += 1) {
        var data = dataById[dataIds[i]];

        if (data.visible) {
          if (!data.stacked || data.stacked && !hasStacked) {
            mm = getMinMax(data.column, startIndex, endIndex, mm);
          }

          isVisible = true;
          hasStacked = hasStacked || data.stacked;
        }
      }

      if (hasStacked) {
        mm.min = 0;
        mm = getMinMax(this.totalStacked, startIndex, endIndex, mm);
      }
      /* eslint-disable no-param-reassign */


      context.visible = isVisible;

      if (!isVisible) {
        // TODO: добавить анимацию затухания
        return;
      }

      var ticks = context.ticks;

      if (this.percentage) {
        var _nextTicks = {
          min: 0,
          max: 120,
          step: 20
        };
        var nextScale = 120 / mm.max; // TODO: delete

        if (!ticks || nextScale !== context.scale) {
          context.ticks = _nextTicks;
          context.scale = nextScale;
        }

        return;
      }

      var nextTicks = calcYTicks(mm.min, mm.max);

      if (!ticks || ticks.min !== nextTicks.min || ticks.max !== nextTicks.max) {
        context.ticks = nextTicks;

        var _nextScale = 1 / (nextTicks.max - nextTicks.min);

        if (ticks) {
          context.opacity = 0;
          makeTransition(context, 'opacity', ts, 200, 1);
          makeTransition(context, 'scale', ts, 200, _nextScale);
        } else {
          context.scale = _nextScale;
        }
      }
      /* eslint-enable no-param-reassign */

    };

    _proto.updateScale = function updateScale(startIndex, endIndex, dataById, ts) {
      this._updateScale(this, startIndex, endIndex, dataById, ts);
    };

    _proto.updatePreview = function updatePreview(startIndex, endIndex, dataById, ts) {
      this._updateScale(this.preview, startIndex, endIndex, dataById, ts);
    };

    _proto.updateTotalStacked = function updateTotalStacked(dataById) {
      var dataIds = this.dataIds,
          totalStacked = this.totalStacked;
      var visibleCount = 0;

      for (var i = 0; i < dataIds.length; i += 1) {
        var data = dataById[dataIds[i]];

        if (data.visible && data.stacked) {
          var column = data.column;

          if (visibleCount === 0) {
            for (var j = FIRST_INDEX; j < column.length; j += 1) {
              totalStacked[j] = column[j];
            }
          } else {
            for (var _j = FIRST_INDEX; _j < column.length; _j += 1) {
              totalStacked[_j] += column[_j];
            }
          }

          visibleCount += 1;
        }
      }
    };

    return YAxis;
  }();

  var State =
  /*#__PURE__*/
  function () {
    function State(dataset) {
      this.baseWidth = 1;
      this.firstIndex = FIRST_INDEX;
      this.lastIndex = null;
      this.range = [0, 1];
      this.ts = null;
      this.haveTransitions = false;
      this.prepareDataset(dataset);
    }

    var _proto = State.prototype;

    _proto.setRange = function setRange(range, updatePreview) {
      var firstIndex = this.firstIndex,
          dataSize = this.dataSize;
      this.range = range;
      this.updateXAxis();
      var intervals = dataSize - 1;
      var startIndex = Math.floor(intervals * range[0]) + firstIndex;
      var endIndex = Math.ceil(intervals * range[1]) + firstIndex;

      if (this.startIndex !== startIndex || this.endIndex !== endIndex) {
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.updateYAxes(updatePreview);
        this.haveTransitions = true;
      }
    };

    _proto.setVisible = function setVisible(id, visible) {
      var dataById = this.dataById;
      var dataItem = dataById[id];

      if (dataItem.visible !== visible) {
        dataItem.visible = visible;

        if (dataItem.type === CHART_TYPE_LINE || !dataItem.stacked) {
          makeTransition(dataItem, 'opacity', this.ts, 200, visible ? 1 : 0);
        }

        if (dataItem.stacked && !dataItem.yAxis.percentage) {
          makeTransition(dataItem, 'power', this.ts, 200, visible ? 1 : 0);
        }

        this.haveTransitions = true;
        this.updateYAxes(true);
      }
    };

    _proto.tick = function tick() {
      var data = this.data,
          yAxes = this.yAxes,
          xAxis = this.xAxis,
          ts = this.ts;
      var remainTransitions = 0;

      for (var i = 0; i < data.length; i += 1) {
        remainTransitions += applyTransitions(data[i], ts);
      }

      for (var _i = 0; _i < yAxes.length; _i += 1) {
        var yAxis = yAxes[_i];
        remainTransitions += applyTransitions(yAxis, ts);
        remainTransitions += applyTransitions(yAxis.preview, ts);
      }

      remainTransitions += applyTransitions(xAxis, ts);
      this.haveTransitions = Boolean(remainTransitions);
    };

    _proto.prepareDataset = function prepareDataset(dataset) {
      var data = [];
      var dataById = {};
      var yAxes = [];
      var xAxis;
      var stacked = Boolean(dataset.stacked);
      yAxes[0] = new YAxis(Y_STICK_LEFT);

      if (dataset.y_scaled) {
        for (var o = 1; o < dataset.columns.length; o += 1) {
          yAxes[o] = new YAxis(o % 2 ? Y_STICK_RIGHT : Y_STICK_LEFT);
        }
      }

      var yAxisIdx = 0;
      dataset.columns.forEach(function (column) {
        var id = column[0];
        var type = dataset.types[id];

        if (type === CHART_TYPE_X) {
          xAxis = new XAxis(column, X_TYPE_DATE);
        } else {
          var dataItem = prepareData(id, column, type, dataset);
          data.push(dataItem);
          dataById[id] = dataItem;
          yAxes[yAxisIdx].dataIds.push(id);
          dataItem.stacked = stacked;
          dataItem.groupId = yAxisIdx;
          dataItem.yAxis = yAxes[yAxisIdx];

          if (dataset.y_scaled) {
            yAxes[yAxisIdx].color = dataItem.color;
            yAxisIdx += 1;
          }
        }
      });

      if (dataset.percentage) {
        yAxes.forEach(function (yAxis) {
          yAxis.percentage = true; // eslint-disable-line
        });
      }

      if (dataset.stacked) {
        yAxes.forEach(function (yAxis) {
          return yAxis.updateTotalStacked(dataById);
        });
      }

      this.lastIndex = xAxis.column.length - FIRST_INDEX;
      this.dataset = dataset;
      this.data = data;
      this.dataById = dataById;
      this.yAxes = yAxes;
      this.xAxis = xAxis;
      this.dataSize = xAxis.column.length - this.firstIndex;
    };

    _proto.prepareXAxis = function prepareXAxis(width) {
      this.xAxis.prepare(width);
      this.updateXAxis(true);
    };

    _proto.updateXAxis = function updateXAxis(forceUpdate) {
      this.xAxis.updateScale(this.range, this.baseWidth, this.ts, forceUpdate);
    };

    _proto.updateYAxes = function updateYAxes(updatePreview) {
      var dataById = this.dataById,
          yAxes = this.yAxes,
          firstIndex = this.firstIndex,
          startIndex = this.startIndex,
          endIndex = this.endIndex,
          lastIndex = this.lastIndex;

      for (var i = 0; i < yAxes.length; i += 1) {
        yAxes[i].updateTotalStacked(dataById);
        yAxes[i].updateScale(startIndex, endIndex, dataById, this.ts);

        if (updatePreview) {
          yAxes[i].updatePreview(firstIndex, lastIndex, dataById, this.ts);
        }
      }
    };

    return State;
  }();

  function getPixelRatio() {
    return window.devicePixelRatio || 1;
  }
  var pixelRatio = getPixelRatio();

  function setScale(ctx) {
    ctx.scale(pixelRatio, pixelRatio);
  }

  function getContext(canvas) {
    return canvas.getContext('2d');
  }
  function clearRect(ctx, vp) {
    ctx.save();
    setScale(ctx);
    ctx.clearRect(vp.x, vp.y, vp.width, vp.height);
    ctx.restore();
  }

  function prepareDrawingText(ctx, color, theme) {
    ctx.font = theme.fontSize + " " + theme.fontFamily;
    ctx.fillStyle = color;
  }

  function drawCharts(ctx, state, vp, drawPreview, lineWidth) {
    if (drawPreview === void 0) {
      drawPreview = false;
    }

    if (lineWidth === void 0) {
      lineWidth = 2;
    }

    var data = state.data,
        xAxis = state.xAxis;
    var startIndex;
    var endIndex;
    var xProps; // TODO: вынести на уровень вызова

    if (drawPreview) {
      startIndex = state.firstIndex;
      endIndex = state.lastIndex;
      xProps = xAxis.preview;
    } else {
      /* eslint-disable prefer-destructuring */
      startIndex = state.startIndex;
      endIndex = state.endIndex;
      /* eslint-disable prefer-destructuring */

      xProps = xAxis;
    }

    ctx.save();
    var offsetX = xProps.offset * vp.width;
    var stepX = xProps.scale * vp.width;
    var offsetStacked;
    var poweredData;
    var poweredDataIds = {}; // Prepare powered data

    for (var dataIdx = 0; dataIdx < data.length; dataIdx += 1) {
      var dataItem = data[dataIdx];

      if (dataItem.stacked && hasTransition(dataItem, 'power')) {
        var power = dataItem.power,
            column = dataItem.column;
        poweredDataIds[dataItem.id] = true;

        if (!poweredData) {
          poweredData = [];

          for (var i = startIndex; i <= endIndex; i += 1) {
            poweredData[i] = power * column[i];
          }
        } else {
          for (var _i = startIndex; _i <= endIndex; _i += 1) {
            poweredData[_i] += power * column[_i];
          }
        }
      }
    } // Drawing


    var _loop = function _loop(_dataIdx) {
      var dataItem = data[_dataIdx];

      if (!(dataItem.visible || haveTransitions(dataItem))) {
        return "continue"; // eslint-disable-line no-continue
      }

      var column = dataItem.column,
          yAxis = dataItem.yAxis,
          power = dataItem.power,
          type = dataItem.type;
      var percentage = yAxis.percentage,
          totalStacked = yAxis.totalStacked;
      var yProps = drawPreview ? yAxis.preview : yAxis;
      var stepY = (percentage ? 100 / yProps.ticks.max : yProps.scale) * vp.height;
      var poweredStepY = stepY * power;
      var minYValue = yProps.ticks.min;
      ctx.save();
      setScale(ctx);
      ctx.globalAlpha = dataItem.opacity;
      ctx.beginPath();
      ctx.lineJoin = 'round';
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = dataItem.color;
      ctx.fillStyle = dataItem.color;

      var getXByIdx = function getXByIdx(idx) {
        return idx * stepX + offsetX;
      };

      var getYByIdx = void 0;

      if (dataItem.stacked) {
        if (!offsetStacked) {
          offsetStacked = [];

          for (var _i2 = startIndex; _i2 <= endIndex; _i2 += 1) {
            offsetStacked[_i2] = 0;
          }
        }

        getYByIdx = percentage ? function (idx) {
          return vp.height - (offsetStacked[idx] += (column[idx] - minYValue) * poweredStepY / totalStacked[idx]);
        } : function (idx) {
          return vp.height - (offsetStacked[idx] += (column[idx] - minYValue) * poweredStepY >> 0 || 1);
        };
        ctx.globalCompositeOperation = 'destination-over';
      } else {
        getYByIdx = percentage ? function (valueIndex) {
          return vp.height - poweredStepY * (column[valueIndex] - minYValue) / yProps.ticks.max;
        } : function (valueIndex) {
          return vp.height - (column[valueIndex] - minYValue) * poweredStepY;
        };
      }

      if (type === CHART_TYPE_LINE) {
        ctx.moveTo(getXByIdx(startIndex), getYByIdx(startIndex));

        for (var index = startIndex + 1; index <= endIndex; index += 1) {
          ctx.lineTo(getXByIdx(index), getYByIdx(index));
        }

        ctx.stroke();
      } else if (type === CHART_TYPE_BAR) {
        var valueY0 = vp.height;
        var valueY;
        var valueX;
        ctx.moveTo(getXByIdx(startIndex - 0.5), valueY0);

        for (var _index = startIndex; _index <= endIndex; _index += 1) {
          valueX = getXByIdx(_index - 0.5);
          valueY = getYByIdx(_index);
          ctx.lineTo(valueX, valueY);
          ctx.lineTo(valueX + stepX, valueY);
        }

        ctx.lineTo(getXByIdx(endIndex + 0.5), valueY0);
        ctx.closePath();
        ctx.fill();
      } else if (type === CHART_TYPE_AREA) {
        var _valueY = vp.height;
        ctx.moveTo(getXByIdx(startIndex), _valueY);

        for (var _index2 = startIndex; _index2 <= endIndex; _index2 += 1) {
          ctx.lineTo(getXByIdx(_index2), getYByIdx(_index2));
        }

        ctx.lineTo(getXByIdx(endIndex), _valueY);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };

    for (var _dataIdx = 0; _dataIdx < data.length; _dataIdx += 1) {
      var _ret = _loop(_dataIdx);

      if (_ret === "continue") continue;
    }

    ctx.restore();
  }
  function drawYAxes(ctx, state, vp, theme) {
    var yAxes = state.yAxes;
    ctx.save();
    setScale(ctx);
    prepareDrawingText(ctx, theme.yLabelColor, theme);
    ctx.lineWidth = pixelRatio === 1 ? 2 : 1.5;
    var leftOffset = 0;
    var rightOffset = 0;
    var showGrid = true;

    for (var axisIdx = 0; axisIdx < yAxes.length; axisIdx += 1) {
      var yAxis = yAxes[axisIdx];
      var color = yAxis.color,
          ticks = yAxis.ticks,
          scale = yAxis.scale,
          stick = yAxis.stick,
          visible = yAxis.visible,
          percentage = yAxis.percentage;

      if (!(visible || hasTransition(yAxis, 'opacity'))) {
        continue; // eslint-disable-line
      }

      var stepY = (percentage ? 1 / ticks.max : scale) * vp.height;

      if (color) {
        ctx.fillStyle = color;
      }

      ctx.strokeStyle = theme.gridColor;
      ctx.textAlign = stick;
      ctx.beginPath();
      ctx.globalAlpha = yAxis.opacity;

      for (var label = ticks.min; label < ticks.max; label += ticks.step) {
        var y = Math.round(vp.height - (label - ticks.min) * stepY);
        var x = vp.x;
        ctx.fillText(label, stick === Y_STICK_LEFT ? x + leftOffset : vp.width + x + rightOffset, y - 7);

        if (showGrid) {
          ctx.moveTo(x, y);
          ctx.lineTo(vp.width, y);
        }
      }

      ctx.stroke();
      showGrid = false;
      var labelWidth = ctx.measureText(ticks.max).width + Y_LABEL_SPACING;

      if (stick === Y_STICK_LEFT) {
        leftOffset += labelWidth;
      } else {
        rightOffset -= labelWidth;
      }
    }

    ctx.restore();
  }
  function drawXAxis(ctx, state, vp, theme) {
    var xAxis = state.xAxis,
        endIndex = state.endIndex;
    ctx.save();
    setScale(ctx);
    prepareDrawingText(ctx, theme.xLabelColor, theme);
    ctx.textAlign = 'center';
    var stepX = xAxis.scale * vp.width;
    var offsetX = xAxis.offset * vp.width;
    var labelIndex = xAxis.startIndex;

    while (labelIndex < endIndex) {
      ctx.globalAlpha = xAxis.getOpacity(labelIndex);
      ctx.fillText(xAxis.getLabel(labelIndex), labelIndex * stepX + offsetX, vp.height + vp.y - 4);
      labelIndex += xAxis.tickStep;
    }

    ctx.restore();
  }
  function drawCursor(ctx, state, index, vp, theme) {
    var data = state.data,
        xAxis = state.xAxis;
    ctx.save();
    setScale(ctx);
    var cursorLineWidth = pixelRatio === 1 ? 2 : 1.5;
    var stepX = xAxis.scale * vp.width;
    var offsetX = xAxis.offset * vp.width;
    var coordX = index * stepX + offsetX;
    var showLine = false;
    var showFade = false;

    for (var dataIdx = 0; dataIdx < data.length; dataIdx += 1) {
      var dataItem = data[dataIdx];

      if (!dataItem.visible) {
        continue; // eslint-disable-line
      }

      var type = dataItem.type;

      if (type === CHART_TYPE_LINE || type === CHART_TYPE_AREA) {
        showLine = true;
      } else if (type === CHART_TYPE_BAR) {
        showFade = true;
      }
    }

    if (showLine) {
      ctx.beginPath();
      ctx.lineWidth = cursorLineWidth;
      ctx.strokeStyle = theme.cursorLineColor;
      ctx.moveTo(coordX, 0);
      ctx.lineTo(coordX, vp.height);
      ctx.stroke();
    }

    if (showFade) {
      ctx.fillStyle = theme.cursorFadeColor;
      var rectX = coordX - stepX / 2;
      ctx.fillRect(vp.x, vp.y, rectX, vp.height);
      rectX = coordX + stepX / 2;
      ctx.fillRect(rectX, vp.y, vp.width - rectX, vp.height);
    }

    for (var _dataIdx2 = 0; _dataIdx2 < data.length; _dataIdx2 += 1) {
      var _dataItem = data[_dataIdx2];

      if (!_dataItem.visible) {
        continue; // eslint-disable-line
      }

      var type = _dataItem.type,
          yAxis = _dataItem.yAxis;
      var stepY = vp.height * yAxis.scale;

      if (type === CHART_TYPE_LINE) {
        ctx.beginPath();
        ctx.strokeStyle = _dataItem.color;
        ctx.lineWidth = '3';
        ctx.fillStyle = theme.backgroundColor;
        ctx.arc(coordX, vp.height - (_dataItem.column[index] - yAxis.ticks.min) * stepY, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    } // for (let dataIdx = 0; dataIdx < data.length; dataIdx += 1) {
    //   const { type, visible } = data[dataIdx];
    // }
    //
    // dataset.order.forEach((id) => {
    //   const data = dataset.data[id];
    //
    //   if (!data.visible) {
    //     return;
    //   }
    //
    //   ctx.beginPath();
    //   ctx.strokeStyle = data.color;
    //   ctx.lineWidth = '3';
    //   ctx.fillStyle = theme.backgroundColor;
    //   ctx.arc(coordX, data.column[index] * stepY, 6, 0, 2 * Math.PI);
    //   ctx.fill();
    //   ctx.stroke();
    // });


    ctx.restore();
  }

  var base = {
    fontFamily: '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Light", Helvetica, Arial , Verdana, sans-serif',
    fontSize: '15px'
  };
  var light = Object.assign({}, base, {
    backgroundColor: '#ffffff',
    cursorColor: '#E0E6EA',
    gridColor: '#f4f4f4',
    labelColor: '#929EA6',
    fadeColor: 'rgba(242,246,250,0.7)',
    sliderColor: 'rgba(100,144,177,0.4)'
  });
  var dark = Object.assign({}, base, {
    backgroundColor: '#262F3D',
    cursorColor: '#3E4A59',
    gridColor: '#333D4C',
    labelColor: '#586776',
    fadeColor: 'rgba(28,37,50,0.8)',
    sliderColor: 'rgba(100,144,177,0.4)'
  });
  var day = Object.assign({}, base, {
    backgroundColor: '#ffffff',
    cursorLineColor: 'rgba(24,45,59,.1)',
    cursorFadeColor: 'rgba(255,255,255,.5)',
    gridColor: 'rgba(24,45,59,.1)',
    xLabelColor: 'rgba(37,37,41,0.5)',
    yLabelColor: 'rgba(37,37,41,0.5)'
  });
  var night = Object.assign({}, base, {
    backgroundColor: '#242F3E',
    cursorLineColor: 'rgba(255,255,255,.2)',
    cursorFadeColor: 'rgba(36,47,62,.5)',
    gridColor: 'rgba(255,255,255,.1)',
    xLabelColor: 'rgba(163,177,194,0.6)',
    yLabelColor: 'rgba(236,242,248,0.5)'
  });

  var themes = /*#__PURE__*/Object.freeze({
    light: light,
    dark: dark,
    day: day,
    night: night
  });

  var styles$2 = {"chartWrap":"Chart_chartWrap-13R36","day":"Chart_day-1hPoJ","bubble":"Chart_bubble-3NMVD","night":"Chart_night-2z16N","noData":"Chart_noData-3MF8u","header":"Chart_header-3lmAk","range":"Chart_range-1c0_Z","charts":"Chart_charts-3KEDM","canvas":"Chart_canvas-3MU0P","cursorZone":"Chart_cursorZone-1IxmZ","bubbleDate":"Chart_bubbleDate-s4zYX","bubbleContent":"Chart_bubbleContent-3M7g5","bubbleItem":"Chart_bubbleItem-1d5Lj","bubbleVal":"Chart_bubbleVal-2qwdV","table":"Chart_table-23YYP","tdPercents":"Chart_tdPercents-3iIds","tdValue":"Chart_tdValue-3Jtfa"};

  function tableTpl(content) {
    return "<table class=\"" + styles$2.table + "\"><tbody>" + content + "</tbody></table>";
  }

  function tableRowTpl(name, value, color, percents, percentage) {
    var cells = '';

    if (percentage) {
      cells += "<td class=\"" + styles$2.tdPercents + "\">" + (percents >> 0) + "%</td>"; // eslint-disable-line
    }

    cells += "<td class=\"" + styles$2.tdName + "\">" + name + "</td>";
    cells += "<td class=\"" + styles$2.tdValue + "\" style=\"color: " + color + ";\">" + value + "</td>";
    return "<tr>" + cells + "</tr>";
  }

  function bubbleTpl(state, index) {
    var data = state.data,
        dates = state.xAxis.dates;
    var hasPercentage = hasStatePercentage(state);
    var items = '';
    var header = "<div class=\"" + styles$2.bubbleDate + "\">" + formatDayDMnYYYY(dates[index]) + "</div>";
    data.forEach(function (dataItem) {
      if (!dataItem.visible) {
        return;
      }

      var color = dataItem.color,
          column = dataItem.column,
          name = dataItem.name,
          yAxis = dataItem.yAxis;
      var percents = yAxis.percentage ? column[index] * 100 / yAxis.totalStacked[index] : null;
      items += tableRowTpl(name, column[index], color, percents, hasPercentage);
    });
    var content = "<div class=\"" + styles$2.bubbleContent + "\">" + tableTpl(items) + "</div>";
    return "<div class=\"" + styles$2.bubbleWrap + "\">" + header + content + "</div>";
  }

  var Chart =
  /*#__PURE__*/
  function () {
    function Chart(container, headerText, sourceData, theme) {
      this.theme = null;
      this.themeName = null;
      this.defaultRange = [0.75, 1];
      this.state = new State(sourceData);
      this.changes = {
        range: null,
        visible: null
      };
      this.drawing = false;
      this.initDom(container);
      this.initScroll();
      this.initFilter();
      this.initContext();
      this.initCursor();
      bindObjectMethods(this, ['redraw']);
      this.setHeader(headerText);
      this.setTheme(theme);
      this.update();
    }

    var _proto = Chart.prototype;

    _proto.initDom = function initDom(container) {
      this.$el = createEl('div', styles$2.chartWrap);
      this.$header = createEl('div', styles$2.header);
      this.$range = createEl('div', styles$2.range);
      this.$charts = createEl('div', styles$2.charts);
      this.$chartsCanvas = createEl('canvas', styles$2.canvas);
      this.$deskCanvas = createEl('canvas', styles$2.canvas);
      this.$cursorZone = createEl('div', styles$2.cursorZone);
      this.$bubble = createEl('div', styles$2.bubble);
      hideEl(this.$bubble);
      this.$cursorZone.appendChild(this.$bubble);
      this.$charts.appendChild(this.$chartsCanvas);
      this.$charts.appendChild(this.$deskCanvas);
      this.$charts.appendChild(this.$cursorZone);
      this.$el.appendChild(this.$header);
      this.$el.appendChild(this.$range);
      this.$el.appendChild(this.$charts);
      container.appendChild(this.$el);
    };

    _proto.initContext = function initContext() {
      this.chartsCtx = getContext(this.$chartsCanvas);
      this.deskCtx = getContext(this.$deskCanvas);
      this.previewCtx = getContext(this.scroll.$canvas);
    };

    _proto.initFilter = function initFilter() {
      var _this = this;

      this.filter = new Filter(this.state, function (id, visible) {
        return _this.setVisible(id, visible);
      });
      this.$el.appendChild(this.filter.$el);
    };

    _proto.initScroll = function initScroll() {
      var _this2 = this;

      this.scroll = new Scroll(this.defaultRange, 0.01, function (range) {
        return _this2.setRange(range);
      });
      this.$el.appendChild(this.scroll.$el);
      this.scroll.update();
    };

    _proto.initCursor = function initCursor() {
      bindObjectMethods(this, ['handleCursorStart', 'handleCursorMove', 'handleCursorEnd']);
      this.showCursor = false;
      this.cursorIndex = null;
      onEvent(this.$cursorZone, 'mouseenter,touchstart', this.handleCursorStart);
    };

    _proto.update = function update() {
      this.updateScene();
      this.state.prepareXAxis(this.vp.main.width);
      this.scroll.update();
      this.state.setRange(this.scroll.range, true);
      this.draw();
      this.drawPreview();
      this.updateRange();
    };

    _proto.updateScene = function updateScene() {
      var $chartsCanvas = this.$chartsCanvas,
          $deskCanvas = this.$deskCanvas,
          $previewCanvas = this.scroll.$canvas;
      var mainHeight = $chartsCanvas.offsetHeight,
          mainWidth = $chartsCanvas.offsetWidth;
      var previewHeight = $previewCanvas.offsetHeight,
          previewWidth = $previewCanvas.offsetWidth;
      var pixelRatio = getPixelRatio();
      /* eslint-disable no-param-reassign */

      [$chartsCanvas, $deskCanvas, $previewCanvas].forEach(function (canvas) {
        canvas.height = canvas.offsetHeight * pixelRatio;
        canvas.width = canvas.offsetWidth * pixelRatio;
      });
      /* eslint-enable no-param-reassign */

      this.vp = {
        main: createViewport(0, 0, mainWidth, mainHeight),
        charts: createViewport(0, 0, mainWidth, mainHeight - X_AXIS_HEIGHT),
        preview: createViewport(0, 0, previewWidth, previewHeight)
      };
    };

    _proto.updateRange = function updateRange() {
      var _this$state = this.state,
          startIndex = _this$state.startIndex,
          endIndex = _this$state.endIndex,
          dates = _this$state.xAxis.dates;
      this.$range.innerText = formatDMonthYYYY(dates[startIndex]) + " - " + formatDMonthYYYY(dates[endIndex]);
    };

    _proto.setHeader = function setHeader(text) {
      this.$header.innerText = text;
    };

    _proto.setTheme = function setTheme(themeName) {
      if (this.themeName !== themeName) {
        if (this.theme) {
          removeClass(this.$el, styles$2[this.themeName]);
        }

        addClass(this.$el, styles$2[themeName]);
        this.theme = themes[themeName];
        this.themeName = themeName;
        this.scroll.setTheme(themeName);
        this.filter.setTheme(themeName);
        this.update();
      }
    };

    _proto.setRange = function setRange(range) {
      this.changes.range = range;
      this.scheduleChanges();
    };

    _proto.setVisible = function setVisible(id, visible) {
      this.changes.visible = {
        id: id,
        visible: visible
      };
      this.scheduleChanges();
    };

    _proto.scheduleChanges = function scheduleChanges() {
      if (!this.drawing) {
        this.drawing = true;
        rAF(this.redraw);
      }
    };

    _proto.redraw = function redraw(ts) {
      var changes = this.changes,
          state = this.state;
      state.ts = ts;
      state.tick();

      if (changes.range) {
        state.setRange(changes.range);
        changes.range = null;
      } else if (changes.visible) {
        state.setVisible(changes.visible.id, changes.visible.visible);
        changes.visible = null;
        this.drawPreview();
      } else {
        this.drawPreview();
      }

      this.updateRange();
      this.draw();

      if (state.haveTransitions) {
        rAF(this.redraw);
      } else {
        this.drawing = false;
      }
    };

    _proto.draw = function draw() {
      var theme = this.theme;
      clearRect(this.chartsCtx, this.vp.main);
      drawCharts(this.chartsCtx, this.state, this.vp.charts, false, 3, theme);
      clearRect(this.deskCtx, this.vp.main);
      this.drawAxes();
    };

    _proto.drawPreview = function drawPreview() {
      if (this.scroll.visible) {
        clearRect(this.previewCtx, this.vp.preview);
        drawCharts(this.previewCtx, this.state, this.vp.preview, true);
      }
    };

    _proto.drawAxes = function drawAxes() {
      var theme = this.theme;
      drawYAxes(this.deskCtx, this.state, this.vp.charts, theme);
      drawXAxis(this.deskCtx, this.state, this.vp.main, theme);
    } // start: Cursor
    ;

    _proto.attachCursorEvents = function attachCursorEvents() {
      onEvent(this.$cursorZone, 'mousemove,touchmove', this.handleCursorMove);
      onEvent(this.$cursorZone, 'mouseleave,touchend,touchcancel', this.handleCursorEnd);
    };

    _proto.detachCursorEvents = function detachCursorEvents() {
      offEvent(this.$cursorZone, 'mousemove,touchmove', this.handleCursorMove);
      offEvent(this.$cursorZone, 'mouseleave,touchend,touchcancel', this.handleCursorEnd);
    };

    _proto.handleCursorStart = function handleCursorStart(e) {
      this.showCursor = true;
      this.attachCursorEvents();
      this.moveCursor(getOffsetX(e));
    };

    _proto.handleCursorMove = function handleCursorMove(e) {
      if (this.showCursor) {
        this.moveCursor(getOffsetX(e));
      } else {
        this.hideCursor();
      }
    };

    _proto.handleCursorEnd = function handleCursorEnd() {
      this.hideCursor();
    };

    _proto.moveCursor = function moveCursor(x) {
      var _this3 = this;

      var deskCtx = this.deskCtx,
          state = this.state,
          vp = this.vp,
          theme = this.theme;
      rAF(function () {
        var xAxis = state.xAxis;
        var index = Math.round((x / vp.charts.width - xAxis.offset) / xAxis.scale);

        if (index < state.startIndex) {
          index = state.startIndex;
        } else if (index > state.endIndex) {
          index = state.endIndex;
        }

        if (_this3.cursorIndex !== index) {
          _this3.cursorIndex = index;

          _this3.renderBubble();

          clearRect(deskCtx, _this3.vp.main);
          drawCursor(deskCtx, state, index, vp.charts, theme);

          _this3.drawAxes();
        }
      });
    };

    _proto.hideCursor = function hideCursor() {
      var _this4 = this;

      this.showCursor = false;
      this.cursorIndex = null;
      this.detachCursorEvents();
      hideEl(this.$bubble);
      rAF(function () {
        clearRect(_this4.deskCtx, _this4.vp.main);

        _this4.drawAxes();
      });
    };

    _proto.renderBubble = function renderBubble() {
      var $bubble = this.$bubble,
          state = this.state,
          cursorIndex = this.cursorIndex,
          vp = this.vp;

      if (!this.showCursor) {
        return;
      }

      showEl($bubble);
      var xAxis = state.xAxis;
      $bubble.innerHTML = bubbleTpl(state, cursorIndex);
      var bubbleWidth = $bubble.offsetWidth;
      var stepX = xAxis.scale * vp.main.width;
      var offsetX = xAxis.offset * vp.main.width;
      var cursorX = Math.round(cursorIndex * stepX + offsetX);
      var bubbleX = cursorX - bubbleWidth - 20;

      if (bubbleX < 20) {
        bubbleX = cursorX + 20;
      }

      $bubble.style.left = bubbleX + "px";
    } // end: Cursor
    ;

    return Chart;
  }();

  return Chart;

}));
