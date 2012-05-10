
// Does this script currently respond to Input?
var canControl = true;

class ControllerMovement {
	// The speed when walking 
	var walkSpeed = 3.0;
	// when pressing "Run" button (control) we start running
	var runSpeed = 10.0;
	//Wehen pressing down we crouch and can only move slowly
	var crawlSpeed = 1.0;
	//Speed when we hang from the ceiling
	var hangSpeed = 1.0;
	
	var maxHorizontalSpeed = 10;

	var inAirControlAcceleration = 1.0;

	// The gravity for the character
	var gravity = 60.0;
	var maxFallSpeed = 20.0;
	
	//~ //Set how strongly the character is affected by slopes thus slowing down when going uphill and speeding up when going down
	var slopeEffect = 1;
	
	// How fast does the character slide on steep surfaces?
	var slidingSpeed : float = 15;
	// How much can the player influence the sliding speed?
	// If the value is 0.5 the player can speed the sliding up to 150% or slow it down to 50%.
	var slidingSpeedControl : float = 0.4;
	
	// How fast does the character change speeds?  Higher is faster.
	var speedSmoothing = 5.0;

	// This controls how fast the graphics of the character "turn around" when the player turns around using the controls.
	var rotationSmoothing = 10.0;

	// The current move direction in x-y.  This will always be (1,0,0) or (-1,0,0)
	// The next line, @System.NonSerialized , tells Unity to not serialize the variable or show it in the inspector view.  Very handy for organization!
	@System.NonSerialized
	var direction = Vector3.zero;

	// The current vertical speed
	@System.NonSerialized
	var verticalSpeed = 0.0;

	@System.NonSerialized
	var additionalVerticalSpeed = 0.0;
	
	// The current movement speed.  This gets smoothed by speedSmoothing.
	@System.NonSerialized
	var speed = 0.0;

	// Is the user pressing the left or right movement keys?
	@System.NonSerialized
	var isMoving = false;
	
	@System.NonSerialized
	var running = false;
	
	@System.NonSerialized
	var crouching = false;
	
	@System.NonSerialized
	var pushing = false;
	
	@System.NonSerialized
	var grabbing = false;
	
	@System.NonSerialized
	var hanging = false;

	@System.NonSerialized
	var controllerSize = 0.0; //TODO: just for now
	
	// Average normal of the last touched geometry
	@System.NonSerialized
	var contactNormal : Vector3;
	@System.NonSerialized
	var contactPosition : Vector3;
	@System.NonSerialized
	var myJoint : HingeJoint;
	@System.NonSerialized
	var currentColliderObject:GameObject;
	
	// The last collision flags returned from controller.Move
	@System.NonSerialized
	var collisionFlags : CollisionFlags; 

	// We will keep track of an approximation of the character's current velocity, so that we return it from GetVelocity () for our camera to use for prediction.
	@System.NonSerialized
	var velocity : Vector3;
	
	// This keeps track of our current velocity while we're not grounded?
	@System.NonSerialized
	var inAirVelocity = Vector3.zero;

	// This will keep track of how long we have we been in the air (not grounded)
	@System.NonSerialized
	var hangTime = 0.0;
}

var movement : ControllerMovement;

// We will contain all the jumping related variables in one helper class for clarity.
class ControllerJumping {
	// Can the character jump?
	var enabled = true;

	// How high do we jump when pressing jump and letting go immediately
	var height = 1.0;
	// We add extraHeight units (meters) on top when holding the button down longer while jumping
	var extraHeight = 4.1;
	
	// This prevents inordinarily too quick jumping
	// The next line, @System.NonSerialized , tells Unity to not serialize the variable or show it in the inspector view.  Very handy for organization!
	@System.NonSerialized
	//~ var repeatTime = 0.05;
	var repeatTime = 0.15;

	@System.NonSerialized
	var timeout = 0.15;

	// Are we jumping? (Initiated with jump button and not grounded yet)
	@System.NonSerialized
	var jumping = false;
	
	@System.NonSerialized
	var reachedApex = false;
  
