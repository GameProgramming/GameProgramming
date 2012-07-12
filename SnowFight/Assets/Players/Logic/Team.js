var teamNumber = 0;
var tickets = 10;
var teamName = "Team";
var color : Color = Color.gray;

var balancingFactor :float = 1.0;

var playerSkin :Texture;
var teamIcon :Texture;
var teamBaseIcon :Texture;

private var bases :Array = new Array();

private var size : int = 0;
private var teamPlayers:Array = new Array();
//private var ticketReduceTime = 0.5;
//private var currentTicketReduceTime = 0.0;

function Awake () {
	size = 0;
	for (var b : Transform in transform) {
		if (b.CompareTag("Base")) {
			bases.Remove(b.gameObject);
			bases.Add(b.gameObject);
		}
	}
	UpdatePlayers ();
}

function Start() {
}

function FixedUpdate () {
	if (GetAllBases().Length == 0) {
		var allDead :boolean = true;
		for (var player : Transform in GetAllPlayers()) {
			playerStatus = player.GetComponent(PlayerStatus);
			if (!playerStatus.IsDead()) {
				allDead = false;
				break;
			}
		}
		if (allDead) {
			LoseTickets(1);
		}
	}
}

function HasLost () {
	return tickets <= 0;
}

function GetSpawnPoints () :Transform[] {
	var spawns :Transform[] = [];
	
	for (var b : GameObject in bases) {
		for (var t : Transform in b.transform) {
			if (t.tag == "PlayerSpawn") {
				spawns += [t];
			}
		}
	}
	return spawns;
}

function GetSpawnPoint(spawnPointID : int) : Vector3 {
	var position : Vector3; 
	for (var b : GameObject in bases) {
		var base = b.GetComponent(TeamBase);
		if (base.GetID() == spawnPointID) {
			position = base.GetSpawnPoint();
			break;
		}
	}
	return position;
}

function GetBase () : Transform {
	if (bases.length > 0)
		return bases[0];
	else
		return null;
}

function GetAllBases () : GameObject[] {
	return bases.ToBuiltin(GameObject);
}

function GetAllPlayers () : Transform[] {
	var players : Transform[] = [];
	for (var p : GameObject in teamPlayers) {
//		if (p.CompareTag("Player")) {
			players += [p.transform];
//		}
	}
	return players;
}

function UpdatePlayers (){
	teamPlayers.Clear();
	for (var p : Transform in transform) {
		if (p.CompareTag("Player")) {
			teamPlayers.Add(p.gameObject);
		}
	}
}

function LoseTickets (count :int) {
	if (networkView.isMine) {
		tickets = Mathf.Clamp(tickets - count,0,999999);
	}
}

function OnSerializeNetworkView(stream :BitStream, info :NetworkMessageInfo) {
    stream.Serialize(tickets);
}

function Friendly (otherTeam :Team) :boolean {
	return teamNumber == otherTeam.teamNumber;
}

function ToString () :String {
	return teamName;
}

function GetTeamNumber () : int {
	return teamNumber;
}

function GetColor () : Color {
	return color;
}

function AddPlayer (p :GameObject) {
	var pStatus : PlayerStatus = p.GetComponent(PlayerStatus);
	
	pStatus.JoinTeam(this);
	
//	
//	if (GetBase()) {
//		var base : TeamBase = GetBase().GetComponent(TeamBase);
//		pStatus.spawnBaseID = base.GetID();
//	} // otherwise the team apparently has no bases.
	teamPlayers.Add(p.gameObject);
	size++;
}

function OnPlayerLeft (p :PlayerStatus) {
	teamPlayers.Remove(p.gameObject);
	size--;
}

function GetSize () : int {
	return size;
}

function GetBalancedSize () : float {
	return size / balancingFactor;
}

function OnBaseSwitchesTeam (b :TeamBase) {
	bases.Remove(b.gameObject);
	if (b.team == this) {
		bases.Add(b.gameObject);
	}
}

@script RequireComponent (NetworkView)