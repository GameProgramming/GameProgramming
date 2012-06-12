function Start () {

}

function Update () {

}

function OnMouseDown() {

	var playerStatus = GameObject.FindGameObjectWithTag("Player").GetComponent(PlayerStatus);
	if (playerStatus.IsDead()) {
		var teamOfBase = transform.parent.transform.parent.GetComponent(Team);
		var baseTeamNumber = teamOfBase.GetTeamNumber();
	
		var player : GameObject = GameObject.FindGameObjectWithTag("Player");
		var teamOfPlayer = player.transform.parent.transform.GetComponent(Team);
		
		var playerTeamNumber = teamOfPlayer.GetTeamNumber();
		if (baseTeamNumber == playerTeamNumber) {
			var teamBase = transform.parent.GetComponent(TeamBase);
			var spawnBaseID = teamBase.GetID();
			playerStatus.SetSpawnBaseID(spawnBaseID);
		}

	}
}