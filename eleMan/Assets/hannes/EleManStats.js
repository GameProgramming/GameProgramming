var element : String;
///initial values stored at start to recover overwritten stats by elements
private var initialElement : String;
private var initialJumpHeight : float;
private var initialWalkSpeed :float;
private var initialRunSpeed :float;
private var player : PlayerController;


function Start() {
	player = gameObject.GetComponent("PlayerController");
		
	element = "Normal";
	initialJumpHeight = player.jumpHeight;
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