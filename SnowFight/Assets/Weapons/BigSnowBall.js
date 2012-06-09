#pragma strict
var respawnTimeout = 2.0;
var maxBallDistance : float = 3.0;
var ballCorrectionSpeed : float = 5.0;

private var spawnPoints : GameObject[]; 
private var respawning : boolean;
private var spawnTime = 0.0;
private var meshRenderers :MeshRenderer[];
private var skinnedRenderers :SkinnedMeshRenderer[];

private var rollBall : boolean;
private var lastPosition : Vector3;
private var radius : float;
private var perimeter : float;
var ballTurnSpeed = 200;

private var pushingPlayer : GameObject;

function Start () {
	meshRenderers = GetComponentsInChildren.<MeshRenderer> ();
	skinnedRenderers = GetComponentsInChildren.<SkinnedMeshRenderer> ();
	
	spawnPoints = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus).GetSnowBallSpawns();
	Respawn();
	
	lastPosition = transform.position;
	radius = GetComponent(Renderer).bounds.size.x/2;
	perimeter =  2 * radius * Mathf.PI;
}

function Update () {
	if (pushingPlayer) {
		var playerMotor = pushingPlayer.GetComponent(CharacterMotorSF);
		if (playerMotor.IsMovingBackward() || playerMotor.IsJumping()) {
			pushingPlayer.SendMessage("ReleaseItem", null, SendMessageOptions.DontRequireReceiver);
			Release();
		}
		else if (rollBall) { //rotate ball while rolling
			var dir = transform.position - lastPosition;
			var rotAxis = Vector3.Cross(dir, Vector3.up);
			rotAxis.Normalize();
			var angle : float = -perimeter/36*dir.magnitude * ballTurnSpeed;
			transform.Rotate(rotAxis, angle, Space.World);
		}
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

//ATTENTION!! newwwwwww
function Move (offset : Vector3) {
	if (pushingPlayer) {
		var playerController = pushingPlayer.GetComponent(CharacterController);
		var playerTransform = pushingPlayer.GetComponent(Transform);
		//try to make sure the ball is infront of the player
		var minDistance = playerController.radius + gameObject.collider.bounds.size.x*0.6;
		var desiredPos : Vector3 = playerTransform.position + playerTransform.forward * minDistance;
		var correctionVector : Vector3 = transform.position - desiredPos;
		correctionVector.Normalize();
		correctionVector *= ballCorrectionSpeed;
		correctionVector *= Time.deltaTime;
		transform.Translate(offset -  correctionVector, Space.World);		
		Roll(true);
	}
}

function IsBallTooFarAway () : boolean {
	var tooFar = false;
	if (pushingPlayer) {
		var playerController = pushingPlayer.GetComponent(CharacterController);
		var playerTransform = pushingPlayer.GetComponent(Transform);
		var maxAllowedDist = Mathf.Max(maxBallDistance, playerController.radius + gameObject.collider.bounds.size.x);
		tooFar = (Vector3.Distance(transform.position, playerController.transform.position) > maxAllowedDist);
	}
	return tooFar;
}


function Release () {
	if (pushingPlayer) {
		Roll(false);
		transform.parent = null;
		pushingPlayer = null;
		collider.attachedRigidbody.useGravity = true;
	}
}

function PickItem(player:GameObject) {
	pushingPlayer = player;
	transform.parent = pushingPlayer.transform;
	//turn off gravity
	collider.attachedRigidbody.useGravity = false;
}
//---------------------------------------------------------

function Respawn () {
	if (pushingPlayer) { //tell the bot that his ball has reached the base
			pushingPlayer.SendMessage("BallReachedBase", null, SendMessageOptions.DontRequireReceiver);
	}
	
	Release ();
	
	respawning = true;
	spawnTime = Time.time;
	
	//hide for a while
	for (var rend : MeshRenderer in meshRenderers) {
		rend.enabled = false;
	}
	
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		rend.enabled = false;
	}
	
	if (spawnPoints && spawnPoints.Length > 0) {
		transform.position = spawnPoints[Random.Range(0,spawnPoints.Length-1)].transform.position;
		transform.position.y += 5;
	}
}

function Roll (rolling:boolean) {
	rollBall = rolling;
}