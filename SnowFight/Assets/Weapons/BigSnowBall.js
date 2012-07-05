#pragma strict
var respawnTimeout = 2.0;
var maxBallDistance : float = 3.0;
var ballCorrectionSpeed : float = 5.0;
private var groundNormal : Vector3 = Vector3.zero;

//private var spawnPoints : GameObject[]; 
private var respawning : boolean;
private var spawnTime = 0.0;
private var meshRenderers :MeshRenderer[];
private var skinnedRenderers :SkinnedMeshRenderer[];
private var particleTail :ParticleSystem;

//private var rollBall : boolean;
private var lastPosition : Vector3;
private var radius : float;
//private var perimeter : float;
var ballTurnSpeed = 150;

private var pushingPlayer : GameObject;
private var lastOwner : GameObject;
private var playerMotor : CharacterMotorSF;
private var isGrounded : boolean;
var fallSpeed : float = 9.81;

//variables to increase ball size when rolling
@System.NonSerialized
var startSize : Vector3;
var maxBallSize : float = 3.0;
var sizeIncreaseRate : float = 0.05;
private var shot : boolean = false; 

private var shootDirection : Vector3;

var snowRessource : GameObject;

function Start () {
	collider.attachedRigidbody.useGravity = false;
	isGrounded = false;
	shot = false;
	
	meshRenderers = GetComponentsInChildren.<MeshRenderer> ();
	skinnedRenderers = GetComponentsInChildren.<SkinnedMeshRenderer> ();
	
	particleTail = transform.Find("Particles").GetComponent(ParticleSystem);
	
	radius = GetComponent(Renderer).bounds.size.x*0.5;
}

function Awake () {
 	startSize = transform.localScale;
}

function Update () {
	if (pushingPlayer) {
		if (playerMotor.IsMovingBackward() || playerMotor.IsJumping() || IsBallTooFarAway (pushingPlayer)) {
			pushingPlayer.SendMessage("ReleaseItem", null, SendMessageOptions.DontRequireReceiver);		}
		else {
			if (playerMotor.inputAltFire) {
				// player destroys snowball
				pushingPlayer.SendMessage("OnItemDestruction", gameObject, SendMessageOptions.DontRequireReceiver);
				SmashBallToSnowfield();
			} else if (playerMotor.inputFire) {
				shot = true;

				rigidbody.velocity = (GetComponent(BigSnowBallDamage).GetSpeed() / radius)
									* pushingPlayer.transform.forward.normalized;//shootDirection * GetComponent(BigSnowBallDamage).GetSpeed();
				lastOwner = pushingPlayer;

				pushingPlayer.SendMessage("ReleaseItem", null, SendMessageOptions.DontRequireReceiver);
			}
		}
	}
		
	//else if (rollBall) {	
	radius = GetComponent(Renderer).bounds.size.x*0.5;

	//rotate ball while rolling
	var dir :Vector3 = transform.position - lastPosition;
	var rotAxis = Vector3.Cross(dir, Vector3.up);
	rotAxis.Normalize();
	var angle : float = -(2*radius*Mathf.PI)/36*dir.magnitude * ballTurnSpeed;
	transform.Rotate(rotAxis, angle, Space.World);
	
	//increase ball size when rolling
	if (radius <= maxBallSize) {
		var parent = transform.parent;
		transform.parent = null;
		var increase :float = sizeIncreaseRate * dir.magnitude;
		transform.localScale += Vector3(increase,increase,increase);
		transform.parent = parent;
	}
	
	particleTail.emissionRate = dir.magnitude * 10;
		
	if (shot && dir.sqrMagnitude < 0.025) {
		shot = false;	
	}
}

function LateUpdate () {
	lastPosition = transform.position;
}

function FixedUpdate () {
   	rigidbody.velocity.y += -1 * fallSpeed * Time.deltaTime;
}

function Move (offset : Vector3) {
	if (pushingPlayer && !shot) {
		//Roll(true);
		var playerController = pushingPlayer.GetComponent(CharacterController);
		var playerTransform :Transform = pushingPlayer.transform;
		//try to make sure the ball is infront of the player
		var minDistance = playerController.radius + radius + 0.2;
		var desiredPos : Vector3 = playerTransform.position + playerTransform.forward * minDistance;
		var correctionVector : Vector3 = transform.position - desiredPos;
		correctionVector.Normalize();
		correctionVector *= ballCorrectionSpeed;
		correctionVector *= Time.deltaTime;

		correctionVector.y = 0.0;
		offset.y = 0;
		
		rigidbody.MovePosition(transform.position + (offset -  correctionVector));

	}
}

function IsBallTooFarAway (player : GameObject) : boolean {
	var tooFar = false;
	if (player) {
		var playerController = player.GetComponent(CharacterController);
		var playerTransform = player.GetComponent(Transform);
		var maxAllowedDist = Mathf.Max(maxBallDistance, playerController.radius + radius*4);
		tooFar = (Vector3.Distance(transform.position , playerController.transform.position) > maxAllowedDist);
	}
	return tooFar;
}

function Release () {
	if (pushingPlayer) {
		if (!shot)
			rigidbody.velocity = Vector3.zero;
		transform.parent = null;
		pushingPlayer = null;
	}
}

function PickItem(player:GameObject) {
	pushingPlayer = player;
	transform.parent = pushingPlayer.transform;
	playerMotor = player.GetComponent(CharacterMotorSF);
	shot = false;
}

function OnReachBase () {
	if (pushingPlayer) { //tell the bot that his ball has reached the base
		pushingPlayer.SendMessage("ReleaseItem", null, SendMessageOptions.DontRequireReceiver);
	}
	
	Network.Destroy(gameObject);
}

function SmashBallToSnowfield () {
//	transform.parent = null;
	var res :GameObject = Network.Instantiate(snowRessource, transform.position, Quaternion.identity,0);
	res.GetComponent(SnowRessource).CreateResourceFromSnowball(radius, maxBallSize);
	Network.Destroy(gameObject);
}

function GetLastOwner() : GameObject {
	return lastOwner;
}

function GetCurrentSnowballs() :int {
	return 10;
}

@script RequireComponent (BigSnowBallDamage)

