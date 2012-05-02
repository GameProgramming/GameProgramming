#pragma strict

private var spawnPoints : Transform[]; 
private var respawning : boolean;

function Start () {
	//spawnPoints = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus).GetSnowBallSpawns();
}

function Update () {

}

function Respawn () {
	respawning = true;
	//hide player for a while
	var meshRenderers = GetComponentsInChildren (MeshRenderer);
	for (var rend : MeshRenderer in meshRenderers) {
		rend.enabled = false;
	}
	
	var skinnedRenderers = GetComponentsInChildren (SkinnedMeshRenderer);
	for (var rend : SkinnedMeshRenderer in skinnedRenderers) {
		rend.enabled = false;
	}
	
	if (spawnPoints && spawnPoints.Length > 0) {
		transform.position = spawnPoints[Random.Range(0,spawnPoints.Length-1)].position;
		transform.position.y += 5;
	}
}