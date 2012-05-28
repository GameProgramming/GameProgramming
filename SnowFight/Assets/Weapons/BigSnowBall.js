#pragma strict

var respawnTimeout = 2.0;

private var spawnPoints : GameObject[]; 
private var respawning : boolean;
private var spawnTime = 0.0;
private var meshRenderers :MeshRenderer[];
private var skinnedRenderers :SkinnedMeshRenderer[];

function Start () {
	meshRenderers = GetComponentsInChildren.<MeshRenderer> ();
	skinnedRenderers = GetComponentsInChildren.<SkinnedMeshRenderer> ();
	
	spawnPoints = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus).GetSnowBallSpawns();
	Respawn();
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
}

function Respawn () {
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