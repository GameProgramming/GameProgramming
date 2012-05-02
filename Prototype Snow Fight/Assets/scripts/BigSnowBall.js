#pragma strict

var respawnTimeout = 2.0;

private var spawnPoints : Transform[]; 
private var respawning : boolean;
private var spawnTime = 0.0;
private var meshRenderers;
private var skinnedRenderers;

function Start () {
	meshRenderers = GetComponentsInChildren (MeshRenderer);
	skinnedRenderers = GetComponentsInChildren (SkinnedMeshRenderer);
	
	spawnPoints = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus).GetSnowBallSpawns();
	Respawn();
}

function Update () {
	//upon respawn make visible after hide time and then stun for a bit
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
	
	//hide player for a while
	for (var rend : MeshRenderer in meshRenderers) {
		rend.enabled = false;
	}
	
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		rend.enabled = false;
	}
	
	if (spawnPoints && spawnPoints.Length > 0) {
		transform.position = spawnPoints[Random.Range(0,spawnPoints.Length-1)].position;
		transform.position.y += 5;
	}
}