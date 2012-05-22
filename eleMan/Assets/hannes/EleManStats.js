var element : String;
///initial values stored at start to recover overwritten stats by elements
private var initialElement : String;
private var initialJumpHeight : float;
private var initialExtraJumpHeight : float;
private var initialWalkSpeed :float;
private var initialRunSpeed :float;
private var initialGravity : float;
private var initialInAirControlAcc : float;
private var initialSpeedSmooting : float;
private var initiaSlopeLimit : float;
private var player : PlayerController;


function Start() {
	player = gameObject.GetComponent(PlayerController);
		
	element = "normal";
	initialJumpHeight = player.jump.height;
	initialExtraJumpHeight = player.jump.extraHeight;
	initialGravity = player.movement.gravity;
    initialInAirControlAcc = player.movement.inAirControlAcceleration;
	// The speed when walking
	initialWalkSpeed = player.movement.walkSpeed;
	// when pressing "Fire3" button (cmd) we start running
	initialRunSpeed = player.movement.runSpeed;	
	initialSpeedSmooting = player.movement.speedSmoothing;
	//initialSlopeLimit = player.movement.slopeLimit;

	SetPlayerColor();
	
	Physics.IgnoreLayerCollision (LayerMask.NameToLayer("Player"), LayerMask.NameToLayer("IgnoreAlways"), true);
}

function ResetNormalPlayerStats() {
    element = "normal";
	player.jump.height = initialJumpHeight;
	player.jump.extraHeight = initialExtraJumpHeight;
	player.movement.gravity = initialGravity;
    player.movement.inAirControlAcceleration = initialInAirControlAcc;
	// The speed when walking
	player.movement.walkSpeed = initialWalkSpeed;
	// when pressing "Fire3" button (cmd) we start running
	player.movement.runSpeed = initialRunSpeed;
	player.movement.flying = false;
	player.movement.speedSmoothing = initialSpeedSmooting;
	//player.movement.slopeLimit = initiaSlopeLimit;
	
	Physics.IgnoreLayerCollision (LayerMask.NameToLayer("Player"), LayerMask.NameToLayer("Grid"), false);
	
	SetElement(element);
}

function SetElement(elem :String) {
   
    element = elem;
    
    switch (elem) {
    case "air":
        break;
    case "earth":
    	break;
   	case "water":
    	break;
    case "fire":
    	break;
	case "normal":
		break;
   	default: 
   		break;
    }
    //Debug.Log("elem: " + elem, this);
    SetPlayerColor();
}

function SetPlayerColor() {

	var meshRenderers = GetComponentsInChildren (MeshRenderer);
	for (var rend : MeshRenderer in meshRenderers) {
		if (rend.gameObject.name.Contains("eye") || rend.gameObject.name == element)
			rend.enabled = true;
		else
			rend.enabled = false;
	}
	
	var skinnedRenderers = GetComponentsInChildren (SkinnedMeshRenderer);
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		if (rend.gameObject.name.Contains("eye") || rend.gameObject.name == element)
			rend.enabled = true;
		else
			rend.enabled = false;
	}
}