	// Last time the jump button was clicked down
	@System.NonSerialized
	var lastButtonTime = -10.0;
	
	// Last time we performed a jump
	@System.NonSerialized
	var lastTime = -1.0;

	// the height we jumped from (Used to determine for how long to apply extra jump power after jumping.)
	@System.NonSerialized
	var lastStartHeight = 0.0;
	
	@System.NonSerialized
	var touchWallJumpTime = -1.0;
	@System.NonSerialized
	var wallJumpTimeout = 0.5;
	
	@System.NonSerialized
	var wallJumpContactNormalHeight : float;
}

var jump : ControllerJumping;

private var controller : CharacterController;
private var status : PlayerStatus;

// Moving platform support.
private var activePlatform : Transform;
private var activeLocalPlatformPoint : Vector3;
private var activeGlobalPlatformPoint : Vector3;
private var lastPlatformVelocity : Vector3;

function Start () {
	//Turn player in forward direction
	movement.direction = transform.TransformDirection (Vector3.forward);
	controller = GetComponent (CharacterController);
	status = transform.GetComponent (PlayerStatus);
	//Get size for collision check when ducking
	movement.controllerSize = controller.height;
	
	if(!status) {
		Debug.Log("No link to player status.");
	}
}

function Update () {
	if (Input.GetButtonDown ("Jump") && canControl) {
		jump.lastButtonTime = Time.time;
	}

	UpdateSmoothedMovementDirection();
	
	// Apply gravity
	ApplyGravity ();

	// Apply jumping logic
	ApplyJumping ();
	ApplyWallJump ();
	
	ApplyCrouching();
	
	ApplyRunning ();
	
	ApplyHanging();
	
	// Moving platform support
	if (activePlatform != null) {
		var newGlobalPlatformPoint = activePlatform.TransformPoint(activeLocalPlatformPoint);
		var moveDistance = (newGlobalPlatformPoint - activeGlobalPlatformPoint);
		transform.position = transform.position + moveDistance;
		lastPlatformVelocity = (newGlobalPlatformPoint - activeGlobalPlatformPoint) / Time.deltaTime;
	} else {
		lastPlatformVelocity = Vector3.zero;	
	}
	
	activePlatform = null;
	contactNormal = Vector3.zero;
	
	// Save lastPosition for velocity calculation.
	lastPosition = transform.position;
	
	// Smooth the speed based on the current target direction
	var curSmooth = movement.speedSmoothing * Time.deltaTime;
	//Apply intertia: if character moved in opposite direction previously, slowly change to new direction
	var horizontalSpeed = Mathf.Lerp(movement.velocity.x, movement.direction.x*movement.speed, curSmooth);
	// Calculate actual motion with applying inertia on x
	//~ var currentMovementOffset = movement.direction*movement.speed + Vector3 (0, movement.verticalSpeed, 0) + movement.inAirVelocity;
	var currentMovementOffset = Vector3 (horizontalSpeed, movement.verticalSpeed, 0) + movement.inAirVelocity;
	//~ currentMovementOffset.x = Mathf.Lerp(movement.velocity.x, currentMovementOffset.x, curSmooth);
	// We always want the movement to be framerate independent.  Multiplying by Time.deltaTime does this.
	currentMovementOffset *= Time.deltaTime;

   	// Move our character!
	movement.collisionFlags = controller.Move (currentMovementOffset);
	
	//~ if (movement.hanging) {
		//~ var newPosition = transform.position+movement.direction* (controller.radius*6);
		//~ Debug.DrawRay(transform.position+Vector3(0,2,0), newPosition-transform.position, Color.green);
	//~ }
	
	// Calculate the velocity based on the current and previous position.  
	// This means our velocity will only be the amount the character actually moved as a result of collisions.
	movement.velocity = (transform.position - lastPosition) / Time.deltaTime;
	
	// Moving platforms support
	if (activePlatform != null) {
		activeGlobalPlatformPoint = transform.position;
		activeLocalPlatformPoint = activePlatform.InverseTransformPoint (transform.position);
	}
	
	if (movement.direction.sqrMagnitude > 0.01 && !movement.grabbing) //do not rotate player when pulling an object
		// Set rotation to the move direction	
		transform.rotation = Quaternion.Slerp (transform.rotation, Quaternion.LookRotation (movement.direction), Time.deltaTime * movement.rotationSmoothing);
	
	// We are in jump mode but just became grounded
	if (controller.isGrounded) {
		movement.inAirVelocity = Vector3.zero;
		if (jump.jumping) {
			jump.jumping = false;
			SendMessage ("DidLand", SendMessageOptions.DontRequireReceiver);

			var jumpMoveDirection = movement.direction * movement.speed + movement.inAirVelocity;
			if (jumpMoveDirection.sqrMagnitude > 0.01)
				movement.direction = jumpMoveDirection.normalized;
		}
	}	
	//we are in jump mode but just grabbed the ceiling
	if (movement.hanging) {
		movement.inAirVelocity = Vector3.zero;
		if (jump.jumping) {
			jump.jumping = false;
			//~ var jumpMoveDirection = movement.direction * movement.speed + movement.inAirVelocity;
			//~ if (jumpMoveDirection.sqrMagnitude > 0.01)
				//~ movement.direction = jumpMoveDirection.normalized;
		}
	}

	//this serves to freeze the camera for a while as happens when the player dies
	if (status.cameraTimer > 0.0)
		status.cameraTimer -= Time.deltaTime;
	else
		status.cameraTimer = 0.0;
}

