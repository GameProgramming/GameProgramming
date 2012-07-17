private var game :GameStatus;
private var arrow :Arrow;
private var mouseOver :boolean;
private var teamBase :TeamBase;

function Awake () {
	game = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus);
	arrow = transform.Find("Arrow").GetComponent(Arrow);
	teamBase = transform.parent.GetComponent(TeamBase);
}

function Update () {
	if (game.playerS && game.playerS.IsDead()) {
		if (game.playerS.spawnBaseID == teamBase.GetID()) {
			arrow.SetArrowMode(ArrowMode.DownOn);
		} else if (mouseOver) {
			arrow.SetArrowMode(ArrowMode.Jumping);
		} else {
			if (game.playerS.GetTeamNumber() == teamBase.team.GetTeamNumber()) {
				if (game.playerS.spawnBaseID == -1) {
					arrow.SetArrowMode(ArrowMode.Hinting);
				} else {
					arrow.SetArrowMode(ArrowMode.Idle);
				}
			} else {
				arrow.SetArrowMode(ArrowMode.Disabled);
			}
		}
	} else {
		arrow.SetArrowMode(ArrowMode.Disabled);
	}
}

//TODO: Was ist das hier fuer ein Script? Wird das noch verwendet? --- Ben, 24.6.

function OnMouseDown() {
	if (!game.playerS) return;
	var teamNumber = teamBase.team.GetTeamNumber();
	var playerTeamNumber = game.playerS.GetTeamNumber();
	if (game.playerS.IsDead() && teamNumber == playerTeamNumber) {
//		var teamOfBase = transform.parent.transform.parent.GetComponent(Team);
//		var baseTeamNumber = teamOfBase.GetTeamNumber();
//	
//		var player : GameObject = GameObject.FindGameObjectWithTag("Player");
//		var teamOfPlayer = player.transform.parent.transform.GetComponent(Team);
//		
//		var playerTeamNumber = teamOfPlayer.GetTeamNumber();
//		if (baseTeamNumber == playerTeamNumber) {
			var spawnBaseID = teamBase.GetID();
			game.playerS.SetSpawnBaseID(spawnBaseID);
//		}
//		var showSpawn = GameObject.FindGameObjectWithTag("Game").GetComponent(ShowRespawn);
//		showSpawn.ActivateRespawn();
	}
	
}

function OnMouseOver() {
	if (!game.playerS || !teamBase.team) return;
	var teamNumber = teamBase.team.GetTeamNumber();
	var playerTeamNumber = game.playerS.GetTeamNumber();
	if (game.playerS.IsDead() && teamNumber == playerTeamNumber) {
		mouseOver = true;
	}
}

function OnMouseExit() {
	mouseOver = false;
}
