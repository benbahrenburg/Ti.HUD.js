/*jslint maxerr:1000 */

/**
* 
* hud.js: Cross-platform HUD progress indicators
* Copyright: 2013 Benjamin Bahrenburg (http://bencoding.com)
* License: http://www.apache.org/licenses/LICENSE-2.0.html
*
*/

// ----------------------------------------------
//
//	Internal objects & Methods
//
// ----------------------------------------------

var _isAndroid = Ti.Platform.osname === 'android';
var _closeTimer = null, _eventList = [], _timerInterval = 3000, _needCreateTimer=false;
var _useDialogSpinner = false, _dialogSpinner = null;
var _hudObject = {
	win:null, view:null, label:null, spinner:null
};

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

function removeCloseTimer(){
	_needCreateTimer = false;
	if(_closeTimer!==null){
		clearInterval(_closeTimer);
		_closeTimer=null;		
	}	
};

function doDblclick(){
	exports.fireEvent("dblclick", {
		source: "HUD.win"
	});
};

function doClosingActionWindow(){
	if(_hudObject.spinner!==null){
		if(typeof _hudObject.spinner.hide == 'function'){
			_hudObject.spinner.hide();
		}
	}
	if(_hudObject.win!==null){
		if(typeof _hudObject.win.close == 'function'){
			_hudObject.win.close();
		}
	}		

	//Remove our double tap close listener
	_hudObject.win.removeEventListener('dblclick',doDblclick);

	//Remove Close Timer if created
	removeCloseTimer();
	
	//Nullify all of our objects
	_hudObject = {
		win:null, view:null, label:null, spinner:null
	};
		
	exports.fireEvent("close", {
		source: "HUD.win"
	});
};

function doClosingActionDialog(){
	if(_dialogSpinner!==null){
		if(typeof _dialogSpinner.hide == 'function'){
			_dialogSpinner.hide();
		}
	}
	
	//Remove Close Timer if created
	removeCloseTimer();
	
	_dialogSpinner = null;
		
	exports.fireEvent("close", {
		source: "HUD.win"
	});
};

// ----------------------------------------------
//
//	Externally facing Methods
//
// ----------------------------------------------

exports.options = function(opts){
	opts = opts || {};
	
	if(_isAndroid & opts.hasOwnProperty('dialog')){
		_useDialogSpinner = opts.dialog;
	}
	// Return the whole thing so we can chain this methods
	return exports;		
};

exports.fireEvent = function(eventName,paramOptions){
	var iLength = _eventList.length;
	for (var iLoop=0;iLoop<iLength;iLoop++){
		if(_eventList[iLoop].eventName===eventName){
			_eventList[iLoop].callback(paramOptions);
		}
	}
	// Return the whole thing so we can chain this methods
	return exports;	
};

exports.removeEventListener=function(eventName,callback){
	var iLength = _eventList.length;
	for (var iLoop=0;iLoop<iLength;iLoop++){
		if((_eventList[iLoop].eventName===eventName) && 
		  (_eventList[iLoop].callback == callback)){
			  _eventList.splice(i, 1);
		      iLoop--; //decrement	  	
		  }
	}
	// Return the whole thing so we can chain this methods
	return exports;	
};

exports.addEventListener=function(eventName,callback){
	_eventList.push({eventName:eventName,callback:callback});
	// Return the whole thing so we can chain this methods
	return exports;	
};


function loadHUDDialog(message){
	_dialogSpinner = Ti.UI.Android.createProgressIndicator({
	  message: message,
	  location: Ti.UI.Android.PROGRESS_INDICATOR_DIALOG,
	  type: Ti.UI.Android.PROGRESS_INDICATOR_INDETERMINANT,
	  cancelable: true
	});	
};

function loadHUDWindow(message){
	_hudObject.win = Ti.UI.createWindow({				
		orientationModes : [
			Ti.UI.PORTRAIT
		]
	});
	
	//If android we can't hide the window title
	//So we set it equal to the message
	//Hiding the window title will force the window to be heavy weight
	//and we will not be able to set the opacity correctly
	if(_isAndroid){
		_hudObject.win.title = message;
	}
	
	_hudObject.view = Ti.UI.createView({
		top:0,bottom:0,left:0,right:0, backgroundColor:'#000', opacity:0.7, touchEnabled:false
	});
	
	_hudObject.label = Ti.UI.createLabel({
		text:message, color:'#fff', 
		width:275, top:275,touchEnabled:false,
		height:'auto', textAlign:'center',				
		font:{
			fontSize:24, fontWeight:'bold'			
		}	
	});
	
	_hudObject.spinner = Ti.UI.createActivityIndicator({
		style: (_isAndroid ? Ti.UI.ActivityIndicatorStyle.BIG_DARK : Ti.UI.iPhone.ActivityIndicatorStyle.BIG ),
		top:150, height:150, width:10, touchEnabled:false
	});
	
	_hudObject.win.add(_hudObject.view);
	_hudObject.win.add(_hudObject.spinner);
	_hudObject.win.add(_hudObject.label);		
};