function UpdateSmoothedMovementDirection () {	
	var h = Input.GetAxisRaw ("Horizontal");
	
	if (!canControl)
		h = 0.0;
	
	movement.isMoving = Mathf.Abs (h) > 0.1;
		
	if (movement.isMoving)
		movement.direction = Vector3 (h, 0, 0);
	
	additionalVerticalSpeed = 0.0;
	var curSmooth  = 0.0;
	var targetSpeed = 0.0;
	
	// Grounded controls
	if (controller.isGrounded) {
		// Smooth the speed based on the current target direction
		
		// Choose target speed
		targetSpeed = Mathf.Min (Mathf.Abs(h), 1.0);
			
		if(!IsTooSteep()) {
			//~ Debug.DrawRay(Vector3(transform.position.x,transform.position.y+2,0), movement.contactNormal, Color.green);
			SendMessage("Sliding", false, SendMessageOptions.DontRequireReceiver);
			// Pick speed modifier
			if (movement.crouching || movement.grabbing || movement.pushing) //user is ducked so only walk real slow
				targetSpeed *= movement.crawlSpeed;
			else if (movement.running)
				targetSpeed *= movement.runSpeed;
			else
				targetSpeed *= movement.walkSpeed;
				
			targetSpeed = AdjustGroundVelocityToNormal(targetSpeed);
		}
		else { //Slide!!
			SendMessage("Sliding", true, SendMessageOptions.DontRequireReceiver);
			// The direction we're sliding in
			var targetSpeedVector = Vector3(movement.contactNormal.x, 0, 0).normalized;
			var oldTargetSpeed = targetSpeedVector;
			// Find the input movement direction projected onto the sliding direction
			var projectedMoveDir = Vector3.Project(movement.direction, targetSpeedVector);
			// Add the sliding direction, the spped control, and the sideways control vectors
			targetSpeedVector = targetSpeedVector + projectedMoveDir * movement.slidingSpeedControl;
			// Multiply with the sliding speed
			targetSpeedVector *= movement.slidingSpeed;
			
			if (movement.direction.x > 0.0)
				targetSpeed = targetSpeedVector.x;
			else
				targetSpeed = -targetSpeedVector.x;
		
			var alpha = Vector3.Angle(movement.contactNormal, Vector3.up) * Mathf.Deg2Rad;
			//~ movement.verticalSpeed = Mathf.Tan(alpha)*targetSpeedVector.x; //Make sure we stay grounded
			movement.additionalVerticalSpeed = Mathf.Abs(Mathf.Tan(alpha)*targetSpeed); //Make sure we stay grounded
			//~ Debug.DrawRay(Vector3(transform.position.x,transform.position.y+2,0), Vector3(targetSpeed,movement.additionalVerticalSpeed,0), Color.red);
		}
		
		//make sure player never gets too fast and also that speed doesn't increase too quickly
		var speedIncrease = targetSpeed - movement.speed;
		if (speedIncrease > movement.runSpeed)
			targetSpeed = movement.speed + movement.runSpeed;
		if(targetSpeed > movement.maxHorizontalSpeed)
			targetSpeed = movement.maxHorizontalSpeed;

		movement.speed = targetSpeed;
		movement.hangTime = 0.0;
	}
	else if (movement.hanging) { //hanging controls
		//~ Debug.Log("We're hanging around here!", this);
		
		// Choose target speed
		targetSpeed = Mathf.Min (Mathf.Abs(h), 1.0);
		targetSpeed *= movement.hangSpeed;
		
		//make sure player never gets too fast
		if(targetSpeed > movement.hangSpeed)
			targetSpeed = movement.hangSpeed;
		
		movement.speed = targetSpeed;
		movement.hangTime = 0.0;
	}
	else {
		// In air controls
		movement.hangTime += Time.deltaTime;
		if (movement.isMoving)
			movement.inAirVelocity += Vector3 (Mathf.Sign(h), 0, 0) * Time.deltaTime * movement.inAirControlAcceleration;
	}
}

