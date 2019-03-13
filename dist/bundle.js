"use strict";function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _defineProperties(t,e){for(var i=0;i<e.length;i++){var a=e[i];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}function _createClass(t,e,i){return e&&_defineProperties(t.prototype,e),i&&_defineProperties(t,i),t}function _defineProperty(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function _objectSpread(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{},a=Object.keys(i);"function"==typeof Object.getOwnPropertySymbols&&(a=a.concat(Object.getOwnPropertySymbols(i).filter(function(t){return Object.getOwnPropertyDescriptor(i,t).enumerable}))),a.forEach(function(e){_defineProperty(t,e,i[e])})}return t}var TYPE_X="x",DATE_OPTIONS={day:"numeric",month:"short"},FIRST_INDEX=1,X_LABEL_WIDTH=70;function prepareXAxisData(t,e){for(var i=new Array(e.length),a=new Array(e.length),r=FIRST_INDEX;r<e.length;r+=1){var n=new Date(e[r]);i[r]=n,a[r]=n.toLocaleDateString("hc",DATE_OPTIONS)}return{id:t,type:TYPE_X,column:e,dates:i,labels:a}}function prepareMinMax(t){for(var e=new Array(t.length),i=new Array(t.length),a=t[FIRST_INDEX],r=t[FIRST_INDEX],n=FIRST_INDEX;n<t.length;n+=1){var s=t[n];a=Math.min(a,s),r=Math.max(r,s);for(var o=n+1;o<t.length&&(!i[n]&&s<t[o]&&(i[n]=o),!e[n]&&s>t[o]&&(e[n]=o),!i[n]||!e[n]);o+=1);}return{indexMax:i,indexMin:e,maxValue:r,minValue:a}}function prepareDataset(t){var e={data:{},length:0,firstIndex:FIRST_INDEX,lastIndex:0,order:[],x:null};return Array.isArray(t.columns)?(t.columns.forEach(function(i){var a=i[0],r=i;t.types[a]===TYPE_X?e.x=prepareXAxisData(a,r):(e.order.push(a),e.data[a]=_objectSpread({id:a,column:r,type:t.types[a],name:t.names[a],color:t.colors[a],visible:!0},prepareMinMax(r)))}),e.length=e.x.column.length,e.lastIndex=e.length-1,e):null}function getExtremum(t,e,i,a){for(var r=i;e[r]&&e[r]<=a;)r=e[r];return t[r]}function getDatasetMinMax(t,e,i){var a=-1/0,r=-a;return t.order.forEach(function(n){var s=t.data[n];s.visible&&(a=Math.max(a,getExtremum(s.column,s.indexMax,e,i)),r=Math.min(r,getExtremum(s.column,s.indexMin,e,i)))}),{max:a,min:r}}function updateAxisY(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:6;i<2?i=2:i>2&&(i-=1);var a=(e.max-e.min)/i,r=Math.floor(Math.log10(a)),n=Math.pow(10,r),s=n*Math.floor(a/n+.5);t.min=s*Math.floor(e.min/s),t.max=s*Math.ceil(e.max/s),t.tickStep=s}function updateAxisX(t,e){for(var i=e.lastIndex,a=e.startIndex,r=e.endIndex,n=e.stepX,s=Math.round(X_LABEL_WIDTH/n),o=1;o<s;)o*=2;var l=r-r%o+o;l>i&&(l-=o),t.startIndex=a-a%o,t.endIndex=l,t.tickStep=o}function updateChartsState(t,e,i,a){var r=t.firstIndex,n=t.lastIndex,s=a.width/(i[1]-i[0]);e.lastIndex=n,e.startIndex=Math.floor(n*i[0])+r,e.endIndex=Math.ceil(n*i[1]),updateAxisY(e.axisY,getDatasetMinMax(t,e.startIndex,e.endIndex));var o=e.axisY;e.stepX=s/n,e.stepY=a.height/(o.max-o.min),e.offsetX=-s*i[0],e.offsetY=o.min*e.stepY,updateAxisX(e.axisX,e)}var createViewport=function(t,e,i,a){return{x:t,y:e,width:i,height:a,cx0:arguments.length>4&&void 0!==arguments[4]?arguments[4]:0,cy0:arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,cx1:arguments.length>6&&void 0!==arguments[6]?arguments[6]:0,cy1:arguments.length>7&&void 0!==arguments[7]?arguments[7]:0}};function createEl(t,e,i){var a=document.createElement(t);if(e&&(a.className=e),"object"===_typeof(i))for(var r in i)a.setAttribute(r,i[r]);return a}function getContext(t){return t.getContext("2d")}function getPixelRatio(){return window.devicePixelRatio||1}function rAF(t){return window.requestAnimationFrame(t)}function hideEl(t){t.style.display="none"}function showEl(t){t.style.display=null}function onEvent(t,e,i,a){e.split(",").forEach(function(e){return t.addEventListener(e,i,a)})}function offEvent(t,e,i){e.split(",").forEach(function(e){return t.removeEventListener(e,i)})}function getPageX(t){return(t.touches?t.touches[0]:t).pageX}function getOffsetX(t){if(t.touches){var e=t.touches[0],i=e.target.getBoundingClientRect();return e.clientX-i.left}return t.offsetX}function bindObjectMethods(t,e){e.forEach(function(e){e in t&&(t[e]=t[e].bind(t))})}var styles={"-webkit-filter":"tch-1_Qgx",filter:"tch-1_Qgx",checkbox:"tch-37oPe",input:"tch-yqUE1",icon:"tch-1IpOz"};function checkboxTpl(t,e){var i='<input class="'+styles.input+'" name="'+t+'" type="checkbox" '+(e.visible?"checked":"")+">",a='<div class="'+styles.icon+'" style="color:'+e.color+'"></div>';return'<label class="'+styles.checkbox+'">'+i+a+e.name+"</label>"}var Filter=function(){function t(e,i){_classCallCheck(this,t),this.dataset=e,this.$el=createEl("div",styles.filter),this.render(),this.$el.addEventListener("change",function(t){var e=t.target,a=e.name,r=e.checked;return i(a,r)})}return _createClass(t,[{key:"render",value:function(){var t=this.dataset,e=t.data,i=t.order;this.$el.innerHTML=i.reduce(function(t,i){return t+checkboxTpl(i,e[i])},"")}}]),t}(),theme={textColor:"#929EA6",fontFamily:'"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Light", Helvetica, Arial , Verdana, sans-serif',fontSize:"15px"},gridLevels=[45,120,195,270,345,420].reverse(),pixelRatio=getPixelRatio();function setScale(t){t.scale(pixelRatio,pixelRatio)}function clearRect(t,e){t.save(),setScale(t),t.clearRect(e.x-e.cx0,e.y-e.cy0,e.width+e.cx0+e.cx1,e.height+e.cy0+e.cy1),t.restore()}function drawCharts(t,e,i,a){var r=arguments.length>4&&void 0!==arguments[4]?arguments[4]:2,n=i.startIndex,s=i.endIndex,o=i.stepX,l=i.stepY,h=i.offsetX,c=i.offsetY;t.save(),t.setTransform(pixelRatio,0,0,-pixelRatio,(h+a.x)*pixelRatio,(c+a.height+a.y)*pixelRatio),t.lineJoin="round",t.lineWidth=r,e.order.forEach(function(i){var a=e.data[i],r=a.color,h=a.column;if(a.visible){t.beginPath(),t.strokeStyle=r,t.moveTo(n*o,h[n]*l);for(var c=n+1;c<=s;c+=1)t.lineTo(c*o,h[c]*l);t.stroke()}}),t.restore()}function drawGrid(t,e){t.save(),setScale(t),t.lineWidth=1===pixelRatio?2:1.5,t.strokeStyle="#f4f4f4",t.beginPath(),gridLevels.forEach(function(i){t.moveTo(e.x,i+e.y),t.lineTo(e.width,i+e.y)}),t.stroke(),t.restore()}function drawYLabels(t,e,i){var a=e.axisY;t.save(),setScale(t),t.fillStyle=theme.textColor,t.font=theme.fontSize+" "+theme.fontFamily,gridLevels.forEach(function(e,r){t.fillText(a.min+a.tickStep*r,i.x,e-7+i.y)}),t.restore()}function drawXLabels(t,e,i,a){var r=i.axisX,n=i.offsetX,s=i.stepX;t.save(),t.setTransform(pixelRatio,0,0,pixelRatio,(n+a.x)*pixelRatio,440*pixelRatio),t.fillStyle=theme.textColor,t.textAlign="center",t.font=theme.fontSize+" "+theme.fontFamily;for(var o=r.startIndex;o<=r.endIndex;o+=r.tickStep)t.fillText(e[o],o*s,0);t.restore()}function drawScroll(t,e,i,a){var r=e.right-e.left,n=r+2*i;clearRect(t,a),t.save(),setScale(t),t.fillStyle="rgba(242,246,250,.7)",t.fillRect(a.x,a.y,a.width,a.height),t.fillStyle="rgba(100,144,177,0.4)",t.clearRect(e.left-i,a.y,n,a.height),t.fillRect(e.left-i,a.y,n,a.height),t.clearRect(e.left,a.y+2,r,a.height-4),t.restore()}function drawCursor(t,e,i,a,r){var n=i.stepX,s=i.stepY,o=i.offsetX,l=i.offsetY;clearRect(t,r),t.save(),t.setTransform(pixelRatio,0,0,pixelRatio,(o+r.x)*pixelRatio,r.y*pixelRatio);var h=a*n;t.beginPath(),t.strokeStyle="#E0E6EA",t.moveTo(h,0),t.lineTo(h,r.height),t.stroke(),t.setTransform(pixelRatio,0,0,-pixelRatio,(o+r.x)*pixelRatio,(l+r.height+r.y)*pixelRatio),e.order.forEach(function(i){var r=e.data[i];r.visible&&(t.beginPath(),t.strokeStyle=r.color,t.lineWidth="3",t.fillStyle="#ffffff",t.arc(h,r.column[a]*s,6,0,2*Math.PI),t.fill(),t.stroke())}),t.restore()}var _hands,styles$1={scroll:"tch-iTusj",leftHand:"tch-34oNu",rightHand:"tch-3GcYT",centerHand:"tch-7WkGf","cursor-resize":"tch-OQyLi","cursor-grabbing":"tch-3mX4n"},hands=(_defineProperty(_hands={},styles$1.leftHand,!0),_defineProperty(_hands,styles$1.rightHand,!0),_defineProperty(_hands,styles$1.centerHand,!0),_hands),sideSliderWidth=6;function scrollTpl(){var t=createEl("div",styles$1.scroll),e=createEl("div",styles$1.leftHand),i=createEl("div",styles$1.rightHand),a=createEl("div",styles$1.centerHand);return t.appendChild(e),t.appendChild(i),t.appendChild(a),{$el:t,$leftHand:e,$rightHand:i,$centerHand:a}}var Scroll=function(){function t(e,i,a,r){_classCallCheck(this,t),this.ctx=e,Object.assign(this,scrollTpl()),this.range=i,this.minRange=a,this.state={left:0,right:0},this.activeControl=null,this.prevPageX=null,this.onChange=r,bindObjectMethods(this,["handleMove","handleMoveEnd","handleMoveStart"]),onEvent(window,"mousedown,touchstart",this.handleMoveStart)}return _createClass(t,[{key:"destroy",value:function(){this.activeControl=null,this.detachMoveEvents(),offEvent(window,"mousedown,touchstart",this.handleMoveStart)}},{key:"update",value:function(){var t=this.$el,e=t.offsetHeight,i=t.offsetTop,a=t.offsetWidth;this.vp=createViewport(0,i,a,e),this.width=this.vp.width-2*sideSliderWidth,this.leftMin=sideSliderWidth,this.rightMax=this.width+sideSliderWidth,this.updateState(),this.redrawSlider(),this.redrawControls()}},{key:"updateState",value:function(){this.state.left=Math.round(this.range[0]*this.width)+sideSliderWidth,this.state.right=Math.round(this.range[1]*this.width)+sideSliderWidth,this.state.minWidth=Math.round(this.minRange*this.width)}},{key:"updateRange",value:function(){this.range[0]=(this.state.left-sideSliderWidth)/this.width,this.range[1]=(this.state.right-sideSliderWidth)/this.width}},{key:"attachMoveEvents",value:function(){onEvent(window,"mousemove,touchmove",this.handleMove),onEvent(window,"mouseup,touchend,touchcancel",this.handleMoveEnd)}},{key:"detachMoveEvents",value:function(){offEvent(window,"mousemove,touchmove",this.handleMove),offEvent(window,"mouseup,touchend,touchcancel",this.handleMoveEnd)}},{key:"handleMoveStart",value:function(t){var e=t.target.className;hands[e]&&(this.activeControl=e,this.prevPageX=getPageX(t),this.attachMoveEvents(),hideEl(this.$el))}},{key:"handleMove",value:function(t){var e=getPageX(t)-this.prevPageX;if(e){var i=this.applyDelta(e);i&&(this.prevPageX+=i,this.updateRange(),this.onChange(this.range))}}},{key:"handleMoveEnd",value:function(){this.activeControl=null,this.detachMoveEvents(),this.redrawControls(),showEl(this.$el)}},{key:"applyDelta",value:function(t){var e=this.state,i=e.left,a=e.right,r=e.minWidth,n=a-i,s=t,o=i,l=a;return this.activeControl===styles$1.leftHand?((o+=t)>a-r?o=a-r:o<this.leftMin&&(o=this.leftMin),s=o-i):this.activeControl===styles$1.rightHand?((l+=t)<i+r?l=i+r:l>this.rightMax&&(l=this.rightMax),s=l-a):this.activeControl===styles$1.centerHand&&(o+=t,(l+=t)>this.rightMax?o=(l=this.rightMax)-n:o<this.leftMin&&(l=(o=this.leftMin)+n),s=o-i),this.state.left=o,this.state.right=l,s}},{key:"redrawSlider",value:function(){drawScroll(this.ctx,this.state,sideSliderWidth,this.vp)}},{key:"redrawControls",value:function(){var t=this.state,e=t.left,i=t.right;this.$leftHand.style.left=e-sideSliderWidth+"px",this.$rightHand.style.left=i+"px",this.$centerHand.style.left=e+"px",this.$centerHand.style.width=i-e+"px"}}]),t}(),styles$2={header:"tch-3lmAk",chartWrap:"tch-13R36",charts:"tch-3KEDM",canvas:"tch-3MU0P",cursorZone:"tch-1IxmZ",bubble:"tch-3NMVD",bubbleDate:"tch-s4zYX",bubbleContent:"tch-3M7g5",bubbleItem:"tch-1d5Lj",bubbleVal:"tch-2qwdV"};function chartTpl(){var t=createEl("div",styles$2.chartWrap),e=createEl("div",styles$2.header),i=createEl("div",styles$2.charts),a=createEl("canvas",styles$2.canvas),r=createEl("canvas",styles$2.canvas),n=createEl("div",styles$2.cursorZone),s=createEl("div",styles$2.bubble);return hideEl(s),n.appendChild(s),i.appendChild(a),i.appendChild(r),i.appendChild(n),t.appendChild(e),t.appendChild(i),{$el:t,$header:e,$charts:i,$chartsCanvas:a,$deskCanvas:r,$cursorZone:n,$bubble:s}}function bubbleTpl(t,e){var i='<div class="'+styles$2.bubbleDate+'">'+t.x.labels[e]+"</div>",a="";t.order.forEach(function(i){var r=t.data[i];a+='<div class="'+styles$2.bubbleItem+'" style="color: '+r.color+';"><div class="'+styles$2.bubbleVal+'">'+r.column[e]+"</div>"+r.name+"</div>"});var r='<div class="'+styles$2.bubbleContent+'">'+a+"</div>";return'<div class="'+styles$2.bubbleWrap+'">'+i+r+"</div>"}var Chart=function(){function t(e,i,a){_classCallCheck(this,t),bindObjectMethods(this,["handleFilterChange","handleScrollChange"]),this.dataset=prepareDataset(a),this.state={axisY:{},axisX:{}},this.previewState={axisY:{},axisX:{}},Object.assign(this,chartTpl()),e.appendChild(this.$el),this.chartsCtx=getContext(this.$chartsCanvas),this.deskCtx=getContext(this.$deskCanvas),this.$header.innerText=i,this.scroll=new Scroll(this.deskCtx,[.75,1],.01,this.handleScrollChange),this.$charts.appendChild(this.scroll.$el),this.filter=new Filter(this.dataset,this.handleFilterChange),this.$el.appendChild(this.filter.$el),bindObjectMethods(this,["handleCursorStart","handleCursorMove","handleCursorEnd"]),this.showCursor=!1,this.cursorIndex=null,onEvent(this.$cursorZone,"mouseenter,touchstart",this.handleCursorStart),this.update(),this.redrawPreview(),this.redrawCharts()}return _createClass(t,[{key:"destroy",value:function(){this.scroll.destroy(),this.detachCursorEvents()}},{key:"handleFilterChange",value:function(t,e){this.dataset.data[t].visible=e,this.redrawCharts(),this.redrawPreview()}},{key:"handleScrollChange",value:function(){this.redrawCharts()}},{key:"attachCursorEvents",value:function(){onEvent(this.$cursorZone,"mousemove,touchmove",this.handleCursorMove),onEvent(this.$cursorZone,"mouseleave,touchend,touchcancel",this.handleCursorEnd)}},{key:"detachCursorEvents",value:function(){offEvent(this.$cursorZone,"mousemove,touchmove",this.handleCursorMove),offEvent(this.$cursorZone,"mouseleave,touchend,touchcancel",this.handleCursorEnd)}},{key:"handleCursorStart",value:function(t){this.showCursor=!0,this.attachCursorEvents(),this.moveCursor(getOffsetX(t))}},{key:"handleCursorMove",value:function(t){this.showCursor?this.moveCursor(getOffsetX(t)):this.hideCursor()}},{key:"handleCursorEnd",value:function(){this.hideCursor()}},{key:"update",value:function(){var t=this.$chartsCanvas,e=t.offsetHeight,i=t.offsetWidth,a=getPixelRatio();[this.$chartsCanvas,this.$deskCanvas].forEach(function(t){t.height=e*a,t.width=i*a}),this.vp={grid:createViewport(0,0,i,450),charts:createViewport(0,0,i,420,0,0,0,10),preview:createViewport(0,e-55,i,50,0,10,0,10)},this.scroll.update()}},{key:"updateState",value:function(){updateChartsState(this.dataset,this.state,this.scroll.range,this.vp.charts)}},{key:"updatePreviewState",value:function(){updateChartsState(this.dataset,this.previewState,[0,1],this.vp.preview)}},{key:"moveCursor",value:function(t){var e=this,i=this.deskCtx,a=this.dataset,r=this.state,n=this.vp;rAF(function(){var s=Math.round((t-r.offsetX)/r.stepX);s<r.startIndex?s=r.startIndex:s>r.endIndex&&(s=r.endIndex),e.cursorIndex!==s&&(e.cursorIndex=s,e.redrawBubble(),drawCursor(i,a,r,s,n.charts))})}},{key:"hideCursor",value:function(){var t=this.deskCtx,e=this.vp;this.showCursor=!1,this.cursorIndex=null,this.detachCursorEvents(),hideEl(this.$bubble),rAF(function(){clearRect(t,e.charts)})}},{key:"redrawBubble",value:function(){var t=this.$bubble,e=this.dataset,i=this.state,a=this.cursorIndex,r=this.vp;if(this.showCursor){showEl(t),t.innerHTML=bubbleTpl(e,a);var n=t.offsetWidth,s=Math.round(n/2),o=Math.round(i.stepX*a+i.offsetX)-s;o<0?o=0:o>r.charts.width-n&&(o=r.charts.width-n),t.style.left=o+"px"}}},{key:"redrawCharts",value:function(){var t=this,e=this.chartsCtx,i=this.dataset,a=this.state,r=this.vp;rAF(function(){t.updateState(),t.scroll.redrawSlider(),clearRect(e,r.grid),drawGrid(e,r.grid),drawCharts(e,i,a,r.charts,3),drawYLabels(e,a,r.grid),drawXLabels(e,i.x.labels,a,r.grid)})}},{key:"redrawPreview",value:function(){var t=this,e=this.chartsCtx,i=this.dataset,a=this.previewState,r=this.vp;rAF(function(){t.updatePreviewState(),clearRect(e,r.preview),drawCharts(e,i,a,r.preview)})}}]),t}(),chart=new Chart(document.querySelector(".chartContainer"),"Followers",sourceData[0]);