// Init function
exports.load = function(message){	

	if((message==undefined)||(message==null)){
		message='Loading...';
	}

	if(_isAndroid && _useDialogSpinner){
		loadHUDDialog(message);
	}else{
		loadHUDWindow(message);
	}
	// Return the whole thing so we can chain this methods
	return exports;
};

exports.removeCloseTimer = function(){
	//Call local function to do all of the work
	removeCloseTimer();
	// Return the whole thing so we can chain this methods
	return exports;
};

exports.addCloseTimer = function(milliseconds){
	
	//Remove any timers if already in place
	removeCloseTimer();
	
	//Check for invalid values, if so just return for chaining
	if((milliseconds===undefined)||(milliseconds===null)){
		return exports;
	}
	
	//If the timeout parameter is not a number, just return
	if(!isNumber(milliseconds)){
		return exports;
	}

	_timerInterval = milliseconds;

	//Set our timer flag
	_needCreateTimer = true;
	
	// Return the whole thing so we can chain this methods
	return exports;
};

//Update the HUD message text
exports.updateMessage = function(message){
	
	if((message!==undefined)&&(message!==null)){		
		if(_useDialogSpinner && _isAndroid){
			if(_dialogSpinner!==null){
				exports.fireEvent("hudTextChanged",{
					oldValue:_dialogSpinner.message, 
					newValue:message,
					source: "HUD.win"
				});
				_dialogSpinner.message = message;		
			}					
		}else{
			if(_hudObject.label!==null){
				exports.fireEvent("hudTextChanged",{
					oldValue:_hudObject.label.text, 
					newValue:message,
					source: "HUD.win"
				});
				_hudObject.label.text=message;
				//If Android update the HUD Window Title
				if(_isAndroid){
					_hudObject.win.title = message;
				}			
			}				
		}			
	}

	// Return the whole thing so we can chain this methods
	return exports;	
};

function showHUDDialog(){
	//How the activity spinner
	_dialogSpinner.show();	
};

function showHUDWindow(){
	//If not Android add animation
	if(!_isAndroid){
		// Set an initial low scale
		_hudObject.win.transform = Ti.UI.create2DMatrix().scale(0.001);	
		// Animate it to perform a nice "scale in"
		var scaleInTransform = Ti.UI.create2DMatrix();
		scaleInTransform = scaleInTransform.scale(1);	
		var scaleIn = Ti.UI.createAnimation();
		scaleIn.transform = scaleInTransform;
		scaleIn.duration = 250;
		_hudObject.win.animate(scaleIn);		
	}
	//How the activity spinner
	_hudObject.spinner.show();
	_hudObject.win.open();

	//Remove our double tap close listener
	_hudObject.win.addEventListener('dblclick',doDblclick);	
};

// Displays the overlay HUD to the user
exports.show = function(){

	if(_useDialogSpinner && _isAndroid){
		showHUDDialog();
	}else{
		showHUDWindow();
	}
	

	if(_needCreateTimer){
		if(_closeTimer!=null){
			clearInterval(_closeTimer);
		}
		//Set our timer to close the HUD
		_closeTimer = setTimeout(function()
		{
			exports.fireEvent("timerClose",{
				source: "HUD.win"
			});		
			//Hide our HUD
			exports.hide();
						
		},_timerInterval);
	}

	exports.fireEvent("open", {
		source: "HUD.win"
	});
	
	// Return the whole thing so we can chain this methods
	return exports;
};

function hideHUDWindow(){
	if(_isAndroid){
		doClosingActionWindow();
	}else{
		var scaleOutTransform = Ti.UI.create2DMatrix();
		scaleOutTransform = scaleOutTransform.scale(0.001);
	
		var scaleOut = Ti.UI.createAnimation();
		scaleOut.transform = scaleOutTransform;
		scaleOut.duration = 250;
		_hudObject.win.animate(scaleOut);
		
		// When the animation finishes, close the window
		scaleOut.addEventListener('complete', function(){
			doClosingActionWindow();
		});		
	}	
};

// Hides the overlay HUD from the user
exports.hide = function(){
	
	if(_useDialogSpinner && _isAndroid){
		doClosingActionDialog();
	}else{
		//If we've already hidden everything, just return
		if(_hudObject.win===null){
			return exports;
		}
		hideHUDWindow();		
	}
	
	// Return the whole thing so we can chain this methods
	return exports;
};
