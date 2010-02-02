/*
	Copyright (c) 2004-2007, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

/*
	This is a compiled version of Dojo, built for deployment and not for
	development. To get an editable version, please visit:

		http://dojotoolkit.org

	for documentation and information on getting the source.
*/

if(!dojo._hasResource["dijit._base.focus"]){dojo._hasResource["dijit._base.focus"]=true;dojo.provide("dijit._base.focus");dojo.mixin(dijit,{_curFocus:null,_prevFocus:null,isCollapsed:function(){var _1=dojo.global;var _2=dojo.doc;if(_2.selection){return !_2.selection.createRange().text;}else{if(_1.getSelection){var _3=_1.getSelection();if(dojo.isString(_3)){return !_3;}else{return _3.isCollapsed||!_3.toString();}}}},getBookmark:function(){var _4,_5=dojo.doc.selection;if(_5){var _6=_5.createRange();if(_5.type.toUpperCase()=="CONTROL"){_4=_6.length?dojo._toArray(_6):null;}else{_4=_6.getBookmark();}}else{if(dojo.global.getSelection){_5=dojo.global.getSelection();if(_5){var _6=_5.getRangeAt(0);_4=_6.cloneRange();}}else{console.debug("No idea how to store the current selection for this browser!");}}return _4;},moveToBookmark:function(_7){var _8=dojo.doc;if(_8.selection){var _9;if(dojo.isArray(_7)){_9=_8.body.createControlRange();dojo.forEach(_7,_9.addElement);}else{_9=_8.selection.createRange();_9.moveToBookmark(_7);}_9.select();}else{var _a=dojo.global.getSelection&&dojo.global.getSelection();if(_a&&_a.removeAllRanges){_a.removeAllRanges();_a.addRange(_7);}else{console.debug("No idea how to restore selection for this browser!");}}},getFocus:function(_b,_c){return {node:_b&&dojo.isDescendant(dijit._curFocus,_b.domNode)?dijit._prevFocus:dijit._curFocus,bookmark:!dojo.withGlobal(_c||dojo.global,dijit.isCollapsed)?dojo.withGlobal(_c||dojo.global,dijit.getBookmark):null,openedForWindow:_c};},focus:function(_d){if(!_d){return;}var _e="node" in _d?_d.node:_d,_f=_d.bookmark,_10=_d.openedForWindow;if(_e){var _11=(_e.tagName.toLowerCase()=="iframe")?_e.contentWindow:_e;if(_11&&_11.focus){try{_11.focus();}catch(e){}}dijit._onFocusNode(_e);}if(_f&&dojo.withGlobal(_10||dojo.global,dijit.isCollapsed)){if(_10){_10.focus();}try{dojo.withGlobal(_10||dojo.global,moveToBookmark,null,[_f]);}catch(e){}}},_activeStack:[],registerWin:function(_12){if(!_12){_12=window;}dojo.connect(_12.document,"onmousedown",null,function(evt){dijit._ignoreNextBlurEvent=true;setTimeout(function(){dijit._ignoreNextBlurEvent=false;},0);dijit._onTouchNode(evt.target||evt.srcElement);});var _14=_12.document.body||_12.document.getElementsByTagName("body")[0];if(_14){if(dojo.isIE){_14.attachEvent("onactivate",function(evt){if(evt.srcElement.tagName.toLowerCase()!="body"){dijit._onFocusNode(evt.srcElement);}});_14.attachEvent("ondeactivate",function(evt){dijit._onBlurNode();});}else{_14.addEventListener("focus",function(evt){dijit._onFocusNode(evt.target);},true);_14.addEventListener("blur",function(evt){dijit._onBlurNode();},true);}}},_onBlurNode:function(){if(dijit._ignoreNextBlurEvent){dijit._ignoreNextBlurEvent=false;return;}dijit._prevFocus=dijit._curFocus;dijit._curFocus=null;if(dijit._blurAllTimer){clearTimeout(dijit._blurAllTimer);}dijit._blurAllTimer=setTimeout(function(){delete dijit._blurAllTimer;dijit._setStack([]);},100);},_onTouchNode:function(_19){if(dijit._blurAllTimer){clearTimeout(dijit._blurAllTimer);delete dijit._blurAllTimer;}var _1a=[];try{while(_19){if(_19.dijitPopupParent){_19=dijit.byId(_19.dijitPopupParent).domNode;}else{if(_19.tagName&&_19.tagName.toLowerCase()=="body"){if(_19===dojo.body()){break;}_19=dojo.query("iframe").filter(function(_1b){return _1b.contentDocument.body===_19;})[0];}else{var id=_19.getAttribute&&_19.getAttribute("widgetId");if(id){_1a.unshift(id);}_19=_19.parentNode;}}}}catch(e){}dijit._setStack(_1a);},_onFocusNode:function(_1d){if(_1d&&_1d.tagName&&_1d.tagName.toLowerCase()=="body"){return;}dijit._onTouchNode(_1d);if(_1d==dijit._curFocus){return;}dijit._prevFocus=dijit._curFocus;dijit._curFocus=_1d;dojo.publish("focusNode",[_1d]);var w=dijit.byId(_1d.id);if(w&&w._setStateClass){w._focused=true;w._setStateClass();var _1f=dojo.connect(_1d,"onblur",function(){w._focused=false;w._setStateClass();dojo.disconnect(_1f);});}},_setStack:function(_20){var _21=dijit._activeStack;dijit._activeStack=_20;for(var _22=0;_22<Math.min(_21.length,_20.length);_22++){if(_21[_22]!=_20[_22]){break;}}for(var i=_21.length-1;i>=_22;i--){var _24=dijit.byId(_21[i]);if(_24){dojo.publish("widgetBlur",[_24]);if(_24._onBlur){_24._onBlur();}}}for(var i=_22;i<_20.length;i++){var _24=dijit.byId(_20[i]);if(_24){dojo.publish("widgetFocus",[_24]);if(_24._onFocus){_24._onFocus();}}}}});dojo.addOnLoad(dijit.registerWin);}if(!dojo._hasResource["dijit._base.manager"]){dojo._hasResource["dijit._base.manager"]=true;dojo.provide("dijit._base.manager");dojo.declare("dijit.WidgetSet",null,{constructor:function(){this._hash={};},add:function(_25){this._hash[_25.id]=_25;},remove:function(id){delete this._hash[id];},forEach:function(_27){for(var id in this._hash){_27(this._hash[id]);}},filter:function(_29){var res=new dijit.WidgetSet();this.forEach(function(_2b){if(_29(_2b)){res.add(_2b);}});return res;},byId:function(id){return this._hash[id];},byClass:function(cls){return this.filter(function(_2e){return _2e.declaredClass==cls;});}});dijit.registry=new dijit.WidgetSet();dijit._widgetTypeCtr={};dijit.getUniqueId=function(_2f){var id;do{id=_2f+"_"+(dijit._widgetTypeCtr[_2f]!==undefined?++dijit._widgetTypeCtr[_2f]:dijit._widgetTypeCtr[_2f]=0);}while(dijit.byId(id));return id;};if(dojo.isIE){dojo.addOnUnload(function(){dijit.registry.forEach(function(_31){_31.destroy();});});}dijit.byId=function(id){return (dojo.isString(id))?dijit.registry.byId(id):id;};dijit.byNode=function(_33){return dijit.registry.byId(_33.getAttribute("widgetId"));};}if(!dojo._hasResource["dijit._base.place"]){dojo._hasResource["dijit._base.place"]=true;dojo.provide("dijit._base.place");dijit.getViewport=function(){var _34=dojo.global;var _35=dojo.doc;var w=0,h=0;if(dojo.isMozilla){w=_35.documentElement.clientWidth;h=_34.innerHeight;}else{if(!dojo.isOpera&&_34.innerWidth){w=_34.innerWidth;h=_34.innerHeight;}else{if(dojo.isIE&&_35.documentElement&&_35.documentElement.clientHeight){w=_35.documentElement.clientWidth;h=_35.documentElement.clientHeight;}else{if(dojo.body().clientWidth){w=dojo.body().clientWidth;h=dojo.body().clientHeight;}}}}var _38=dojo._docScroll();return {w:w,h:h,l:_38.x,t:_38.y};};dijit.placeOnScreen=function(_39,pos,_3b,_3c){var _3d=dojo.map(_3b,function(_3e){return {corner:_3e,pos:pos};});return dijit._place(_39,_3d);};dijit._place=function(_3f,_40,_41){var _42=dijit.getViewport();if(!_3f.parentNode||String(_3f.parentNode.tagName).toLowerCase()!="body"){dojo.body().appendChild(_3f);}var _43=null;for(var i=0;i<_40.length;i++){var _45=_40[i].corner;var pos=_40[i].pos;if(_41){_41(_45);}var _47=_3f.style.display;var _48=_3f.style.visibility;_3f.style.visibility="hidden";_3f.style.display="";var mb=dojo.marginBox(_3f);_3f.style.display=_47;_3f.style.visibility=_48;var _4a=(_45.charAt(1)=="L"?pos.x:Math.max(_42.l,pos.x-mb.w)),_4b=(_45.charAt(0)=="T"?pos.y:Math.max(_42.t,pos.y-mb.h)),_4c=(_45.charAt(1)=="L"?Math.min(_42.l+_42.w,_4a+mb.w):pos.x),_4d=(_45.charAt(0)=="T"?Math.min(_42.t+_42.h,_4b+mb.h):pos.y),_4e=_4c-_4a,_4f=_4d-_4b,_50=(mb.w-_4e)+(mb.h-_4f);if(_43==null||_50<_43.overflow){_43={corner:_45,aroundCorner:_40[i].aroundCorner,x:_4a,y:_4b,w:_4e,h:_4f,overflow:_50};}if(_50==0){break;}}_3f.style.left=_43.x+"px";_3f.style.top=_43.y+"px";return _43;};dijit.placeOnScreenAroundElement=function(_51,_52,_53,_54){_52=dojo.byId(_52);var _55=_52.style.display;_52.style.display="";var _56=_52.offsetWidth;var _57=_52.offsetHeight;var _58=dojo.coords(_52,true);_52.style.display=_55;var _59=[];for(var _5a in _53){_59.push({aroundCorner:_5a,corner:_53[_5a],pos:{x:_58.x+(_5a.charAt(1)=="L"?0:_56),y:_58.y+(_5a.charAt(0)=="T"?0:_57)}});}return dijit._place(_51,_59,_54);};}if(!dojo._hasResource["dijit._base.window"]){dojo._hasResource["dijit._base.window"]=true;dojo.provide("dijit._base.window");dijit.getDocumentWindow=function(doc){if(dojo.isSafari&&!doc._parentWindow){var fix=function(win){win.document._parentWindow=win;for(var i=0;i<win.frames.length;i++){fix(win.frames[i]);}};fix(window.top);}if(dojo.isIE&&window!==document.parentWindow&&!doc._parentWindow){doc.parentWindow.execScript("document._parentWindow = window;","Javascript");var win=doc._parentWindow;doc._parentWindow=null;return win;}return doc._parentWindow||doc.parentWindow||doc.defaultView;};}if(!dojo._hasResource["dijit._base.popup"]){dojo._hasResource["dijit._base.popup"]=true;dojo.provide("dijit._base.popup");dijit.popup=new function(){var _60=[],_61=1000,_62=1;this.open=function(_63){var _64=_63.popup,_65=_63.orient||{"BL":"TL","TL":"BL"},_66=_63.around,id=(_63.around&&_63.around.id)?(_63.around.id+"_dropdown"):("popup_"+_62++);if(!_63.submenu){this.closeAll();}var _68=dojo.doc.createElement("div");_68.id=id;_68.className="dijitPopup";_68.style.zIndex=_61+_60.length;if(_63.parent){_68.dijitPopupParent=_63.parent.id;}dojo.body().appendChild(_68);_64.domNode.style.display="";_68.appendChild(_64.domNode);var _69=new dijit.BackgroundIframe(_68);var _6a=_66?dijit.placeOnScreenAroundElement(_68,_66,_65,_64.orient?dojo.hitch(_64,"orient"):null):dijit.placeOnScreen(_68,_63,_65=="R"?["TR","BR","TL","BL"]:["TL","BL","TR","BR"]);var _6b=[];_6b.push(dojo.connect(_68,"onkeypress",this,function(evt){if(evt.keyCode==dojo.keys.ESCAPE){_63.onCancel();}}));if(_64.onCancel){_6b.push(dojo.connect(_64,"onCancel",null,_63.onCancel));}_6b.push(dojo.connect(_64,_64.onExecute?"onExecute":"onChange",null,function(){if(_60[0]&&_60[0].onExecute){_60[0].onExecute();}}));_60.push({wrapper:_68,iframe:_69,widget:_64,onExecute:_63.onExecute,onCancel:_63.onCancel,onClose:_63.onClose,handlers:_6b});if(_64.onOpen){_64.onOpen(_6a);}return _6a;};this.close=function(){var _6d=_60[_60.length-1].widget;if(_6d.onClose){_6d.onClose();}if(!_60.length){return;}var top=_60.pop();var _6f=top.wrapper,_70=top.iframe,_6d=top.widget,_71=top.onClose;dojo.forEach(top.handlers,dojo.disconnect);if(!_6d||!_6d.domNode){return;}dojo.style(_6d.domNode,"display","none");dojo.body().appendChild(_6d.domNode);_70.destroy();dojo._destroyElement(_6f);if(_71){_71();}};this.closeAll=function(){while(_60.length){this.close();}};this.closeTo=function(_72){while(_60.length&&_60[_60.length-1].widget.id!=_72.id){this.close();}};}();dijit._frames=new function(){var _73=[];this.pop=function(){var _74;if(_73.length){_74=_73.pop();_74.style.display="";}else{if(dojo.isIE){var _75="<iframe src='javascript:\"\"'"+" style='position: absolute; left: 0px; top: 0px;"+"z-index: -1; filter:Alpha(Opacity=\"0\");'>";_74=dojo.doc.createElement(_75);}else{var _74=dojo.doc.createElement("iframe");_74.src="javascript:\"\"";_74.className="dijitBackgroundIframe";}_74.tabIndex=-1;dojo.body().appendChild(_74);}return _74;};this.push=function(_76){_76.style.display="";if(dojo.isIE){_76.style.removeExpression("width");_76.style.removeExpression("height");}_73.push(_76);};}();if(dojo.isIE&&dojo.isIE<7){dojo.addOnLoad(function(){var f=dijit._frames;dojo.forEach([f.pop()],f.push);});}dijit.BackgroundIframe=function(_78){if(!_78.id){throw new Error("no id");}if((dojo.isIE&&dojo.isIE<7)||(dojo.isFF&&dojo.isFF<3&&dojo.hasClass(dojo.body(),"dijit_a11y"))){var _79=dijit._frames.pop();_78.appendChild(_79);if(dojo.isIE){_79.style.setExpression("width","document.getElementById('"+_78.id+"').offsetWidth");_79.style.setExpression("height","document.getElementById('"+_78.id+"').offsetHeight");}this.iframe=_79;}};dojo.extend(dijit.BackgroundIframe,{destroy:function(){if(this.iframe){dijit._frames.push(this.iframe);delete this.iframe;}}});}if(!dojo._hasResource["dijit._base.scroll"]){dojo._hasResource["dijit._base.scroll"]=true;dojo.provide("dijit._base.scroll");dijit.scrollIntoView=function(_7a){if(dojo.isIE){if(dojo.marginBox(_7a.parentNode).h<=_7a.parentNode.scrollHeight){_7a.scrollIntoView(false);}}else{if(dojo.isMozilla){_7a.scrollIntoView(false);}else{var _7b=_7a.parentNode;var _7c=_7b.scrollTop+dojo.marginBox(_7b).h;var _7d=_7a.offsetTop+dojo.marginBox(_7a).h;if(_7c<_7d){_7b.scrollTop+=(_7d-_7c);}else{if(_7b.scrollTop>_7a.offsetTop){_7b.scrollTop-=(_7b.scrollTop-_7a.offsetTop);}}}}};}if(!dojo._hasResource["dijit._base.sniff"]){dojo._hasResource["dijit._base.sniff"]=true;dojo.provide("dijit._base.sniff");(function(){var d=dojo;var ie=d.isIE;var _80=d.isOpera;var maj=Math.floor;var _82={dj_ie:ie,dj_ie6:maj(ie)==6,dj_ie7:maj(ie)==7,dj_iequirks:ie&&d.isQuirks,dj_opera:_80,dj_opera8:maj(_80)==8,dj_opera9:maj(_80)==9,dj_khtml:d.isKhtml,dj_safari:d.isSafari,dj_gecko:d.isMozilla};for(var p in _82){if(_82[p]){var _84=dojo.doc.documentElement;if(_84.className){_84.className+=" "+p;}else{_84.className=p;}}}})();}if(!dojo._hasResource["dijit._base.bidi"]){dojo._hasResource["dijit._base.bidi"]=true;dojo.provide("dijit._base.bidi");dojo.addOnLoad(function(){if(!dojo._isBodyLtr()){dojo.addClass(dojo.body(),"dijitRtl");}});}if(!dojo._hasResource["dijit._base.typematic"]){dojo._hasResource["dijit._base.typematic"]=true;dojo.provide("dijit._base.typematic");dijit.typematic={_fireEventAndReload:function(){this._timer=null;this._callback(++this._count,this._node,this._evt);this._currentTimeout=(this._currentTimeout<0)?this._initialDelay:((this._subsequentDelay>1)?this._subsequentDelay:Math.round(this._currentTimeout*this._subsequentDelay));this._timer=setTimeout(dojo.hitch(this,"_fireEventAndReload"),this._currentTimeout);},trigger:function(evt,_86,_87,_88,obj,_8a,_8b){if(obj!=this._obj){this.stop();this._initialDelay=_8b?_8b:500;this._subsequentDelay=_8a?_8a:0.9;this._obj=obj;this._evt=evt;this._node=_87;this._currentTimeout=-1;this._count=-1;this._callback=dojo.hitch(_86,_88);this._fireEventAndReload();}},stop:function(){if(this._timer){clearTimeout(this._timer);this._timer=null;}if(this._obj){this._callback(-1,this._node,this._evt);this._obj=null;}},addKeyListener:function(_8c,_8d,_8e,_8f,_90,_91){var ary=[];ary.push(dojo.connect(_8c,"onkeypress",this,function(evt){if(evt.keyCode==_8d.keyCode&&(!_8d.charCode||_8d.charCode==evt.charCode)&&((typeof _8d.ctrlKey=="undefined")||_8d.ctrlKey==evt.ctrlKey)&&((typeof _8d.altKey=="undefined")||_8d.altKey==evt.ctrlKey)&&((typeof _8d.shiftKey=="undefined")||_8d.shiftKey==evt.ctrlKey)){dojo.stopEvent(evt);dijit.typematic.trigger(_8d,_8e,_8c,_8f,_8d,_90,_91);}else{if(dijit.typematic._obj==_8d){dijit.typematic.stop();}}}));ary.push(dojo.connect(_8c,"onkeyup",this,function(evt){if(dijit.typematic._obj==_8d){dijit.typematic.stop();}}));return ary;},addMouseListener:function(_95,_96,_97,_98,_99){var ary=[];ary.push(dojo.connect(_95,"mousedown",this,function(evt){dojo.stopEvent(evt);dijit.typematic.trigger(evt,_96,_95,_97,_95,_98,_99);}));ary.push(dojo.connect(_95,"mouseup",this,function(evt){dojo.stopEvent(evt);dijit.typematic.stop();}));ary.push(dojo.connect(_95,"mouseout",this,function(evt){dojo.stopEvent(evt);dijit.typematic.stop();}));ary.push(dojo.connect(_95,"mousemove",this,function(evt){dojo.stopEvent(evt);}));ary.push(dojo.connect(_95,"dblclick",this,function(evt){dojo.stopEvent(evt);if(dojo.isIE){dijit.typematic.trigger(evt,_96,_95,_97,_95,_98,_99);setTimeout("dijit.typematic.stop()",50);}}));return ary;},addListener:function(_a0,_a1,_a2,_a3,_a4,_a5,_a6){return this.addKeyListener(_a1,_a2,_a3,_a4,_a5,_a6).concat(this.addMouseListener(_a0,_a3,_a4,_a5,_a6));}};}if(!dojo._hasResource["dijit._base.wai"]){dojo._hasResource["dijit._base.wai"]=true;dojo.provide("dijit._base.wai");dijit.waiNames=["waiRole","waiState"];dijit.wai={waiRole:{name:"waiRole","namespace":"http://www.w3.org/TR/xhtml2",alias:"x2",prefix:"wairole:"},waiState:{name:"waiState","namespace":"http://www.w3.org/2005/07/aaa",alias:"aaa",prefix:""},setAttr:function(_a7,ns,_a9,_aa){if(dojo.isIE){_a7.setAttribute(this[ns].alias+":"+_a9,this[ns].prefix+_aa);}else{_a7.setAttributeNS(this[ns]["namespace"],_a9,this[ns].prefix+_aa);}},getAttr:function(_ab,ns,_ad){if(dojo.isIE){return _ab.getAttribute(this[ns].alias+":"+_ad);}else{return _ab.getAttributeNS(this[ns]["namespace"],_ad);}},removeAttr:function(_ae,ns,_b0){var _b1=true;if(dojo.isIE){_b1=_ae.removeAttribute(this[ns].alias+":"+_b0);}else{_ae.removeAttributeNS(this[ns]["namespace"],_b0);}return _b1;},onload:function(){var div=document.createElement("div");div.id="a11yTestNode";div.style.cssText="border: 1px solid;"+"border-color:red green;"+"position: absolute;"+"left: -999px;"+"top: -999px;"+"background-image: url(\""+dojo.moduleUrl("dijit","form/templates/blank.gif")+"\");";dojo.body().appendChild(div);function check(){var cs=dojo.getComputedStyle(div);if(cs){var _b4=cs.backgroundImage;var _b5=(cs.borderTopColor==cs.borderRightColor)||(_b4!=null&&(_b4=="none"||_b4=="url(invalid-url:)"));dojo[_b5?"addClass":"removeClass"](dojo.body(),"dijit_a11y");}};check();if(dojo.isIE){setInterval(check,4000);}}};if(dojo.isIE||dojo.isMoz){dojo._loaders.unshift(dijit.wai.onload);}}if(!dojo._hasResource["dijit._base"]){dojo._hasResource["dijit._base"]=true;dojo.provide("dijit._base");}if(!dojo._hasResource["dojo.date.stamp"]){dojo._hasResource["dojo.date.stamp"]=true;dojo.provide("dojo.date.stamp");dojo.date.stamp.fromISOString=function(_b6,_b7){if(!dojo.date.stamp._isoRegExp){dojo.date.stamp._isoRegExp=/^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;}var _b8=dojo.date.stamp._isoRegExp.exec(_b6);var _b9=null;if(_b8){_b8.shift();_b8[1]&&_b8[1]--;_b8[6]&&(_b8[6]*=1000);if(_b7){_b7=new Date(_b7);dojo.map(["FullYear","Month","Date","Hours","Minutes","Seconds","Milliseconds"],function(_ba){return _b7["get"+_ba]();}).forEach(function(_bb,_bc){if(_b8[_bc]===undefined){_b8[_bc]=_bb;}});}_b9=new Date(_b8[0]||1970,_b8[1]||0,_b8[2]||0,_b8[3]||0,_b8[4]||0,_b8[5]||0,_b8[6]||0);var _bd=0;var _be=_b8[7]&&_b8[7].charAt(0);if(_be!="Z"){_bd=((_b8[8]||0)*60)+(Number(_b8[9])||0);if(_be!="-"){_bd*=-1;}}if(_be){_bd-=_b9.getTimezoneOffset();}if(_bd){_b9.setTime(_b9.getTime()+_bd*60000);}}return _b9;};dojo.date.stamp.toISOString=function(_bf,_c0){var _=function(n){return (n<10)?"0"+n:n;};_c0=_c0||{};var _c3=[];var _c4=_c0.zulu?"getUTC":"get";var _c5="";if(_c0.selector!="time"){_c5=[_bf[_c4+"FullYear"](),_(_bf[_c4+"Month"]()+1),_(_bf[_c4+"Date"]())].join("-");}_c3.push(_c5);if(_c0.selector!="date"){var _c6=[_(_bf[_c4+"Hours"]()),_(_bf[_c4+"Minutes"]()),_(_bf[_c4+"Seconds"]())].join(":");var _c7=_bf[_c4+"Milliseconds"]();if(_c0.milliseconds){_c6+="."+(_c7<100?"0":"")+_(_c7);}if(_c0.zulu){_c6+="Z";}else{var _c8=_bf.getTimezoneOffset();var _c9=Math.abs(_c8);_c6+=(_c8>0?"-":"+")+_(Math.floor(_c9/60))+":"+_(_c9%60);}_c3.push(_c6);}return _c3.join("T");};}if(!dojo._hasResource["dojo.parser"]){dojo._hasResource["dojo.parser"]=true;dojo.provide("dojo.parser");dojo.parser=new function(){var d=dojo;function val2type(_cb){if(d.isString(_cb)){return "string";}if(typeof _cb=="number"){return "number";}if(typeof _cb=="boolean"){return "boolean";}if(d.isFunction(_cb)){return "function";}if(d.isArray(_cb)){return "array";}if(_cb instanceof Date){return "date";}if(_cb instanceof d._Url){return "url";}return "object";};function str2obj(_cc,_cd){switch(_cd){case "string":return _cc;case "number":return _cc.length?Number(_cc):NaN;case "boolean":return typeof _cc=="boolean"?_cc:!(_cc.toLowerCase()=="false");case "function":if(d.isFunction(_cc)){_cc=_cc.toString();_cc=d.trim(_cc.substring(_cc.indexOf("{")+1,_cc.length-1));}try{if(_cc.search(/[^\w\.]+/i)!=-1){_cc=d.parser._nameAnonFunc(new Function(_cc),this);}return d.getObject(_cc,false);}catch(e){return new Function();}case "array":return _cc.split(/\s*,\s*/);case "date":switch(_cc){case "":return new Date("");case "now":return new Date();default:return d.date.stamp.fromISOString(_cc);}case "url":return d.baseUrl+_cc;default:return d.fromJson(_cc);}};var _ce={};function getClassInfo(_cf){if(!_ce[_cf]){var cls=d.getObject(_cf);if(!d.isFunction(cls)){throw new Error("Could not load class '"+_cf+"'. Did you spell the name correctly and use a full path, like 'dijit.form.Button'?");}var _d1=cls.prototype;var _d2={};for(var _d3 in _d1){if(_d3.charAt(0)=="_"){continue;}var _d4=_d1[_d3];_d2[_d3]=val2type(_d4);}_ce[_cf]={cls:cls,params:_d2};}return _ce[_cf];};this._functionFromScript=function(_d5){var _d6="";var _d7="";var _d8=_d5.getAttribute("args");if(_d8){d.forEach(_d8.split(/\s*,\s*/),function(_d9,idx){_d6+="var "+_d9+" = arguments["+idx+"]; ";});}var _db=_d5.getAttribute("with");if(_db&&_db.length){d.forEach(_db.split(/\s*,\s*/),function(_dc){_d6+="with("+_dc+"){";_d7+="}";});}return new Function(_d6+_d5.innerHTML+_d7);};this._wireUpMethod=function(_dd,_de){var nf=this._functionFromScript(_de);var _e0=_de.getAttribute("event");if(_e0){var _e1=_de.getAttribute("type");if(_e1&&(_e1=="dojo/connect")){d.connect(_dd,_e0,null,nf);}else{_dd[_e0]=nf;}}else{nf.call(_dd);}};this.instantiate=function(_e2){var _e3=[];d.forEach(_e2,function(_e4){if(!_e4){return;}var _e5=_e4.getAttribute("dojoType");if((!_e5)||(!_e5.length)){return;}var _e6=getClassInfo(_e5);var _e7=_e6.cls;var ps=_e7._noScript||_e7.prototype._noScript;var _e9={};var _ea=_e4.attributes;for(var _eb in _e6.params){var _ec=_ea.getNamedItem(_eb);if(!_ec||(!_ec.specified&&(!dojo.isIE||_eb.toLowerCase()!="value"))){continue;}var _ed=_e6.params[_eb];_e9[_eb]=str2obj(_ec.value,_ed);}if(!ps){var _ee=d.query("> script[type='dojo/method'][event='preamble']",_e4).orphan();if(_ee.length){_e9.preamble=d.parser._functionFromScript(_ee[0]);}var _ef=d.query("> script[type^='dojo/']",_e4).orphan();}var _f0=_e7["markupFactory"];if(!_f0&&_e7["prototype"]){_f0=_e7.prototype["markupFactory"];}var _f1=_f0?_f0(_e9,_e4,_e7):new _e7(_e9,_e4);_e3.push(_f1);var _f2=_e4.getAttribute("jsId");if(_f2){d.setObject(_f2,_f1);}if(!ps){_ef.forEach(function(_f3){d.parser._wireUpMethod(_f1,_f3);});}});d.forEach(_e3,function(_f4){if(_f4&&(_f4.startup)&&((!_f4.getParent)||(!_f4.getParent()))){_f4.startup();}});return _e3;};this.parse=function(_f5){var _f6=d.query("[dojoType]",_f5);var _f7=this.instantiate(_f6);return _f7;};}();(function(){var _f8=function(){if(djConfig["parseOnLoad"]==true){dojo.parser.parse();}};if(dojo.exists("dijit.wai.onload")&&(dijit.wai.onload===dojo._loaders[0])){dojo._loaders.splice(1,0,_f8);}else{dojo._loaders.unshift(_f8);}})();dojo.parser._anonCtr=0;dojo.parser._anon={};dojo.parser._nameAnonFunc=function(_f9,_fa){var jpn="$joinpoint";var nso=(_fa||dojo.parser._anon);if(dojo.isIE){var cn=_f9["__dojoNameCache"];if(cn&&nso[cn]===_f9){return _f9["__dojoNameCache"];}}var ret="__"+dojo.parser._anonCtr++;while(typeof nso[ret]!="undefined"){ret="__"+dojo.parser._anonCtr++;}nso[ret]=_f9;return ret;};}if(!dojo._hasResource["dijit._Widget"]){dojo._hasResource["dijit._Widget"]=true;dojo.provide("dijit._Widget");dojo.declare("dijit._Widget",null,{constructor:function(_ff,_100){this.create(_ff,_100);},id:"",lang:"",dir:"",srcNodeRef:null,domNode:null,create:function(_101,_102){this.srcNodeRef=dojo.byId(_102);this._connects=[];this._attaches=[];if(this.srcNodeRef&&(typeof this.srcNodeRef.id=="string")){this.id=this.srcNodeRef.id;}if(_101){dojo.mixin(this,_101);}this.postMixInProperties();if(!this.id){this.id=dijit.getUniqueId(this.declaredClass.replace(/\./g,"_"));}dijit.registry.add(this);this.buildRendering();if(this.domNode){this.domNode.setAttribute("widgetId",this.id);if(this.srcNodeRef&&this.srcNodeRef.dir){this.domNode.dir=this.srcNodeRef.dir;}}this.postCreate();if(this.srcNodeRef&&!this.srcNodeRef.parentNode){delete this.srcNodeRef;}},postMixInProperties:function(){},buildRendering:function(){this.domNode=this.srcNodeRef;},postCreate:function(){},startup:function(){},destroyRecursive:function(_103){this.destroyDescendants();this.destroy();},destroy:function(_104){this.uninitialize();dojo.forEach(this._connects,function(_105){dojo.forEach(_105,dojo.disconnect);});this.destroyRendering(_104);dijit.registry.remove(this.id);},destroyRendering:function(_106){if(this.bgIframe){this.bgIframe.destroy();delete this.bgIframe;}if(this.domNode){dojo._destroyElement(this.domNode);delete this.domNode;}if(this.srcNodeRef){dojo._destroyElement(this.srcNodeRef);delete this.srcNodeRef;}},destroyDescendants:function(){dojo.forEach(this.getDescendants(),function(_107){_107.destroy();});},uninitialize:function(){return false;},toString:function(){return "[Widget "+this.declaredClass+", "+(this.id||"NO ID")+"]";},getDescendants:function(){var list=dojo.query("[widgetId]",this.domNode);return list.map(dijit.byNode);},nodesWithKeyClick:["input","button"],connect:function(obj,_10a,_10b){var _10c=[];if(_10a=="ondijitclick"){var w=this;if(!this.nodesWithKeyClick[obj.nodeName]){_10c.push(dojo.connect(obj,"onkeydown",this,function(e){if(e.keyCode==dojo.keys.ENTER){return (dojo.isString(_10b))?w[_10b](e):_10b.call(w,e);}else{if(e.keyCode==dojo.keys.SPACE){dojo.stopEvent(e);}}}));_10c.push(dojo.connect(obj,"onkeyup",this,function(e){if(e.keyCode==dojo.keys.SPACE){return dojo.isString(_10b)?w[_10b](e):_10b.call(w,e);}}));}_10a="onclick";}_10c.push(dojo.connect(obj,_10a,this,_10b));this._connects.push(_10c);return _10c;},disconnect:function(_110){for(var i=0;i<this._connects.length;i++){if(this._connects[i]==_110){dojo.forEach(_110,dojo.disconnect);this._connects.splice(i,1);return;}}},isLeftToRight:function(){if(typeof this._ltr=="undefined"){this._ltr=(this.dir||dojo.getComputedStyle(this.domNode).direction)!="rtl";}return this._ltr;}});}if(!dojo._hasResource["dojo.string"]){dojo._hasResource["dojo.string"]=true;dojo.provide("dojo.string");dojo.string.pad=function(text,size,ch,end){var out=String(text);if(!ch){ch="0";}while(out.length<size){if(end){out+=ch;}else{out=ch+out;}}return out;};dojo.string.substitute=function(_117,map,_119,_11a){return _117.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,function(_11b,key,_11d){var _11e=dojo.getObject(key,false,map);if(_11d){_11e=dojo.getObject(_11d,false,_11a)(_11e);}if(_119){_11e=_119(_11e,key);}return _11e.toString();});};dojo.string.trim=function(str){str=str.replace(/^\s+/,"");for(var i=str.length-1;i>0;i--){if(/\S/.test(str.charAt(i))){str=str.substring(0,i+1);break;}}return str;};}if(!dojo._hasResource["dijit._Templated"]){dojo._hasResource["dijit._Templated"]=true;dojo.provide("dijit._Templated");dojo.declare("dijit._Templated",null,{templateNode:null,templateString:null,templatePath:null,widgetsInTemplate:false,containerNode:null,buildRendering:function(){var _121=dijit._Templated.getCachedTemplate(this.templatePath,this.templateString);var node;if(dojo.isString(_121)){var _123=this.declaredClass,_124=this;var tstr=dojo.string.substitute(_121,this,function(_126,key){if(key.charAt(0)=="!"){_126=_124[key.substr(1)];}if(typeof _126=="undefined"){throw new Error(_123+" template:"+key);}return key.charAt(0)=="!"?_126:_126.toString().replace(/"/g,"&quot;");},this);node=dijit._Templated._createNodesFromText(tstr)[0];}else{node=_121.cloneNode(true);}this._attachTemplateNodes(node);if(this.srcNodeRef){dojo.style(this.styleNode||node,"cssText",this.srcNodeRef.style.cssText);if(this.srcNodeRef.className){node.className+=" "+this.srcNodeRef.className;}}this.domNode=node;if(this.srcNodeRef&&this.srcNodeRef.parentNode){this.srcNodeRef.parentNode.replaceChild(this.domNode,this.srcNodeRef);}if(this.widgetsInTemplate){var _128=dojo.parser.parse(this.domNode);this._attachTemplateNodes(_128,function(n,p){return n[p];});}this._fillContent(this.srcNodeRef);},_fillContent:function(_12b){var dest=this.containerNode;if(_12b&&dest){while(_12b.hasChildNodes()){dest.appendChild(_12b.firstChild);}}},_attachTemplateNodes:function(_12d,_12e){_12e=_12e||function(n,p){return n.getAttribute(p);};var _131=dojo.isArray(_12d)?_12d:(_12d.all||_12d.getElementsByTagName("*"));var x=dojo.isArray(_12d)?0:-1;for(;x<_131.length;x++){var _133=(x==-1)?_12d:_131[x];if(this.widgetsInTemplate&&_12e(_133,"dojoType")){continue;}var _134=_12e(_133,"dojoAttachPoint");if(_134){var _135,_136=_134.split(/\s*,\s*/);while(_135=_136.shift()){if(dojo.isArray(this[_135])){this[_135].push(_133);}else{this[_135]=_133;}}}var _137=_12e(_133,"dojoAttachEvent");if(_137){var _138,_139=_137.split(/\s*,\s*/);var trim=dojo.trim;while(_138=_139.shift()){if(_138){var _13b=null;if(_138.indexOf(":")!=-1){var _13c=_138.split(":");_138=trim(_13c[0]);_13b=trim(_13c[1]);}else{_138=trim(_138);}if(!_13b){_13b=_138;}this.connect(_133,_138,_13b);}}}var name,_13e=["waiRole","waiState"];while(name=_13e.shift()){var wai=dijit.wai[name];var _140=_12e(_133,wai.name);if(_140){var role="role";var val;_140=_140.split(/\s*,\s*/);while(val=_140.shift()){if(val.indexOf("-")!=-1){var _143=val.split("-");role=_143[0];val=_143[1];}dijit.wai.setAttr(_133,wai.name,role,val);}}}}}});dijit._Templated._templateCache={};dijit._Templated.getCachedTemplate=function(_144,_145){var _146=dijit._Templated._templateCache;var key=_145||_144;var _148=_146[key];if(_148){return _148;}if(!_145){_145=dijit._Templated._sanitizeTemplateString(dojo._getText(_144));}_145=dojo.string.trim(_145);if(_145.match(/\$\{([^\}]+)\}/g)){return (_146[key]=_145);}else{return (_146[key]=dijit._Templated._createNodesFromText(_145)[0]);}};dijit._Templated._sanitizeTemplateString=function(_149){if(_149){_149=_149.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,"");var _14a=_149.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);if(_14a){_149=_14a[1];}}else{_149="";}return _149;};if(dojo.isIE){dojo.addOnUnload(function(){var _14b=dijit._Templated._templateCache;for(var key in _14b){var _14d=_14b[key];if(!isNaN(_14d.nodeType)){dojo._destroyElement(_14d);}_14b[key]=null;}});}(function(){var _14e={cell:{re:/^<t[dh][\s\r\n>]/i,pre:"<table><tbody><tr>",post:"</tr></tbody></table>"},row:{re:/^<tr[\s\r\n>]/i,pre:"<table><tbody>",post:"</tbody></table>"},section:{re:/^<(thead|tbody|tfoot)[\s\r\n>]/i,pre:"<table>",post:"</table>"}};var tn;dijit._Templated._createNodesFromText=function(text){if(!tn){tn=dojo.doc.createElement("div");tn.style.display="none";}var _151="none";var _152=text.replace(/^\s+/,"");for(var type in _14e){var map=_14e[type];if(map.re.test(_152)){_151=type;text=map.pre+text+map.post;break;}}tn.innerHTML=text;dojo.body().appendChild(tn);if(tn.normalize){tn.normalize();}var tag={cell:"tr",row:"tbody",section:"table"}[_151];var _156=(typeof tag!="undefined")?tn.getElementsByTagName(tag)[0]:tn;var _157=[];while(_156.firstChild){_157.push(_156.removeChild(_156.firstChild));}tn.innerHTML="";return _157;};})();dojo.extend(dijit._Widget,{dojoAttachEvent:"",dojoAttachPoint:"",waiRole:"",waiState:""});}if(!dojo._hasResource["dijit._Container"]){dojo._hasResource["dijit._Container"]=true;dojo.provide("dijit._Container");dojo.declare("dijit._Contained",null,{getParent:function(){for(var p=this.domNode.parentNode;p;p=p.parentNode){var id=p.getAttribute&&p.getAttribute("widgetId");if(id){var _15a=dijit.byId(id);return _15a.isContainer?_15a:null;}}return null;},_getSibling:function(_15b){var node=this.domNode;do{node=node[_15b+"Sibling"];}while(node&&node.nodeType!=1);if(!node){return null;}var id=node.getAttribute("widgetId");return dijit.byId(id);},getPreviousSibling:function(){return this._getSibling("previous");},getNextSibling:function(){return this._getSibling("next");}});dojo.declare("dijit._Container",null,{isContainer:true,addChild:function(_15e,_15f){if(typeof _15f=="undefined"){_15f="last";}dojo.place(_15e.domNode,this.containerNode||this.domNode,_15f);if(this._started&&!_15e._started){_15e.startup();}},removeChild:function(_160){var node=_160.domNode;node.parentNode.removeChild(node);},_nextElement:function(node){do{node=node.nextSibling;}while(node&&node.nodeType!=1);return node;},_firstElement:function(node){node=node.firstChild;if(node&&node.nodeType!=1){node=this._nextElement(node);}return node;},getChildren:function(){return dojo.query("> [widgetId]",this.containerNode||this.domNode).map(dijit.byNode);},hasChildren:function(){var cn=this.containerNode||this.domNode;return !!this._firstElement(cn);}});}if(!dojo._hasResource["dijit.layout._LayoutWidget"]){dojo._hasResource["dijit.layout._LayoutWidget"]=true;dojo.provide("dijit.layout._LayoutWidget");dojo.declare("dijit.layout._LayoutWidget",[dijit._Widget,dijit._Container,dijit._Contained],{isLayoutContainer:true,postCreate:function(){dojo.addClass(this.domNode,"dijitContainer");},startup:function(){if(this._started){return;}this._started=true;if(this.getChildren){dojo.forEach(this.getChildren(),function(_165){_165.startup();});}if(!this.getParent||!this.getParent()){this.resize();this.connect(window,"onresize",function(){this.resize();});}},resize:function(args){var node=this.domNode;if(args){dojo.marginBox(node,args);if(args.t){node.style.top=args.t+"px";}if(args.l){node.style.left=args.l+"px";}}var mb=dojo.mixin(dojo.marginBox(node),args||{});this._contentBox=dijit.layout.marginBox2contentBox(node,mb);this.layout();},layout:function(){}});dijit.layout.marginBox2contentBox=function(node,mb){var cs=dojo.getComputedStyle(node);var me=dojo._getMarginExtents(node,cs);var pb=dojo._getPadBorderExtents(node,cs);return {l:dojo._toPixelValue(node,cs.paddingLeft),t:dojo._toPixelValue(node,cs.paddingTop),w:mb.w-(me.w+pb.w),h:mb.h-(me.h+pb.h)};};(function(){var _16e=function(word){return word.substring(0,1).toUpperCase()+word.substring(1);};var size=function(_171,dim){_171.resize?_171.resize(dim):dojo.marginBox(_171.domNode,dim);dojo.mixin(_171,dojo.marginBox(_171.domNode));dojo.mixin(_171,dim);};dijit.layout.layoutChildren=function(_173,dim,_175){dim=dojo.mixin({},dim);dojo.addClass(_173,"dijitLayoutContainer");dojo.forEach(_175,function(_176){var elm=_176.domNode,pos=_176.layoutAlign;var _179=elm.style;_179.left=dim.l+"px";_179.top=dim.t+"px";_179.bottom=_179.right="auto";dojo.addClass(elm,"dijitAlign"+_16e(pos));if(pos=="top"||pos=="bottom"){size(_176,{w:dim.w});dim.h-=_176.h;if(pos=="top"){dim.t+=_176.h;}else{_179.top=dim.t+dim.h+"px";}}else{if(pos=="left"||pos=="right"){size(_176,{h:dim.h});dim.w-=_176.w;if(pos=="left"){dim.l+=_176.w;}else{_179.left=dim.l+dim.w+"px";}}else{if(pos=="flood"||pos=="client"){size(_176,dim);}}}});};})();}if(!dojo._hasResource["dijit.form._FormWidget"]){dojo._hasResource["dijit.form._FormWidget"]=true;dojo.provide("dijit.form._FormWidget");dojo.declare("dijit.form._FormWidget",[dijit._Widget,dijit._Templated],{baseClass:"",value:"",name:"",id:"",alt:"",type:"text",tabIndex:"0",disabled:false,intermediateChanges:false,setDisabled:function(_17a){this.domNode.disabled=this.disabled=_17a;if(this.focusNode){this.focusNode.disabled=_17a;}if(_17a){this._hovering=false;this._active=false;}dijit.wai.setAttr(this.focusNode||this.domNode,"waiState","disabled",_17a);this._setStateClass();},_onMouse:function(_17b){var _17c=_17b.target;if(!this.disabled){switch(_17b.type){case "mouseover":this._hovering=true;var _17d,node=_17c;while(node.nodeType===1&&!(_17d=node.getAttribute("baseClass"))&&node!=this.domNode){node=node.parentNode;}this.baseClass=_17d||"dijit"+this.declaredClass.replace(/.*\./g,"");break;case "mouseout":this._hovering=false;this.baseClass=null;break;case "mousedown":this._active=true;var self=this;var _180=this.connect(dojo.body(),"onmouseup",function(){self._active=false;self._setStateClass();self.disconnect(_180);});break;}this._setStateClass();}},focus:function(){dijit.focus(this.focusNode);},_setStateClass:function(base){var _182=(this.styleNode||this.domNode).className;var base=this.baseClass||this.domNode.getAttribute("baseClass")||"dijitFormWidget";_182=_182.replace(new RegExp("\\b"+base+"(Checked)?(Selected)?(Disabled|Active|Focused|Hover)?\\b\\s*","g"),"");var _183=[base];function multiply(_184){_183=_183.concat(dojo.map(_183,function(c){return c+_184;}));};if(this.checked){multiply("Checked");}if(this.selected){multiply("Selected");}if(this.disabled){multiply("Disabled");}else{if(this._active){multiply("Active");}else{if(this._focused){multiply("Focused");}else{if(this._hovering){multiply("Hover");}}}}(this.styleNode||this.domNode).className=_182+" "+_183.join(" ");},onChange:function(_186){},postCreate:function(){this.setValue(this.value,true);this.setDisabled(this.disabled);this._setStateClass();},setValue:function(_187,_188){this._lastValue=_187;dijit.wai.setAttr(this.focusNode||this.domNode,"waiState","valuenow",this.forWaiValuenow());if((this.intermediateChanges||_188)&&_187!=this._lastValueReported){this._lastValueReported=_187;this.onChange(_187);}},getValue:function(){return this._lastValue;},undo:function(){this.setValue(this._lastValueReported,false);},_onKeyPress:function(e){if(e.keyCode==dojo.keys.ESCAPE&&!e.shiftKey&&!e.ctrlKey&&!e.altKey){var v=this.getValue();var lv=this._lastValueReported;if(lv!=undefined&&v.toString()!=lv.toString()){this.undo();dojo.stopEvent(e);return false;}}return true;},forWaiValuenow:function(){return this.getValue();}});}if(!dojo._hasResource["dijit.dijit"]){dojo._hasResource["dijit.dijit"]=true;dojo.provide("dijit.dijit");}
