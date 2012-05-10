// Script that puts a window on-screen where the player can toggle who he controls
// It works by sending SetControllable messages to turn the different characters on and off.
// It also changes who the CameraScrolling scripts looks at.

// Does this script currently respond to Input?
var canControl = true;

// An internal reference to the attached CameraScrolling script
private var cameraScrolling : CameraScrolling;

// Who is the player controlling
private var selected = 0;
private var snap = false;

// List of objects to control
var targets : Transform[];

// Last time we pressed 'p'
@System.NonSerialized
var lastTime = -1.0;

@System.NonSerialized
var repeatTime = 0.05;


// On start up, we send the SetControllable () message to turn the different players on and off.
function Awake () {

	// Get the reference to our CameraScrolling script attached to this camera;
	cameraScrolling = GetComponent (CameraScrolling);
	
	// Set the scrolling camera's target to be our character at the start.
	cameraScrolling.SetTarget (targets[0], true);
	
	// tell all targets (except the first one) to switch off.
	for (var i=0; i < targets.Length; i++)  {
		targets[i].gameObject.SendMessage ("SetPlayerNumber", i, SendMessageOptions.DontRequireReceiver);
		targets[i].gameObject.SendMessage ("SetControllable", (i == 0), SendMessageOptions.DontRequireReceiver);
	}
}


function Update () {
			
	//get the input from the switch button and switch to next player
	//make sure the button is not pressed too often after each other
	if(Input.GetButtonUp ("Switch") ) {// && lastTime + repeatTime < Time.time) {
		//~ lastTime = Time.time;
		selected ++;
	}
	
	//if reached end of the list, move to  beginning
	if(selected >= targets.length)
		selected = 0;
		
	if (targets[selected] != cameraScrolling.GetTarget () && canControl) 
		SwitchPlayer();


	if(Input.GetButton ("Switch"))
		selected ++;
	if(selected >= targets.length)
		selected = 0;
		
	if (targets[selected] != cameraScrolling.GetTarget () && canControl) 
		SwitchPlayer();
}

function SwitchPlayer() {
	cameraScrolling.GetTarget ().gameObject.SendMessage ("SetControllable", false, SendMessageOptions.DontRequireReceiver);
	targets[selected].gameObject.SendMessage ("SetControllable", true, SendMessageOptions.DontRequireReceiver);
	cameraScrolling.SetTarget (targets[selected], snap);
	snap = false;
}

function setSwitch (num:int, snapping:boolean) {
	selected = num;
	snap = snapping;
}

// Ensure there is a CameraScrolling script attached to the same GameObject, as this script
// relies on it.
@script RequireComponent (CameraScrolling)