function ApplyJumping () {
	//disable jumping when ducked or grabbing another body
	if (movement.crouching || movement.grabbing)
		return;
		
	// Prevent jumping too fast after each other
	if (jump.lastTime + jump.repeatTime > Time.time)
		return;

	if (controller.isGrounded) { //TODO: allow  jump when hanging?
		// Jump
		// - Only when pressing the button down
		// - With a timeout so you can press the button slightly before landing		
		if (jump.enabled && Time.time < jump.lastButtonTime + jump.timeout) {
			movement.verticalSpeed = CalculateJumpVerticalSpeed (jump.height);
			movement.inAirVelocity = lastPlatformVelocity;
			SendMessage ("DidJump", SendMessageOptions.DontRequireReceiver);
		}
	}
}

function ApplyWallJump () {

	// We must actually jump against a wall for this to work
	if (!jump.jumping)
		return;

	// Store when we first touched a wall during this jump
	if (movement.collisionFlags == CollisionFlags.CollidedSides) {
		jump.touchWallJumpTime = Time.time;
	}

	// The user can trigger a wall jump by hitting the button shortly before or shortly after hitting the wall the first time.
	var mayJump = jump.lastButtonTime > jump.touchWallJumpTime - jump.wallJumpTimeout && jump.lastButtonTime < jump.touchWallJumpTime + jump.wallJumpTimeout;
	if (!mayJump)
		return;
	
	// Prevent jumping too fast after each other
	if (jump.lastTime + jump.repeatTime > Time.time)
		return;
	
		
	if (Mathf.Abs(movement.contactNormal.y) < 0.2) {
		movement.contactNormal.y = 0;
		movement.direction = movement.contactNormal.normalized;
		// Wall jump gives us at least trotspeed
		movement.speed = Mathf.Clamp(movement.speed * 1.5, movement.walkSpeed, movement.runSpeed);
	}
	
	//Don't allow the direction to be changed just as we hit the wall
	//~ if (movement.velocity.x > 0)
		//~ movement.direction.x = 1;
	//~ else if (movement.velocity.x < 0)
		//~ movement.direction.x = -1;
		
	//~ movement.speed = movement.runSpeed + movement.velocity.x;
	
	else
	{
		movement.speed = 0;
	}
	
		movement.verticalSpeed = CalculateJumpVerticalSpeed (jump.height);
		DidJump();
		SendMessage("DidWallJump", null, SendMessageOptions.DontRequireReceiver);
	
}

 function ApplyCrouching ()  {
		if (controller.isGrounded) {
			//send message for animation
			if (Input.GetButton ("Crouch") && canControl) {
				SendMessage ("Crouch", SendMessageOptions.DontRequireReceiver);
				movement.crouching = true;
				
				var crouchingHeight = movement.controllerSize*0.5;
				//make character controller smaller by half
				controller.height = crouchingHeight;
				movement.collisionFlags = controller.Move (Vector3 (0, -crouchingHeight*0.5, 0)); //move controller down a bit because we are currently using the jump animation
			}
			
			else if (movement.crouching){ 
				if (canGetUp()) {	 //check if player CAN get up.. otherwise stay ducked until getting up is possible
					SendMessage ("GetUp", SendMessageOptions.DontRequireReceiver);
					movement.crouching = false;
					
					var standingHeight = movement.controllerSize;
					//make character controller bigger again
					controller.height = standingHeight;
					movement.collisionFlags = controller.Move (Vector3 (0, movement.controllerSize*0.5, 0)); //move controller down a bit because we are currently using the jump animation
					//~ controller.center.y = 0;
				}
			}
		}
 }
 
 function ApplyRunning () {
	if (controller.isGrounded && canControl) {
		if (Input.GetButton ("Run") && !(movement.grabbing || movement.pushing || movement.crouching || IsTooSteep())) {
			movement.running = true;
			SendMessage ("Run", SendMessageOptions.DontRequireReceiver);
		}
		else {
			movement.running = false;
			SendMessage ("Walk", SendMessageOptions.DontRequireReceiver);
		}
	}
 }
 
 function ApplyHanging () {
	//Make sure we really hit a ceiling and the ceiling is grabbable
	if (movement.currentColliderObject && IsTouchingCeiling() && LayerMask.LayerToName(movement.currentColliderObject.layer) == "Grabable") {
		if (Input.GetButton("Grab")) {
			movement.hanging = true;
			//~ gameObject.AddComponent ("HingeJoint");
			//~ movement.myJoint = GetComponent(HingeJoint) ;
			//~ movement.myJoint.axis = Vector3.forward ;
			//~ movement.myJoint.connectedBody = movement.currentColliderObject.rigidbody;
			//~ SendMessage ("Hang", SendMessageOptions.DontRequireReceiver);
			SendMessage ("Hang", true, SendMessageOptions.DontRequireReceiver);
		}
	}

	if (movement.hanging) {
		if (HasReachedCorner() || Input.GetButtonUp("Grab")) {
			movement.hanging = false;
			jump.jumping = true;
			SendMessage ("Hang", false, SendMessageOptions.DontRequireReceiver);
		}
	}
 }
 
