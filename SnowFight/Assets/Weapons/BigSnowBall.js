#pragma strict

var respawnTimeout = 2.0;

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
	
	if (rollBall) {
		var dir = transform.position - lastPosition;
		var rotAxis = Vector3.Cross(dir, Vector3.up);
		rotAxis.Normalize();
		var angle : float = -perimeter/36*dir.magnitude * ballTurnSpeed;
		transform.Rotate(rotAxis, angle, Space.World);
	}
}

function LateUpdate () {
	lastPosition = transform.position;
}

function Respawn () {
	if (transform.parent && transform.parent.GetComponent(PushBall)) { //tell the bot that his ball has reached the base
			transform.parent.GetComponent(PushBall).ballReachedBase = true;
	}
	
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