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
private var reachedBase : boolean;
private var isGrounded : boolean;
var fallSpeed : float = 9.81;

//variables to increase ball size when rolling
@System.NonSerialized
var startSize : Vector3;
private var startRadius : float;
private var loadshot :float = 0;

private var shootDirection : Vector3;
var velocity :Vector3  = Vector3.zero;

var snowRessource : GameObject;

private var trail :ParticleSystem;
private var appearing :float;
private var terrain :Terrain;

var hitSnow : AudioClip;

private var extrapolatedPosition :Vector3;

function Awake () {
//	collider.attachedRigidbody.useGravity = false;
	isGrounded = false;
	reachedBase = false;
	appearing = 0;

	meshRenderers = GetComponentsInChildren.<MeshRenderer> ();
	skinnedRenderers = GetComponentsInChildren.<SkinnedMeshRenderer> ();

	particleTail = transform.Find("Particles").GetComponent(ParticleSystem);

	startRadius = GetComponent(Renderer).bounds.extents.x;

	terrain = Terrain.activeTerrain;
	trail = transform.Find("Trail").particleSystem;
	transform.localScale = Vector3.zero;

 	startSize = transform.localScale;
	ballSize = 10;
}

@RPC
function NetShootBall (velo :Vector3) {
	velocity = velo;				
}

function Start () {
	lastPosition = transform.position;
}

function Update () {
	if (pushingPlayer && pushingPlayer.networkView.isMine) {
		if (playerMotor.IsMovingBackward() || playerMotor.IsJumping() || IsBallTooFarAway (pushingPlayer)) {
			pushingPlayer.SendMessage("ReleaseItem", null, SendMessageOptions.DontRequireReceiver);		}
		else {
			
			if (playerMotor.inputAltFire) {
				// player destroys snowball
				PlayAudio(hitSnow);
				pushingPlayer.SendMessage("OnItemDestruction", gameObject, SendMessageOptions.DontRequireReceiver);
				SmashBallToSnowfield();
			} else if (playerMotor.inputFire) {
				PlayAudio(hitSnow);
				if (pushingPlayer.GetComponent(PlayerStatus).IsMainPlayer()) {
					RadialProgress.SetRadialProgress((2.0-loadshot) / 2, 17, null);
				}
				loadshot += Time.deltaTime;
			} else if (loadshot > 0.001) {
				//PlaySnowAudio();
				loadshot = Mathf.Clamp(loadshot, 0.5, 2);
				//shootDirection * GetComponent(BigSnowBallDamage).GetSpeed();
				lastOwner = pushingPlayer;
				if (Network.isServer) {
					NetShootBall(loadshot * (GetComponent(BigSnowBallDamage).GetSpeed() / Mathf.Min(20,ballSize))
							* pushingPlayer.transform.forward.normalized);
				} else {
					networkView.RPC("NetShootBall", RPCMode.Server,
							loadshot * (GetComponent(BigSnowBallDamage).GetSpeed() / Mathf.Min(20,ballSize))
							* pushingPlayer.transform.forward.normalized);
				}
				loadshot = 0;
				pushingPlayer.SendMessage("ReleaseItem", null, SendMessageOptions.DontRequireReceiver);
			}
		}
	}
	
	if (!pushingPlayer && networkView.isMine) {
		if (collider.enabled) {
			GetComponent(CharacterController).Move(Time.deltaTime * velocity);
		} else {
			transform.position += Time.deltaTime * velocity;
		}
	}
	
	//else if (rollBall) {
	radius = startRadius * ballSize / 10;
	//Debug.Log(radius);

	var terrH :float = Terrain.activeTerrain.SampleHeight(transform.position);
	if (terrH  + radius/2 < transform.position.y)
		velocity += 2 * Time.deltaTime * velocity.normalized;
	if (collider.enabled) transform.position.y = terrH + radius/2;

	//rotate ball while rolling
	var dir :Vector3 = transform.position - lastPosition;
	lastPosition = transform.position;
	var rotAxis = Vector3.Cross(dir, Vector3.up);
	rotAxis.Normalize();
	var angle : float = -(2*radius*Mathf.PI)/36*dir.magnitude * ballTurnSpeed;
	
	trail.transform.localPosition = Vector3.zero;
	transform.Rotate(rotAxis, angle, Space.World);
	//make sure we don't rotate the particle effect with it
	trail.transform.Rotate(rotAxis, -angle, Space.World);
	
	//create the trail behind the pushed snowball
	trail.transform.position.y = terrH + 0.05;
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
	
	if (!pushingPlayer) {
		if (networkView.isMine) {
			extrapolatedPosition = transform.position + (.1/Time.deltaTime) * dir; 
		} else {
			transform.position = Vector3.Lerp(transform.position, extrapolatedPosition, 2*Time.deltaTime);
		}
	}
}

