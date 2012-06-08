var weapon = "";
var initialPositionX : int;
var initialPositionY : int;
var initialPositionZ : int;
var carrier = "";
function Start(){
	initialPositionX = gameObject.transform.position.x;
	initialPositionY = gameObject.transform.position.y;
	initialPositionZ = gameObject.transform.position.z;
}

function ResetWeapon(){
	carrier = "";
	gameObject.transform.position.x = initialPositionX;
	gameObject.transform.position.y = initialPositionY;
	gameObject.transform.position.z = initialPositionZ;
}