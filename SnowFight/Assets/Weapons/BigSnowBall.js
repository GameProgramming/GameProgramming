#pragma strict
var respawnTimeout = 2.0;
var maxBallDistance : float = 3.0;
var ballCorrectionSpeed : float = 5.0;
private var groundNormal : Vector3 = Vector3.zero;

private var spawnPoints : GameObject[]; 
private var respawning : boolean;
private var spawnTime = 0.0;
private var meshRenderers :MeshRenderer[];
private var skinnedRenderers :SkinnedMeshRenderer[];

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
	
	spawnPoints = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus).GetSnowBallSpawns();
//	Respawn(Vector3.zero);
	
	//lastPosition = transform.position;
	radius = GetComponent(Renderer).bounds.size.x*0.5;
}

function Awake () {

 	startSize = transform.localScale;
}

function Update () {
	if (pushingPlayer) {
		if (playerMotor.IsMovingBackward() || playerMotor.IsJumping() || IsBallTooFarAway ()) {
			pushingPlayer.SendMessage("ReleaseItem", null, SendMessageOptions.DontRequireReceiver);
			Release();
		}
		else {
			if (playerMotor.inputAltFire) {
				// player destroys snowball
				pushingPlayer.SendMessage("OnItemDestruction", gameObject, SendMessageOptions.DontRequireReceiver);
				transform.parent = null;
				transform.position.y -= radius ; //TODO: don't hardcode this value!!
				transform.position.y += 1;
				Instantiate(snowRessource, transform.position, Quaternion.identity);
				snowRessource.GetComponent(SnowRessource).CreateResourceFromSnowball(radius, maxBallSize);
				Destroy(gameObject);
			}
			
			if (playerMotor.inputFire) {
				shot = true;

				rigidbody.velocity = shootDirection * GetComponent(BigSnowBallDamage).GetSpeed();
				lastOwner = pushingPlayer;

				//Roll(true);
				Release();
				
//				for (var rend : MeshRenderer in meshRenderers)
//					rend.material.color = Color.red;
//				for (var rend : SkinnedMeshRenderer in skinnedRenderers)
//					rend.material.color = Color.red;
			}
		}
	}
		
	//else if (rollBall) {	
	radius = GetComponent(Renderer).bounds.size.x*0.5;

	//rotate ball while rolling
	var dir = transform.position - lastPosition;
	var rotAxis = Vector3.Cross(dir, Vector3.up);
	rotAxis.Normalize();
	var angle : float = -(2*radius*Mathf.PI)/36*dir.magnitude * ballTurnSpeed;
	transform.Rotate(rotAxis, angle, Space.World);
	
	//increase ball size when rolling
//			if (!deadly && radius <= maxBallSize) {
	if (radius <= maxBallSize) {
		var parent = transform.parent;
		transform.parent = null;
		transform.localScale.x += sizeIncreaseRate * dir.magnitude;
		transform.localScale.y += sizeIncreaseRate * dir.magnitude;
		transform.localScale.z += sizeIncreaseRate * dir.magnitude;
		transform.parent = parent;
	}
//	else {
//
//		for (var rend : MeshRenderer in meshRenderers)
//			rend.material.color = Color.blue;
//		for (var rend : SkinnedMeshRenderer in skinnedRenderers)
//			rend.material.color = Color.blue;
//	}
		
	if (shot && dir.magnitude < 0.05) {
//		Debug.Log("Back to normal" , this);
		shot = false;
		//gameObject.tag = "BigSnowball";
		//Roll(false);	
//		for (var rend : MeshRenderer in meshRenderers)
//			rend.material.color = Color.white;
//		for (var rend : SkinnedMeshRenderer in skinnedRenderers)
//			rend.material.color = Color.white;
		
	}
	
	//upon respawn make visible after hide time
	if (respawning && Time.time > spawnTime + respawnTimeout) {
		for (var rend : MeshRenderer in meshRenderers) {
			rend.enabled = true;
		}
		
		for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
			rend.enabled = true;
		}
		respawning = false;
	}
}

function LateUpdate () {
	lastPosition = transform.position;
}

