private var game :GameStatus;

function Start () {
	game = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus);
}

function Update () {

}

//TODO: Was ist das hier fuer ein Script? Wird das noch verwendet? --- Ben, 24.6.

function OnMouseDown() {
	var teamNumber = transform.parent.transform.parent.GetComponent(Team).GetTeamNumber();
	var playerStatus = game.player.GetComponent(PlayerStatus);
	var playerTeamNumber = playerStatus.GetTeamNumber();
	if (playerStatus.IsDead() && teamNumber == playerTeamNumber) {
//		var teamOfBase = transform.parent.transform.parent.GetComponent(Team);
//		var baseTeamNumber = teamOfBase.GetTeamNumber();
//	
//		var player : GameObject = GameObject.FindGameObjectWithTag("Player");
//		var teamOfPlayer = player.transform.parent.transform.GetComponent(Team);
//		
//		var playerTeamNumber = teamOfPlayer.GetTeamNumber();
//		if (baseTeamNumber == playerTeamNumber) {
			var teamBase = transform.parent.GetComponent(TeamBase);
			var spawnBaseID = teamBase.GetID();
			playerStatus.SetSpawnBaseID(spawnBaseID);
//		}
		var showSpawn = GameObject.FindGameObjectWithTag("Game").GetComponent(ShowRespawn);
		showSpawn.ActivateRespawn();
	}
	
}