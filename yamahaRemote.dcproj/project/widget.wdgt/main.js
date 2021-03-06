/* 
 This file was generated by Dashcode.  
 You may edit this file to customize your widget or web page 
 according to the license.txt file included in the project.
 */

var btnIdToCmd = {
    'btnVolumeUp':{
        'action':'PUT',
        'params':["Main_Zone", "Vol", "Up_Down", "Up"]
    },
    'btnVolumeDown':{
        'action':'PUT',
        'params':["Main_Zone", "Vol", "Up_Down", "Down"]
    },
    'btnMuteOn':{
        'action':'PUT',
        'params':["Main_Zone", "Vol", "Mute", "On"]
    },
    'btnMuteOff':{
        'action':'PUT',
        'params':["Main_Zone", "Vol", "Mute", "Off"]
    },
    'btnPowerOn':{
        'action':'PUT',
        'params':["Main_Zone", "Power_Control", "Power", "On"]
    },
    'btnPowerOff':{
        'action':'PUT',
        'params':["Main_Zone", "Power_Control", "Power", "Standby"]
    }
};

//
// Function: load()
// Called by HTML body element's onload event when the widget is ready to start
//
function load()
{
    dashcode.setupParts();
    alert("widget.identifier: "+widget.identifier);
    // check prefs are set
    var hostname = widget.preferenceForKey(widget.identifier + "-" + "hostname");
    var port = widget.preferenceForKey(widget.identifier + "-" + "port");
    if(!hostname || !port) showBack();
}

//
// Function: remove()
// Called when the widget has been removed from the Dashboard
//
function remove()
{
    // Stop any timers to prevent CPU usage
    // Remove any preferences as needed
    // widget.setPreferenceForKey(null, dashcode.createInstancePreferenceKey("your-key"));
}

//
// Function: hide()
// Called when the widget has been hidden
//
function hide()
{
    // Stop any timers to prevent CPU usage
}

//
// Function: show()
// Called when the widget has been shown
//
function show()
{
    // Restart any timers that were stopped on hide
}

//
// Function: sync()
// Called when the widget has been synchronized with .Mac
//
function sync()
{
    // Retrieve any preference values that you need to be synchronized here
    // Use this for an instance key's value:
    // instancePreferenceValue = widget.preferenceForKey(null, dashcode.createInstancePreferenceKey("your-key"));
    //
    // Or this for global key's value:
    // globalPreferenceValue = widget.preferenceForKey(null, "your-key");
}

//
// Function: showBack(event)
// Called when the info button is clicked to show the back of the widget
//
// event: onClick event from the info button
//
function showBack(event)
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToBack");
    }

    front.style.display = "none";
    back.style.display = "block";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
}

//
// Function: showFront(event)
// Called when the done button is clicked from the back of the widget
//
// event: onClick event from the done button
//
function showFront(event)
{
    setHostInfo();

    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToFront");
    }

    front.style.display="block";
    back.style.display="none";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
}

if (window.widget) {
    widget.onremove = remove;
    widget.onhide = hide;
    widget.onshow = show;
    widget.onsync = sync;
}

function updateClientList(){
    var hostname = widget.preferenceForKey(widget.identifier + "-" + "hostname");
    var port = widget.preferenceForKey(widget.identifier + "-" + "port");
    var clientListURL = "http://" + hostname + ":" + port + "/clients";
    alert(clientListURL);
    loadClientXML(clientListURL);
}

function loadClientXML(url) {
   xmlRequest = new XMLHttpRequest();
   xmlRequest.setRequestHeader("Cache-Control", "no-cache");
   xmlRequest.onreadystatechange = function(){
    processRequestChange(xmlRequest);
    };
   xmlRequest.open("GET",url,true);
   xmlRequest.send(null);
}

function processRequestChange(xmlRequest) {   
   if (null == xmlRequest.readyState) return;
   if (xmlRequest.readyState == 4) {
      if (xmlRequest.status == 200) {      
         alert("XML loaded");
         parseClientXML(xmlRequest.responseXML);
      } else {
         alert("XML load failed - no connection");
         if (null == xmlRequest.status) return;
      }
   }
}

function parseClientXML(clientXML){
    var clientNodes = clientXML.getElementsByTagName('Server');
    var clients = [];
    for (var i = 0; i < clientNodes.length; ++i) {
        clients.push([clientNodes[i].attributes.name.value, clientNodes[i].attributes.host.value]);
    }
    var popClient = document.getElementById("popClient").object;
    popClient.setOptions(clients);
}

function setHostInfo(){
    var hostname = document.getElementById("txtHost").value;
    var port = document.getElementById("txtPort").value;
    var lblCurrentHost = document.getElementById("lblCurrentHost");

    if(hostname && port){
        widget.setPreferenceForKey(hostname, widget.identifier + "-" + "hostname");
        widget.setPreferenceForKey(port, widget.identifier + "-" + "port");
        lblCurrentHost.textContent = hostname + ':' + port;
    }
}

function toggleView(event)
{
    var stkControls = document.getElementById('stkControls').object;
    var currentView = stkControls.getCurrentView().id;
    var nextView = (currentView!='vwPlayback') ? 'vwPlayback' : 'vwNavigation';
    stkControls.setCurrentView(nextView);
    alert('stkControls view set to '+nextView);
}


function sendAction(event){
    var btnId = event.toElement.id;
    var cmd = btnIdToCmd[btnId];
    
    var hostname = widget.preferenceForKey(widget.identifier + "-" + "hostname");
    var port = widget.preferenceForKey(widget.identifier + "-" + "port");
    var clientHost = widget.preferenceForKey(widget.identifier + "-" + "clientHost");
    
    var cmdURL = "http://"+hostname+":"+port+"/YamahaRemoteControl/ctrl";
    var xml = formatXMLData(cmd);
    
    //send cmd
    xmlRequest = new XMLHttpRequest();
    xmlRequest.setRequestHeader("Cache-Control", "no-cache");
    xmlRequest.setRequestHeader("Content-Type", "application/xml");
    xmlRequest.open('POST',cmdURL,true);
    xmlRequest.send(xml);

    alert(btnId+' clicked');
    alert('host: '+hostname+":"+port);
    alert('xml sent:');
    alert((new XMLSerializer()).serializeToString(xml));

}


function formatXMLData(cmd){
    var len = cmd.params.length;
    if (len < 4){ return; }
    var xml = document.implementation.createDocument("" , "" , null);
    var currentEl = xml.createElement("YAMAHA_AV");
    xml.appendChild(currentEl);
    currentEl.setAttribute('cmd', cmd.action);
    for(var i = 0; i < len-1; i++) {
        var newEl = xml.createElement(cmd.params[i]);
        currentEl.appendChild(newEl);
        currentEl=newEl;
    }
    currentEl.appendChild(xml.createTextNode(cmd.params[len-1]));
    return xml;
}
