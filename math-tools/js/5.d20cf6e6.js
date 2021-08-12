(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[5],{"2c3f":function(t,e,s){"use strict";s("bbdf")},"78f2":function(t,e,s){"use strict";function a(t){return"string"===typeof t||"number"===typeof t?!t:!!Array.isArray(t)&&0===t.length}s.d(e,"a",(function(){return a}))},"82ac":function(t,e,s){"use strict";s("c8e56")},"887c":function(t,e,s){"use strict";s.r(e);var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("q-page",{staticClass:"flex flex-center column justify-center bg-dark"},[s("div",{staticClass:"text-h5 text-center text-white q-mt-sm"},[t._v("\n    "+t._s(t.$t("storagePage.title"))+"\n  ")]),s("div",{staticClass:"column items-center q-ma-md"},[t.items.length?t._e():s("div",{staticClass:"q-subheading text-white"},[t._v("\n      "+t._s(t.$t("storagePage.isEmpty"))+"\n    ")]),t.items.length?s("q-list",{attrs:{highlight:"",dark:""}},[s("draggable",t._b({staticClass:"list-group",attrs:{handle:".handle"},model:{value:t.items,callback:function(e){t.items=e},expression:"items"}},"draggable",t.dragOptions,!1),t._l(t.items,(function(e,a){return s("q-item",{key:e.id,staticClass:"list-group-item"},[s("q-item-section",[s("code-display",{attrs:{maxLength:t.maxCodeDisplayLength,item:e.value}})],1),s("q-item-section",{attrs:{avatar:""}},[s("q-avatar",{staticClass:"handle",attrs:{"text-color":"white",icon:"import_export"}})],1),s("q-item-section",{attrs:{avatar:""}},[s("q-avatar",{attrs:{"text-color":"green",icon:"insert_drive_file"},nativeOn:{click:function(s){return t.copy(e.value)}}})],1),s("q-item-section",{attrs:{avatar:""}},[s("q-avatar",{attrs:{"text-color":"red",icon:"highlight_off"},nativeOn:{click:function(e){return t.trash(a)}}})],1)],1)})),1)],1):t._e()],1)])},r=[],i=s("ee60"),n=s("b3b5"),o=s("b76a"),c=s.n(o),l=s("60a3"),u=function(t,e,s,a){var r,i=arguments.length,n=i<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,s):a;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)n=Reflect.decorate(t,e,s,a);else for(var o=t.length-1;o>=0;o--)(r=t[o])&&(n=(i<3?r(n):i>3?r(e,s,n):r(e,s))||n);return i>3&&n&&Object.defineProperty(e,s,n),n};let d=class extends l["c"]{constructor(){super(...arguments),this.dragOptions={animation:200,group:"description",disabled:!1,ghostClass:"ghost"}}get items(){return this.$store.state.storage.list}set items(t){this.$store.commit("storage/updateList",t),this.$store.dispatch("storage/save").catch((t=>console.error(t)))}get maxCodeDisplayLength(){return Math.floor(this.$q.screen.width-180)/10}copy(t){Object(i["a"])(t,this)}trash(t){this.$store.commit("storage/remove",t),this.$store.dispatch("storage/save").catch((t=>console.error(t)))}};d=u([Object(l["a"])({components:{draggable:c.a,CodeDisplay:n["a"]}})],d);var g=d,p=g,f=(s("82ac"),s("2877")),h=s("9989"),m=s("1c1c"),b=s("66e5"),v=s("4074"),y=s("cb32"),x=s("eebe"),O=s.n(x),j=Object(f["a"])(p,a,r,!1,null,null,null);e["default"]=j.exports;O()(j,"components",{QPage:h["a"],QList:m["a"],QItem:b["a"],QItemSection:v["a"],QAvatar:y["a"]})},b3b5:function(t,e,s){"use strict";var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",[s("highlightjs",{class:t.contentClass,attrs:{language:"javascript",code:t.displayCode}}),s("q-tooltip",{attrs:{"content-class":"bg-dark text-white tooltipCode",anchor:"top middle"}},[t._v("\n    "+t._s(t.code)+"\n  ")])],1)},r=[],i=s("60a3"),n=function(t,e,s,a){var r,i=arguments.length,n=i<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,s):a;if("object"===typeof Reflect&&"function"===typeof Reflect.decorate)n=Reflect.decorate(t,e,s,a);else for(var o=t.length-1;o>=0;o--)(r=t[o])&&(n=(i<3?r(n):i>3?r(e,s,n):r(e,s))||n);return i>3&&n&&Object.defineProperty(e,s,n),n};let o=class extends i["c"]{constructor(){super(...arguments),this.code=JSON.stringify(this.item),this.displayCode=this.code.length>this.maxLength?this.code.slice(0,this.maxLength-3)+"...":this.code}};n([Object(i["b"])({type:Number,default:1/0})],o.prototype,"maxLength",void 0),n([Object(i["b"])({default:""})],o.prototype,"item",void 0),n([Object(i["b"])({type:String,default:""})],o.prototype,"contentClass",void 0),o=n([i["a"]],o);var c=o,l=c,u=(s("2c3f"),s("2877")),d=s("05c0"),g=s("eebe"),p=s.n(g),f=Object(u["a"])(l,a,r,!1,null,null,null);e["a"]=f.exports;p()(f,"components",{QTooltip:d["a"]})},bbdf:function(t,e,s){},c8e56:function(t,e,s){},ee60:function(t,e,s){"use strict";s.d(e,"a",(function(){return i}));var a=s("2a19"),r=s("78f2");function i(t,e){if(Object(r["a"])(t))return void a["a"].create({type:"negative",message:e.$t("messages.error.copyFailed").toString(),caption:e.$t("messages.error.copyFailedNull").toString()});let s=t;Array.isArray(t)&&(s=t.join(",")),"number"===typeof t&&(s=t.toString()),"string"===typeof s&&e.$copyText(s).then((()=>{a["a"].create({type:"positive",message:e.$t("messages.success.copied").toString()})}),(()=>{a["a"].create({type:"negative",message:e.$t("messages.error.copyFailed").toString()})}))}}}]);