function ApplyGravity () {
	// Apply gravity
	var jumpButton = Input.GetButton ("Jump");
	
	if (!canControl)
		jumpButton = false;
	
	// When we reach the apex of the jump we send out a message
	if (jump.jumping && !jump.reachedApex && movement.verticalSpeed <= 0.0) {
		jump.reachedApex = true;
		SendMessage ("ReachedApex", SendMessageOptions.DontRequireReceiver);
	}
	
	// * When jumping up we don't apply gravity for some time when the user is holding the jump button
	//   This gives more control over jump height by pressing the button longer
	var extraPowerJump =  jump.jumping && movement.verticalSpeed > 0.0 && jumpButton && transform.position.y < jump.lastStartHeight + jump.extraHeight && !IsTouchingCeiling ();
	
	if (extraPowerJump || movement.hanging)
		return;
	else if (controller.isGrounded)
		movement.verticalSpeed = -(movement.gravity+movement.additionalVerticalSpeed) * Time.deltaTime;
		//~ movement.verticalSpeed = -movement.gravity * Time.deltaTime;
	else
		movement.verticalSpeed -= movement.gravity * Time.deltaTime;
		
	// Make sure we don't fall any faster than maxFallSpeed.  This gives our character a terminal velocity.
	movement.verticalSpeed = Mathf.Max (movement.verticalSpeed, -movement.maxFallSpeed);
}

