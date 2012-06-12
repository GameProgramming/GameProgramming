function Start () {

}

function Update () {

}

function OnMouseDown() {
	var playerStatus = GameObject.FindGameObjectWithTag("Player").GetComponent(PlayerStatus);
	if (playerStatus.IsDead()) {
		var teamBase = transform.parent.GetComponent(TeamBase);
		var spawnBaseID = teamBase.GetID();
		playerStatus.SetSpawnBaseID(spawnBaseID);
	}
}