function FixedUpdate () {
	//if (!collider.attachedRigidbody.useGravity) {
//	Debug.DrawRay(transform.position, Vector3.up * radius51, Color.red);
//	if (!isGrounded) {
//		var gravityVector = Vector3.down * fallSpeed * Time.deltaTime;
//    	transform.Translate(gravityVector, Space.World);
//	}
		
	//ApplyGravity
//	if (Physics.Raycast (transform.position, -Vector3.up, radius + 0.05, LayerMask.NameToLayer("Ground"))) {
//        isGrounded = true;
//    }
//    else { //we're not grounded, move us down a bit
//    	isGrounded = false; 
    	rigidbody.velocity.y += -1 * fallSpeed * Time.deltaTime;
    	//var gravityVector = Vector3.down * fallSpeed * Time.deltaTime;
    	//transform.Translate(gravityVector, Space.World);	
//    }
   // }
}

//function OnCollisionEnter(collisionInfo : Collision) {
//	var player = collisionInfo.gameObject.GetComponent(PlayerStatus);
//	if (deadly && player && collisionInfo.transform != transform.parent) {
//
//	}
////	isGrounded = false;
////	for (var contact : ContactPoint in collisionInfo.contacts) {
////		if (contact.normal.y > 0.01)
////			isGrounded = true;
//////        Debug.DrawRay(contact.point, contact.normal * 10, Color.white);
////    }
////}
////
////function OnCollisionExit(collisionInfo : Collision) {
////	isGrounded = false;
//}

function Move (offset : Vector3) {
	if (pushingPlayer && !shot) {
		//Roll(true);
		var playerController = pushingPlayer.GetComponent(CharacterController);
		var playerTransform = pushingPlayer.GetComponent(Transform);
		//try to make sure the ball is infront of the player
		var minDistance = playerController.radius + radius + 0.2;
		var desiredPos : Vector3 = playerTransform.position + playerTransform.forward * minDistance;
		var correctionVector : Vector3 = transform.position - desiredPos;
		correctionVector.Normalize();
		correctionVector *= ballCorrectionSpeed;
		correctionVector *= Time.deltaTime;
		
		//save this in case we wanna shoot
		shootDirection = (offset -  correctionVector);

		correctionVector.y = 0.0;
		offset.y = 0;
		//transform.Translate(offset -  correctionVector, Space.World);		
		rigidbody.MovePosition(transform.position + (offset -  correctionVector));

	}
}

function IsBallTooFarAway () : boolean {
	var tooFar = false;
	if (pushingPlayer) {
		var playerController = pushingPlayer.GetComponent(CharacterController);
		var playerTransform = pushingPlayer.GetComponent(Transform);
		var maxAllowedDist = Mathf.Max(maxBallDistance, playerController.radius + radius*2);
		tooFar = (Vector3.Distance(transform.position , playerController.transform.position) > maxAllowedDist);
	}
	return tooFar;
}

//private function IsGrounded () {
//	return isGrounded;
//}


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

function Respawn (spawnPosition : Vector3) {
	if (pushingPlayer) { //tell the bot that his ball has reached the base
			pushingPlayer.SendMessage("ReleaseItem", null, SendMessageOptions.DontRequireReceiver);
	}
	Release ();
	
	transform.localScale = startSize;
	for (var rend : MeshRenderer in meshRenderers)
		rend.material.color = Color.white;
	for (var rend : SkinnedMeshRenderer in skinnedRenderers)
		rend.material.color = Color.white;
	
	respawning = true;
	spawnTime = Time.time;
	
	//hide for a while
	for (var rend : MeshRenderer in meshRenderers) {
		rend.enabled = false;
	}
	
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		rend.enabled = false;
	}
	
	if (spawnPosition != Vector3.zero)
		transform.position = spawnPosition;
	else if (spawnPoints && spawnPoints.Length > 0) {
		transform.position = spawnPoints[Random.Range(0,spawnPoints.Length)].transform.position;
		transform.position.y += 5;
	}
}

function GetLastOwner() {
	return lastOwner;
}

@script RequireComponent (BigSnowBallDamage)

