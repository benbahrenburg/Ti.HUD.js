/*jslint maxerr:1000 */

//Create our application namespace
var my = {
	hud : require('hud'),
	isAndroid : Ti.Platform.osname === 'android'
};

// Create a simple window to show our results
(function(){
	
	var win = Ti.UI.createWindow({
		backgroundColor:'yellow'
	});

	var hudButton = Ti.UI.createButton({
		title:'Show HUD', height:50, right:5, left:5, bottom: 40
	});
	win.add(hudButton);
	
	my.hud.addEventListener('close',function(e){
		//If we're on Android, and have hidden our navbar
		//we will want to show it again
		if(my.isAndroid && win.navBarHidden){
			win.navBarHidden=false;
		}		
		
		alert('HUD Window Closed');		
	});
	
	my.hud.addEventListener('open',function(e){
		Ti.API.info('HUD Window Open');		
	});

	my.hud.addEventListener('hudTextChanged',function(e){
		Ti.API.info('HUD Window Text Was Changed from ' + e.oldValue + ' to ' + e.newValue);		
	});
		
	my.hud.addEventListener('dblclick',function(e){
		Ti.API.info('HUD Window double clicked');	
		Ti.API.info('You can use this event to close the HUD or perform another action');	
	});

	my.hud.addEventListener('timerClose',function(e){
		Ti.API.info('HUD Window Closed by Timer');		
	});

	hudButton.addEventListener('click',function(e){
		//If we're on Android, and showing the navbar, we will want to hide it
		if(my.isAndroid && (win.navBarHidden===false || win.navBarHidden===undefined)){
			win.navBarHidden=true;
		}
	
		my.hud.options({dialog:true}) //Add dialog option
			  .load('Please Wait...') //Initialize window and add message
			  .addCloseTimer(5000) //Add a timeout
			  .show(); //Show the dialog

		//Wait a second then update the message
		setTimeout(function()
		{
			my.hud.updateMessage('Still waiting...');
			
		},1000);
			
	});	
	win.open();	
	
})();