function CalculateJumpVerticalSpeed (targetJumpHeight : float) {
	// From the jump height and gravity we deduce the upwards speed 
	// for the character to reach at the apex.
	return Mathf.Sqrt (2 * targetJumpHeight * movement.gravity);
}

function DidJump () {
	jump.jumping = true;
	jump.reachedApex = false;
	jump.lastTime = Time.time;
	jump.lastStartHeight = transform.position.y;
	jump.lastButtonTime = -10;
}


function canGetUp () {	 //check if player CAN get up.. otherwise stay ducked until getting up is possible
	var lastPosition = transform.position;
	
	movement.collisionFlags = controller.Move (Vector3 (0, movement.controllerSize*0.75, 0));	//pretend to move controller up to see if standing person would have enough space
	transform.position = lastPosition;
	
	return !IsTouchingCeiling (); //if collided, there is not enough space and you can't get up
}

function HasReachedCorner () {
	var corner:boolean = false;
	//~ var lastPosition = transform.position;
	//~ var oldFlags = movement.collisionFlags;
	//~ var currentMovementOffset = movement.direction* (controller.radius*6);
	// We always want the movement to be framerate independent.  Multiplying by Time.deltaTime does this.
	//~ currentMovementOffset *= Time.deltaTime;
	//~ movement.collisionFlags = controller.Move (currentMovementOffset);	//pretend to move controller up to see if standing person would have enough space
	//~ var dist = Mathf.SqrtMathf.Pow(movement.speed,2)+Mathf.Pow(controller.height/2,2));
	var allowedStep = 5;
	//~ if (!IsTouchingCeiling()) {
	//at a corner the y-component of the hitnormal will hopefully be larger than -0.6
	//also allow hanging from a max slope of 36� (y > -0.6)- otherwise detect it as a corner
	//~ Debug.Log("Reached corner " + Time.time, this);
	//~ var dir = (transform.position+Vector3(movement.speed*movement.direction.x,controller.height/2+allowedStep,0))-transform.position;
	var dir = Vector3.up*(controller.height/2+allowedStep);
	//~ Debug.DrawRay(transform.position, dir, Color.green);
	//~ Debug.Log("Raycast: " + Physics.Raycast(transform.position, Vector3.up, controller.height/2+allowedStep) + " too steep: " + (movement.contactNormal.y > -0.9), this);
	
	
	if (movement.currentColliderObject) {
		if (!Physics.Raycast(transform.position, Vector3.up, controller.height/2+allowedStep) 
			|| movement.contactNormal.y > -0.9) { //too steep
		//~ if (movement.currentColliderObject && movement.contactNormal.y > Mathf.Cos(10 * Mathf.Deg2Rad)) {
			//~ Debug.Log ("Reached corner " +Time.time,this);
			corner = true;
		}
	}
		
	//~ transform.position = lastPosition;
	//~ movement.collisionFlags = oldFlags;
	return corner;
}

function OnControllerColliderHit (hit : ControllerColliderHit) {
	//~ if (hit.moveDirection.y > 0.01) 
		//~ return;
		
	movement.contactNormal = hit.normal;
	movement.contactPosition = hit.point;
	
	// Make sure we are really standing on a straight platform
	// Not on the underside of one and not falling down from it either!
	if (hit.moveDirection.y < -0.9 && hit.normal.y > 0.9) {
		activePlatform = hit.collider.transform;	
	}
	else {
	//~ Debug.Log("Hitting " + Time.time,this);
	movement.currentColliderObject = hit.gameObject;
	}
}

