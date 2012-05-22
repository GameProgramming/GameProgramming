var element : String;
///initial values stored at start to recover overwritten stats by elements
private var initialElement : String;
private var initialJumpHeight : float;
private var initialWalkSpeed :float;
private var initialRunSpeed :float;
private var player : PlayerController;


function Start() {
	player = gameObject.GetComponent(PlayerController);
		
	element = "normal";
	initialJumpHeight = player.jump.height;
	// The speed when walking
	initialWalkSpeed = player.movement.walkSpeed;
	// when pressing "Fire3" button (cmd) we start running
	initialRunSpeed = player.movement.runSpeed;

}

function ResetNormalPlayerStats() {
    element = "normal";
	player.jump.height = initialJumpHeight;
	// The speed when walking
	player.movement.walkSpeed = initialWalkSpeed;
	// when pressing "Fire3" button (cmd) we start running
	player.movement.runSpeed = initialRunSpeed;
}

function SetElement(elem :String) {
	ResetNormalPlayerStats();
    
    element = elem;
    
    switch (elem) {
    case "air":
        player.jump.height = 6;
        break;
    case "earth":
    	player.jump.height = 0.2;
    	break;
   	case "water":
    	break;
    case "fire":
    	break;
   	default:
   		break;
    }
    
    var body :Transform = transform.FindChild("Body");
    for (i = 0; i < body.GetChildCount(); i++) {
    	body.GetChild(i).gameObject.active = false;
    }
    body.FindChild(elem).gameObject.active = true;
    body.FindChild("eyes").gameObject.active = true;
}