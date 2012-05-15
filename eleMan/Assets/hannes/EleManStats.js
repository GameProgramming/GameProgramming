var element : String;
///initial values stored at start to recover overwritten stats by elements
private var initialElement : String;
private var initialJumpHeight : int;
private var initialWalkSpeed : int;
private var initialRunSpeed : int;
private var player : ThirdPersonController;

function Start() {
	player = gameObject.GetComponent("Third Person Controller");
	element = "Normal";
	initialJumpHeight =  12;//player.jumpHeight;
	// The speed when walking
	initialWalkSpeed = player.walkSpeed;
	// when pressing "Fire3" button (cmd) we start running
	initialRunSpeed = player.runSpeed;

}

function ResetNormalPlayerStats() {
    element = "Normal";
	player.jumpHeight = initialJumpHeight;
	// The speed when walking
	player.walkSpeed = initialWalkSpeed;
	// when pressing "Fire3" button (cmd) we start running
	player.runSpeed = initialRunSpeed;
}