//Make sure the player doesn't get faster when walking upwards because of the unaccounted y-movement
private function AdjustGroundVelocityToNormal (hVelocity : float) {
	var alpha = Vector3.Angle(movement.contactNormal, Vector3.up) * Mathf.Deg2Rad;
	var oldVelocity = hVelocity;
	//Multiplying the velocity by the slope factor adapts the x-movement to the slope
	//hereby making sure that the distance travelled horizontally or diagonally is always the same
	if (alpha < 45)
		hVelocity *= Mathf.Cos(alpha);

	hVelocity *= DownhillSpeedUp() ;
	
	//Make sure we are always grounded on steep slopes
	if (DownhillSpeedUp()>1)
		movement.additionalVerticalSpeed = Mathf.Abs(Mathf.Tan(alpha)*hVelocity);
		//~ movement.additionalVerticalSpeed = 0.75;
		//~ movement.verticalSpeed -= Mathf.Abs(oldVelocity-hVelocity); //TODO
	
	return hVelocity;
}

function DownhillSpeedUp() {
	//degree of the slope underneath
	var alpha = Vector3.Angle(movement.contactNormal, Vector3.up);
	var speedUp = 1;
	
	if(alpha >=10 && movement.slopeEffect >= 1) {
		if((movement.direction.x > 0 && movement.contactNormal.x > 0) || //walking to right AND downhill
			(movement.direction.x < 0 && movement.contactNormal.x < 0)) { //walking to left AND downhill 
			speedUp = Mathf.Log(alpha,10)*movement.slopeEffect;
		}
	}
	return speedUp;
}

function Grab(grab : boolean) {
	movement.grabbing = grab;
}

function Push(push : boolean) {
	movement.pushing = push;
}

// Various helper functions below:
function GetSpeed () {
	return movement.speed;
}

function GetVelocity () {
	return movement.velocity;
}


function GetDirection () {
	return movement.direction;
}


function GetHangTime() {
	return movement.hangTime;
}

function IsMoving () {
	return movement.isMoving;
}

function IsJumping () {
	return jump.jumping;
}

function IsCrouched () {
	return movement.crouching;
}

function IsTouchingCeiling () {
	return (movement.collisionFlags & CollisionFlags.CollidedAbove) != 0;
}

function IsTooSteep () {
	return (movement.contactNormal.y <= Mathf.Cos(controller.slopeLimit * Mathf.Deg2Rad));
}

function IsGrounded () {
	return controller.isGrounded;
}

function ResetSpeed() {
	if (movement.direction.x < 0)
		movement.direction = transform.TransformDirection (Vector3(0,0,-1));
	movement.verticalSpeed = 0.0;
	movement.velocity = Vector3.zero;
	movement.speed = 0.0;
}

function HidePlayer()
{
	//~ var meshRenderers : SkinnedMeshRenderer[];
	var meshRenderers = GetComponentsInChildren (MeshRenderer);
	for (var rend : MeshRenderer in meshRenderers) {
		rend.enabled = false;
	}
	
		var skinnedRenderers = GetComponentsInChildren (SkinnedMeshRenderer);
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		rend.enabled = false;
	}

	//~ Find(SkinnedMeshRenderer).enabled = false; // stop rendering the player.
	canControl = false;	// disable player controls.
}

// This is a complementary function to the above. We don't use it in the tutorial, but it's included for
// the sake of completeness. (I like orthogonal APIs; so sue me!)

function ShowPlayer()
{
	//~ var meshRenderers : SkinnedMeshRenderer[];
	var meshRenderers = GetComponentsInChildren (MeshRenderer);
	for (var rend : MeshRenderer in meshRenderers) {
		rend.enabled = true;
	}
	
	var skinnedRenderers = GetComponentsInChildren (SkinnedMeshRenderer);
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		rend.enabled = true;
	}
	
	//~ yield WaitForSeconds(1.0);
	//~ GameObject.Find("rootJoint").GetComponent(SkinnedMeshRenderer).enabled = true; // start rendering the player again.
		//~ Find(SkinnedMeshRenderer).enabled = true; // start rendering the player again.
	canControl = true;	// allow player to control the character again.
}

function SetControllable (controllable : boolean) {
	canControl = controllable;
}

function FixedUpdate () {
	// Make sure we are absolutely always in the 2D plane.
	transform.position.z = 0;

}

// Require a character controller to be attached to the same game object
@script RequireComponent (CharacterController)
@script AddComponentMenu ("2D/Controller")