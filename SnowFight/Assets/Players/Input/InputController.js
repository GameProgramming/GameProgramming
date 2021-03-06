private var motor : CharacterMotorSF;

// Use this for initialization
function Awake () {
	motor = GetComponent(CharacterMotorSF);
}

// Update is called once per frame
function Update () {
	// Get the input vector from kayboard or analog stick
	var directionVector = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
	
	if (directionVector != Vector3.zero) {
		// Get the length of the directon vector and then normalize it
		// Dividing by the length is cheaper than normalizing when we already have the length anyway
		var directionLength = directionVector.magnitude;
		directionVector = directionVector / directionLength;
		
		// Make sure the length is no bigger than 1
		directionLength = Mathf.Min(1, directionLength);
		
		// Make the input vector more sensitive towards the extremes and less sensitive in the middle
		// This makes it easier to control slow speeds when using analog sticks
		directionLength = directionLength * directionLength;
		
		// Multiply the normalized direction vector by the modified length
		directionVector = directionVector * directionLength;
	}
	
	// Apply the direction to the CharacterMotor
	motor.inputMoveDirection = transform.rotation * directionVector;
	motor.inputAction = Input.GetButton("Action");
	motor.inputJump = Input.GetButton("Jump");
	
	motor.inputFire = Input.GetButton("Fire1");
	motor.inputAltFire = Input.GetButton("Fire2");
	
	motor.Rotate(Input.GetAxis("Mouse X") * 3, Input.GetAxis("Mouse Y") * 2);
}

function OnSetBot () {
	enabled = false;
}
function OnSetMainPlayer () {
	enabled = true;
}
function OnSetRemote () {
	enabled = false;
}

// Require a character controller to be attached to the same game object
@script RequireComponent (CharacterMotorSF)