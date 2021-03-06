if(typeof window != 'undefined'){
	dojo.isBrowser = true;
	dojo._name = "browser";


	// attempt to figure out the path to dojo if it isn't set in the config
	(function(){
		var d = dojo;
		// this is a scope protection closure. We set browser versions and grab
		// the URL we were loaded from here.

		// grab the node we were loaded from
		if(document && document.getElementsByTagName){
			var scripts = document.getElementsByTagName("script");
			var rePkg = /dojo(\.xd)?\.js([\?\.]|$)/i;
			for(var i = 0; i < scripts.length; i++){
				var src = scripts[i].getAttribute("src");
				if(!src){ continue; }
				var m = src.match(rePkg);
				if(m){
					// find out where we came from
					if(!djConfig["baseUrl"]){
						djConfig["baseUrl"] = src.substring(0, m.index);
					}
					// and find out if we need to modify our behavior
					var cfg = scripts[i].getAttribute("djConfig");
					if(cfg){
						var cfgo = eval("({ "+cfg+" })");
						for(var x in cfgo){
							djConfig[x] = cfgo[x];
						}
					}
					break; // "first Dojo wins"
				}
			}
		}
		d.baseUrl = djConfig["baseUrl"];

		// fill in the rendering support information in dojo.render.*
		var n = navigator;
		var dua = n.userAgent;
		var dav = n.appVersion;
		var tv = parseFloat(dav);

		d.isOpera = (dua.indexOf("Opera") >= 0) ? tv : 0;
		d.isKhtml = (dav.indexOf("Konqueror") >= 0)||(dav.indexOf("Safari") >= 0) ? tv : 0;
		d.isSafari = (dav.indexOf("Safari") >= 0) ? tv : 0;
		var geckoPos = dua.indexOf("Gecko");
		d.isMozilla = d.isMoz = ((geckoPos >= 0)&&(!d.isKhtml)) ? tv : 0;
		d.isFF = 0;
		d.isIE = 0;
		d.isGears = 0;
		try{
			if(d.isMoz){
				d.isFF = parseFloat(dua.split("Firefox/")[1].split(" ")[0]);
			}
			if((document.all)&&(!d.isOpera)){
				d.isIE = parseFloat(dav.split("MSIE ")[1].split(";")[0]);
			}
		}catch(e){}

		//Workaround to get local file loads of dojo to work on IE 7
		//by forcing to not use native xhr.
		if(dojo.isIE && (window.location.protocol === "file:")){
			djConfig.ieForceActiveXXhr=true;
		}

		d._gearsObject = function(){
			// summary: 
			//		factory method to get a Google Gears plugin instance to
			//		expose in the browser runtime environment, if present
			var factory;
			var results;
			
			var gearsObj = d.getObject("google.gears");
			if(gearsObj){ return gearsObj; } // already defined elsewhere
			
			if(typeof GearsFactory != "undefined"){ // Firefox
				factory = new GearsFactory();
			}else{
				if(d.isIE){
					// IE
					try{
						factory = new ActiveXObject("Gears.Factory");
					}catch(e){
						// ok to squelch; there's no gears factory.  move on.
					}
				}else if(navigator.mimeTypes["application/x-googlegears"]){
					// Safari?
					factory = document.createElement("object");
					factory.setAttribute("type", "application/x-googlegears");
					factory.setAttribute("width", 0);
					factory.setAttribute("height", 0);
					factory.style.display = "none";
					document.documentElement.appendChild(factory);
				}
			}

			// still nothing?
			if(!factory){ return null; }
			
			// define the global objects now; don't overwrite them though if they
			// were somehow set internally by the Gears plugin, which is on their
			// dev roadmap for the future
			dojo.setObject("google.gears.factory", factory);
			return dojo.getObject("google.gears");
		}
		
		// see if we have Google Gears installed, and if
		// so, make it available in the runtime environment
		// and in the Google standard 'google.gears' global object
		var gearsObj = d._gearsObject();
		if(gearsObj){
			d.isGears = true;
		}

		var cm = document["compatMode"];
		d.isQuirks = (cm == "BackCompat")||(cm == "QuirksMode")||(d.isIE < 6);

		// TODO: is the HTML LANG attribute relevant?
		d.locale = djConfig.locale || (d.isIE ? n.userLanguage : n.language).toLowerCase();

		d._println = console.debug;

		// These are in order of decreasing likelihood; this will change in time.
		d._XMLHTTP_PROGIDS = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];

		d._xhrObj= function(){
			// summary: 
			//		does the work of portably generating a new XMLHTTPRequest
			//		object.
			var http = null;
			var last_e = null;
			if(!dojo.isIE || !djConfig.ieForceActiveXXhr){
				try{ http = new XMLHttpRequest(); }catch(e){}
			}
			if(!http){
				for(var i=0; i<3; ++i){
					var progid = dojo._XMLHTTP_PROGIDS[i];
					try{
						http = new ActiveXObject(progid);
					}catch(e){
						last_e = e;
					}

					if(http){
						dojo._XMLHTTP_PROGIDS = [progid];  // so faster next time
						break;
					}
				}
			}

			if(!http){
				throw new Error("XMLHTTP not available: "+last_e);
			}

			return http; // XMLHTTPRequest instance
		}

		d._isDocumentOk = function(http){
			var stat = http.status || 0;
			return ( (stat>=200)&&(stat<300))|| 	// allow any 2XX response code
				(stat==304)|| 						// get it out of the cache
				(stat==1223)|| 						// Internet Explorer mangled the status code
				(!stat && (location.protocol=="file:" || location.protocol=="chrome:") ); // Boolean
		}

		//See if base tag is in use.
		//This is to fix http://trac.dojotoolkit.org/ticket/3973,
		//but really, we need to find out how to get rid of the dojo._Url reference
		//below and still have DOH work with the dojo.i18n test following some other
		//test that uses the test frame to load a document (trac #2757).
		//Opera still has problems, but perhaps a larger issue of base tag support
		//with XHR requests (hasBase is true, but the request is still made to document
		//path, not base path).
		var base = document.getElementsByTagName("base");
		var hasBase = (base && base.length > 0);

		d._getText = function(uri, fail_ok){
			// summary: Read the contents of the specified uri and return those contents.
			// uri:
			//		A relative or absolute uri. If absolute, it still must be in
			//		the same "domain" as we are.
			// fail_ok:
			//		Default false. If fail_ok and loading fails, return null
			//		instead of throwing.

			// alert("_getText: " + uri);

			// NOTE: must be declared before scope switches ie. this._xhrObj()
			var http = this._xhrObj();

			if(!hasBase && dojo._Url){
				uri = (new dojo._Url(window.location, uri)).toString();
			}
			/*
			console.debug("_getText:", uri);
			console.debug(window.location+"");
			alert(uri);
			*/

			http.open('GET', uri, false);
			try{
				http.send(null);
				if(!d._isDocumentOk(http)){
					var err = Error("Unable to load "+uri+" status:"+ http.status);
					err.status = http.status;
					err.responseText = http.responseText;
					throw err;
				}
			}catch(e){
				if(fail_ok){ return null; } // null
				// rethrow the exception
				throw e;
			}
			return http.responseText; // String
		}
	})();

	dojo._initFired = false;
	//	BEGIN DOMContentLoaded, from Dean Edwards (http://dean.edwards.name/weblog/2006/06/again/)
	dojo._loadInit = function(e){
		dojo._initFired = true;
		// allow multiple calls, only first one will take effect
		// A bug in khtml calls events callbacks for document for event which isnt supported
		// for example a created contextmenu event calls DOMContentLoaded, workaround
		var type = (e && e.type) ? e.type.toLowerCase() : "load";
		if(arguments.callee.initialized || (type!="domcontentloaded" && type!="load")){ return; }
		arguments.callee.initialized = true;
		if(typeof dojo["_khtmlTimer"] != 'undefined'){
			clearInterval(dojo._khtmlTimer);
			delete dojo._khtmlTimer;
		}

		if(dojo._inFlightCount == 0){
			dojo._modulesLoaded();
		}
	}

	//	START DOMContentLoaded
	// Mozilla and Opera 9 expose the event we could use
	if(document.addEventListener){
		// NOTE: 
		//		due to a threading issue in Firefox 2.0, we can't enable
		//		DOMContentLoaded on that platform. For more information, see:
		//		http://trac.dojotoolkit.org/ticket/1704
		if(dojo.isOpera|| (dojo.isMoz && (djConfig["enableMozDomContentLoaded"] === true))){
			document.addEventListener("DOMContentLoaded", dojo._loadInit, null);
		}

		//	mainly for Opera 8.5, won't be fired if DOMContentLoaded fired already.
		//  also used for Mozilla because of trac #1640
		window.addEventListener("load", dojo._loadInit, null);
	}

	if(/(WebKit|khtml)/i.test(navigator.userAgent)){ // sniff
		dojo._khtmlTimer = setInterval(function(){
			if(/loaded|complete/.test(document.readyState)){
				dojo._loadInit(); // call the onload handler
			}
		}, 10);
	}
	//	END DOMContentLoaded

	(function(){

		var _w = window;
		var _handleNodeEvent = function(/*String*/evtName, /*Function*/fp){
			// summary:
			//		non-destructively adds the specified function to the node's
			//		evtName handler.
			// evtName: should be in the form "onclick" for "onclick" handlers.
			// Make sure you pass in the "on" part.
			var oldHandler = _w[evtName] || function(){};
			_w[evtName] = function(){
				fp.apply(_w, arguments);
				oldHandler.apply(_w, arguments);
			}
		}

		if(dojo.isIE){
			// 	for Internet Explorer. readyState will not be achieved on init
			// 	call, but dojo doesn't need it however, we'll include it
			// 	because we don't know if there are other functions added that
			// 	might.  Note that this has changed because the build process
			// 	strips all comments -- including conditional ones.

			document.write('<scr'+'ipt defer src="//:" '
				+ 'onreadystatechange="if(this.readyState==\'complete\'){dojo._loadInit();}">'
				+ '</scr'+'ipt>'
			);

			// IE WebControl hosted in an application can fire "beforeunload" and "unload"
			// events when control visibility changes, causing Dojo to unload too soon. The
			// following code fixes the problem
			// Reference: http://support.microsoft.com/default.aspx?scid=kb;en-us;199155
			var _unloading = true;
			_handleNodeEvent("onbeforeunload", function(){
				_w.setTimeout(function(){ _unloading = false; }, 0);
			});
			_handleNodeEvent("onunload", function(){
				if(_unloading){ dojo.unloaded(); }
			});

			try{
				document.namespaces.add("v","urn:schemas-microsoft-com:vml");
				document.createStyleSheet().addRule("v\\:*", "behavior:url(#default#VML)");
			}catch(e){}
		}else{
			// FIXME: dojo.unloaded requires dojo scope, so using anon function wrapper.
			_handleNodeEvent("onbeforeunload", function() { dojo.unloaded(); });
		}

	})();

	/*
	OpenAjax.subscribe("OpenAjax", "onload", function(){
		if(dojo._inFlightCount == 0){
			dojo._modulesLoaded();
		}
	});

	OpenAjax.subscribe("OpenAjax", "onunload", function(){
		dojo.unloaded();
	});
	*/

	// stub, over-ridden by debugging code. This will at least keep us from
	// breaking when it's not included
	dojo._writeIncludes = function(){}

	// @global: dojo.doc
	// summary:
	//		Current document object. 'dojo.doc' can be modified
	//		for temporary context shifting. Also see dojo.withDoc().
	// description:
	//    Refer to dojo.doc rather
	//    than referring to 'window.document' to ensure your code runs
	//    correctly in managed contexts.
	dojo.doc = window["document"] || null;

	dojo.body = function(){
		// summary:
		//		return the body object associated with dojo.doc

		// Note: document.body is not defined for a strict xhtml document
		// Would like to memoize this, but dojo.doc can change vi dojo.withDoc().
		return dojo.doc.body || dojo.doc.getElementsByTagName("body")[0];
	}

	dojo.setContext = function(/*Object*/globalObject, /*DocumentElement*/globalDocument){
		// summary:
		//		changes the behavior of many core Dojo functions that deal with
		//		namespace and DOM lookup, changing them to work in a new global
		//		context. The varibles dojo.global and dojo.doc
		//		are modified as a result of calling this function.
		dojo.global = globalObject;
		dojo.doc = globalDocument;
	};

	dojo._fireCallback = function(callback, context, cbArguments){
		// FIXME: should migrate to using "dojo.isString"!
		if((context)&&((typeof callback == "string")||(callback instanceof String))){
			callback = context[callback];
		}
		return (context ? callback.apply(context, cbArguments || [ ]) : callback());
	}

	dojo.withGlobal = function(	/*Object*/globalObject, 
								/*Function*/callback, 
								/*Object?*/thisObject, 
								/*Array?*/cbArguments){
		// summary:
		//		Call callback with globalObject as dojo.global and
		//		globalObject.document as dojo.doc. If provided, globalObject
		//		will be executed in the context of object thisObject
		// description:
		//		When callback() returns or throws an error, the dojo.global
		//		and dojo.doc will be restored to its previous state.
		var rval;
		var oldGlob = dojo.global;
		var oldDoc = dojo.doc;
		try{
			dojo.setContext(globalObject, globalObject.document);
			rval = dojo._fireCallback(callback, thisObject, cbArguments);
		}finally{
			dojo.setContext(oldGlob, oldDoc);
		}
		return rval;
	}

	dojo.withDoc = function(	/*Object*/documentObject, 
								/*Function*/callback, 
								/*Object?*/thisObject, 
								/*Array?*/cbArguments){
		// summary:
		//		Call callback with documentObject as dojo.doc. If provided,
		//		callback will be executed in the context of object thisObject
		// description:
		//		When callback() returns or throws an error, the dojo.doc will
		//		be restored to its previous state.
		var rval;
		var oldDoc = dojo.doc;
		try{
			dojo.doc = documentObject;
			rval = dojo._fireCallback(callback, thisObject, cbArguments);
		}finally{
			dojo.doc = oldDoc;
		}
		return rval;
	}

	//Register any module paths set up in djConfig. Need to do this
	//in the hostenvs since hostenv_browser can read djConfig from a
	//script tag's attribute.
	if(djConfig["modulePaths"]){
		for(var param in djConfig["modulePaths"]){
			dojo.registerModulePath(param, djConfig["modulePaths"][param]);
		}
	}
} //if (typeof window != 'undefined')

//Load debug code if necessary.
// dojo.requireIf((djConfig["isDebug"] || djConfig["debugAtAllCosts"]), "dojo.debug");

//window.widget is for Dashboard detection
//The full conditionals are spelled out to avoid issues during builds.
//Builds may be looking for require/requireIf statements and processing them.
// dojo.requireIf(djConfig["debugAtAllCosts"] && !window.widget && !djConfig["useXDomain"], "dojo.browser_debug");
// dojo.requireIf(djConfig["debugAtAllCosts"] && !window.widget && djConfig["useXDomain"], "dojo.browser_debug_xd");

if(djConfig.isDebug){
	if(!console.firebug){
		dojo.require("dojo._firebug.firebug");
	}
}
