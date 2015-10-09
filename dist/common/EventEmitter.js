"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),EventEmitter=function(){function e(){_classCallCheck(this,e),this.events=new Map}return _createClass(e,[{key:"addEventListener",value:function(e,t){if(t instanceof Function){var n=this.events.get(e);return n&&n.size||(n=new Set,this.events.set(e,n)),n.has(t)||n.add(t),this}throw new TypeError}},{key:"removeEventListener",value:function(e,t){if(t instanceof Function){var n=this.events.get(e);return n?(n.has(t)&&n["delete"](t),n.size||this.events["delete"](e),this):this}throw new TypeError}},{key:"emit",value:function(e){var t=this.events.get(e);if(!t||!t.size)return!1;var n=!0,r=!1,i=void 0;try{for(var a=arguments.length,o=Array(a>1?a-1:0),s=1;a>s;s++)o[s-1]=arguments[s];for(var v,l=t[Symbol.iterator]();!(n=(v=l.next()).done);n=!0){var u=v.value;u.apply(null,o)}}catch(c){r=!0,i=c}finally{try{!n&&l["return"]&&l["return"]()}finally{if(r)throw i}}}}]),e}();exports.EventEmitter=EventEmitter,EventEmitter.prototype.on=EventEmitter.prototype.addEventListener,EventEmitter.prototype.off=EventEmitter.prototype.removeEventListener,exports["default"]=EventEmitter;