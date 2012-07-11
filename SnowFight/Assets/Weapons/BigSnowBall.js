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
private var ballSize : float;
var maxBallSize : float = 30;
var sizeIncreaseRate : float = 0.5;
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
private var startRadius : float;
private var shot : boolean = false; 
private var loadshot :float = 0;

private var shootDirection : Vector3;
var velocity :Vector3  = Vector3.zero;

var snowRessource : GameObject;

private var trail :ParticleSystem;
private var appearing :float;
private var terrain :Terrain;

private var extrapolatedPosition :Vector3;

function Start () {
//	collider.attachedRigidbody.useGravity = false;
	isGrounded = false;
	shot = false;
	appearing = 0;
	
	meshRenderers = GetComponentsInChildren.<MeshRenderer> ();
	skinnedRenderers = GetComponentsInChildren.<SkinnedMeshRenderer> ();
	
	particleTail = transform.Find("Particles").GetComponent(ParticleSystem);
	
	startRadius = GetComponent(Renderer).bounds.extents.x;
	
	terrain = Terrain.activeTerrain;
	trail = transform.Find("Trail").particleSystem;
	transform.localScale = Vector3.zero;
}

function Awake () {
 	startSize = transform.localScale;
	ballSize = 10;
}

function Update () {
	if (pushingPlayer && pushingPlayer.networkView.isMine) {
		if (playerMotor.IsMovingBackward() || playerMotor.IsJumping() || IsBallTooFarAway (pushingPlayer)) {
			pushingPlayer.SendMessage("ReleaseItem", null, SendMessageOptions.DontRequireReceiver);		}
		else {
			if (playerMotor.inputAltFire) {
				// player destroys snowball
				pushingPlayer.SendMessage("OnItemDestruction", gameObject, SendMessageOptions.DontRequireReceiver);
				SmashBallToSnowfield();
			} else if (playerMotor.inputFire) {
				loadshot += Time.deltaTime;
			} else if (loadshot > 0.001) {
				loadshot = Mathf.Clamp(loadshot, 0.5, 3);
				shot = true;
				velocity = loadshot * (GetComponent(BigSnowBallDamage).GetSpeed() / ballSize)
									* pushingPlayer.transform.forward.normalized;//shootDirection * GetComponent(BigSnowBallDamage).GetSpeed();
				lastOwner = pushingPlayer;
				loadshot = 0;
				pushingPlayer.SendMessage("ReleaseItem", null, SendMessageOptions.DontRequireReceiver);
			}
		}
	}
	
	if (!pushingPlayer) {
		GetComponent(CharacterController).Move(Time.deltaTime * velocity);
	}
	
	//else if (rollBall) {
	radius = startRadius * ballSize / 10;
	//Debug.Log(radius);

	var terrH :float = Terrain.activeTerrain.SampleHeight(transform.position);
	if (terrH  + radius/2 < transform.position.y && shot)
		velocity += 2 * Time.deltaTime * velocity.normalized;
	if (collider.enabled) transform.position.y = terrH + radius/2;

	//rotate ball while rolling
	var dir :Vector3 = transform.position - lastPosition;
	var rotAxis = Vector3.Cross(dir, Vector3.up);
	rotAxis.Normalize();
	var angle : float = -(2*radius*Mathf.PI)/36*dir.magnitude * ballTurnSpeed;
	
	trail.transform.localPosition = Vector3.zero;
	transform.Rotate(rotAxis, angle, Space.World);
	//make sure we don't rotate the particle effect with it
	trail.transform.Rotate(rotAxis, -angle, Space.World);
	
	//create the trail behind the pushed snowball
	trail.transform.position.y = terrain.SampleHeight(trail.transform.position) + 0.05;
//	trail.startRotation = transform.rotation.eulerAngles.y;
	trail.startSize = radius * 1.5;
	//trail.Emit(1);
	
	//increase ball size when rolling
	if (ballSize <= maxBallSize) {
		ballSize += sizeIncreaseRate * dir.magnitude;
		particleSystem.enableEmission = false;
	} else {
		particleSystem.enableEmission = true;
	}
	
	appearing = Mathf.Clamp01(appearing + Time.deltaTime);
	transform.localScale = appearing * Vector3(radius,radius,radius);
	particleTail.emissionRate = dir.magnitude * 10;
	
	if (shot && dir.sqrMagnitude < 0.025) {
		shot = false;
	}
	
	if (!pushingPlayer) {
		if (networkView.isMine) {
			extrapolatedPosition = transform.position + (.1/Time.deltaTime) * dir; 
		} else {
			transform.position = Vector3.Lerp(transform.position, extrapolatedPosition, 2*Time.deltaTime);
		}
	}
}