function LateUpdate () {
	
	if (!collider.enabled) {
		velocity.y -= 40 * Time.deltaTime;
	}
}

function FixedUpdate () {
	velocity = Vector3.MoveTowards(velocity, Vector3(0,0,0), (25+2*radius)*Time.deltaTime);
 //  	rigidbody.velocity.y += -1 * fallSpeed * Time.deltaTime;
}

function Move (offset : Vector3) {
	if (pushingPlayer) {
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
		var maxAllowedDist = Mathf.Max(maxBallDistance, playerController.radius + radius*2);
		tooFar = (Vector3.Distance(transform.position , playerController.transform.position) > maxAllowedDist);
	}
	return tooFar;
}

function HasReachedBase () : boolean {
	return reachedBase;
}

function Release () {
	if (pushingPlayer) {
		loadshot = 0;
		transform.parent = null;
		pushingPlayer = null;
	}
	//networkView.enabled = true;
}

function PickItem(player:GameObject) {
	pushingPlayer = player;
	//transform.parent = pushingPlayer.transform;
	playerMotor = player.GetComponent(CharacterMotorSF);
	loadshot = 0;
	//networkView.enabled = false;
}

function OnReachBase () {
	if (pushingPlayer) {
		pushingPlayer.SendMessage("ReleaseItem", null, SendMessageOptions.DontRequireReceiver);
	}
	networkView.RPC("NetReachBase", RPCMode.All);
	yield WaitForSeconds(1);
	Network.Destroy(gameObject);
}

@RPC
function NetReachBase () {
	particleSystem.gravityModifier = -0.7;
	reachedBase = true;
	particleSystem.Emit(90);
	collider.enabled = false;
}

function SmashBallToSnowfield () {
	networkView.RPC("NetSmashBallToSnowfield", RPCMode.All);
}

@RPC
function NetSmashBallToSnowfield () {
	PlayAudio(hitSnow);
	collider.enabled = false;
	if (Network.isServer) {
		var snowRes :GameObject[] = GameObject.FindGameObjectsWithTag("SnowballRessource");
		var res :GameObject = null;
		for (var go :GameObject in snowRes) {
			if (Vector3.Distance(go.transform.position, transform.position) < 5 ) {
				res = go;
				break;
			}
		}
		if (!res) {
			res = Network.Instantiate(snowRessource, transform.position, Quaternion.identity,0);
		}
		res.GetComponent(SnowRessource).CreateResourceFromSnowball(ballSize);
		yield WaitForSeconds(0.5);
		Network.Destroy(gameObject);
	}
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

function PlayAudio(audio : AudioClip){
	if(!transform.audio.isPlaying){
		transform.audio.clip=audio;
		transform.audio.Play();
	}
}

function IsHeld () :boolean {
	return pushingPlayer != null;
}
function IsHeldBy (player :GameObject) :boolean {
	return pushingPlayer != player;
}

//function OnControllerColliderHit(hit : ControllerColliderHit){
//	Debug.Log("Hit something");
//	if(hit.gameObject.CompareTag("Player")) {
//		Debug.Log("Hit player " +hit.gameObject);
//		if (velocity.sqrMagnitude > 0.05 && lastOwner != hit.gameObject) {
//			var attack = new Attack();
//			attack.damage = GetComponent(BigSnowBallDamage).GetDamage();
//			attack.attacker = lastOwner;
//			hit.gameObject.SendMessage("ApplyDamage", attack);
//		}
//	}
//}

@script RequireComponent (BigSnowBallDamage)
@script RequireComponent (NetworkView)