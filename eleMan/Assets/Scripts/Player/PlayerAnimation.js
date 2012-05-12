
// Adjusts the speed at which the walk animation is played back
var walkAnimationSpeedModifier = 2.5;
// Adjusts the speed at which the run animation is played back
var runAnimationSpeedModifier = 1.5;
// Adjusts the speed at which the jump animation is played back
var jumpAnimationSpeedModifier = 2.0;
// Adjusts the speed at which the hang time animation is played back
var jumpLandAnimationSpeedModifier = 3.0;

// Adjusts after how long the falling animation will be 
var hangTimeUntilFallingAnimation = 0.05;
private var jump;
private var crouch;
//~ private var jumping = false;
//~ private var hasAnimations = true;
private var isRunning = false;
private var isSliding = false;
//private var isHanging = false;

function Start () {
	animation.Stop();

	// By default loop all animations
	animation.wrapMode = WrapMode.Loop;

	// Jump animation are in a higher layer:
	// Thus when a jump animation is playing it will automatically override all other animations until it is faded out.
	// This simplifies the animation script because we can just keep playing the walk / run / idle cycle without having to spcial case jumping animations.
	var jumpingLayer = 1;
	jump = animation["jump_pose"];
	jump.layer = jumpingLayer;
	jump.speed *= jumpAnimationSpeedModifier;
	//~ jump.wrapMode = WrapMode.Once;
	jump.wrapMode = WrapMode.ClampForever;
	
//	crouch = animation["crouch"];
//	crouch.layer = jumpingLayer;
//	crouch.wrapMode = WrapMode.ClampForever;
	//~ var jumpFall = animation["jumpFall"];
	//~ jumpFall.layer = jumpingLayer;
	//~ jumpFall.wrapMode = WrapMode.ClampForever;

	//~ var jumpLand = animation["jumpLand"];
	//~ jumpLand.layer = jumpingLayer;
	//~ jumpLand.speed *= jumpLandAnimationSpeedModifier;
	//~ jumpLand.wrapMode = WrapMode.Once;

	var run = animation["run"];
	run.speed *= runAnimationSpeedModifier;
	
	var walk = animation["walk"];
	walk.speed *= walkAnimationSpeedModifier;
	
	var idle = animation["idle"];

}

function Update () {
	var controller : PlayerController = GetComponent(PlayerController);

	//~ if (hasAnimations) {
		// We are not falling off the edge right now
		if (controller.GetHangTime() < hangTimeUntilFallingAnimation) {
			// Are we moving the character?
			if (controller.IsMoving())
			{
				//~ if (isSliding)
					//~ animation.CrossFade("slide");
				//~ else
				if (isRunning && !isSliding)// && !isHanging)
					animation.CrossFade ("run");
				else
					animation.CrossFade ("walk");
			}
			// Go back to idle when not moving
			else
				animation.CrossFade ("idle", 0.5);
		}
		// When falling off an edge, after hangTimeUntilFallingAnimation we will fade towards the ledgeFall animation
		else {
			//~ animation.CrossFade ("ledgeFall");
		}
	//~ }
}

function DidJump () {
	//~ if(hasAnimations)
	animation.Play ("jump_pose");
	//~ animation.PlayQueued ("jump_pose");
	//~ animation.PlayQueued ("jumpFall");
	//~ animation.PlayQueued ("idle");
}

function ReachedApex() {
//~ animation.Play ("jump_pose");
	//~ animation.Stop ("jump_pose");
	//~ animation.PlayQueued ("idle");
	//~ animation.CrossFade ("idle", 0);
}

function DidLand () {
	//~ animation.Stop ("jumpFall");
	//~ animation.Play ("jumpLand");
	//~ animation.Blend ("jumpLand", 0);
	//~ isHanging = false;
	animation.Stop ("jump_pose");
	animation.CrossFade ("walk", 0);
	//~ animation.Stop ("jump_pose");
	//~ jump.wrapMode = WrapMode.ClampForever;
}

//function Crouch () {
//	animation.Play ("crouch");
//}

//function GetUp () {
//	animation.Stop ("crouch");
//	//~ animation.CrossFade ("idle", 0);
//}

function Run () {
	isRunning = true;
}

function Walk () {
	isRunning = false;
}

function Push (pushing:boolean) {
	//~ Debug.Log("Animation:  Pushing!");
	isRunning = !pushing;
	//start push animation
}

function Grab (grabbing:boolean) {
	//~ Debug.Log("Animation:  Pulling! - "+grabbing);
	isRunning = !grabbing;
	//start pull animation
}

//function Hang (hang : boolean) {
//	//~ isRunning = false;
//	isHanging = hang;
//	isRunning = !hang;
//	animation.Stop ("jump_pose");
//	animation.CrossFade ("idle", 0);
//}

function Sliding (slide:boolean) {
	isSliding = slide;
	isRunning = !slide;
}