function LateUpdate () {
	lastPosition = transform.position;
}

function FixedUpdate () {
	velocity = Vector3.MoveTowards(velocity, Vector3(0,0,0), (15+5*radius)*Time.deltaTime);
 //  	rigidbody.velocity.y += -1 * fallSpeed * Time.deltaTime;
}

function Move (offset : Vector3) {
	if (pushingPlayer && !shot) {
		//Roll(true);
		var playerController = pushingPlayer.GetComponent(CharacterController);
		var playerTransform :Transform = pushingPlayer.transform;
		//try to make sure the ball is infront of the player
		var minDistance = playerController.radius + radius*.7 + 0.3;
		var desiredPos : Vector3 = playerTransform.position + playerTransform.forward * minDistance;
		var correctionVector : Vector3 = Vector3.ClampMagnitude(
						transform.position - desiredPos,ballCorrectionSpeed* Time.deltaTime);
		correctionVector.y = 0.0;
		offset.y = 0;
		
		//rigidbody.MovePosition(transform.position + (offset -  correctionVector));
		//transform.position += (offset -  correctionVector);
		GetComponent(CharacterController).Move(offset -  correctionVector);
		extrapolatedPosition = transform.position;
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
			velocity = Vector3.zero;
		loadshot = 0;
		transform.parent = null;
		pushingPlayer = null;
	}
	//networkView.enabled = true;
}

function PickItem(player:GameObject) {
	pushingPlayer = player;
	transform.parent = pushingPlayer.transform;
	playerMotor = player.GetComponent(CharacterMotorSF);
	loadshot = 0;
	shot = false;
	//networkView.enabled = false;
}

function OnReachBase () {
	if (pushingPlayer) {
		pushingPlayer.SendMessage("ReleaseItem", null, SendMessageOptions.DontRequireReceiver);
	}
	networkView.RPC("NetReachBase", RPCMode.All);
	velocity = 10 * Vector3.down;
	yield WaitForSeconds(1);
	Network.Destroy(gameObject);
}

@RPC
function NetReachBase () {
	particleSystem.gravityModifier = -0.7;
	particleSystem.Emit(90);
	collider.enabled = false;
	velocity = 10 * Vector3.down;
}

function SmashBallToSnowfield () {
//	transform.parent = null;
	var res :GameObject = Network.Instantiate(snowRessource, transform.position, Quaternion.identity,0);
	res.GetComponent(SnowRessource).CreateResourceFromSnowball(ballSize);
	collider.enabled = false;
	velocity = 20 * Vector3.down;
	yield WaitForSeconds(0.5);
	Network.Destroy(gameObject);
}

function GetLastOwner() : GameObject {
	return lastOwner;
}

function GetCurrentSnowballs() :int {
	return ballSize;
}

function HasReachedFullSize () : boolean {
//	Debug.Log("Full size: " + (radius >= maxBallSize));
	return (ballSize >= maxBallSize);
}

function OnDestroy () {
	if (pushingPlayer) {
		pushingPlayer.SendMessage("OnItemDestruction", gameObject, SendMessageOptions.DontRequireReceiver);
	}
}

function OnSerializeNetworkView(stream :BitStream, info :NetworkMessageInfo) {
    stream.Serialize(ballSize);
    stream.Serialize(extrapolatedPosition);
}

@script RequireComponent (BigSnowBallDamage)
@script RequireComponent (NetworkView)