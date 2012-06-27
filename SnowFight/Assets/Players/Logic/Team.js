var teamNumber = 0;
var tickets = 10;
var teamName = "Team";
var color : Color = Color.gray;

var balancingFactor :float = 1.0;

var playerSkin :Texture;

private var size : int = 0;

function Awake () {
	size = 0;
}

function Start() {
}

function Update () {

}

function HasLost () {
	return tickets <= 0;
}

function GetSpawnPoints () :Transform[] {
	var spawns :Transform[] = [];
	
	for (var b : Transform in transform) {
		if (b.tag == "Base") {
			for (var t : Transform in b.transform) {
				if (t.tag == "PlayerSpawn") {
					spawns += [t];
				}
			}
		}
	}
	return spawns;
}

function GetSpawnPoint(spawnPointID : int) : Vector3 {
	var position : Vector3; 
	for (var b : Transform in transform) {
		if (b.tag == "Base") {
			var base = b.GetComponent(TeamBase);
			if (base.GetID() == spawnPointID) {
				position = base.GetSpawnPoint();
				break;
			}
		}	
	}
	return position;
}

function GetBase () : Transform {
	var base : Transform = null;
	for (var t :Transform in transform) {
		if (t.tag == "Base") {
			base = t;
		}
	}
	return base;
}

function GetAllBases () : Transform[] {
	var bases : Transform[] = [];
	for (var b : Transform in transform) {
		if (b.CompareTag("Base")) {
			bases += [b];
		}
	}
	return bases;
}

function GetAllPlayers () : Transform[] {
	var players : Transform[] = [];
	for (var p : Transform in transform) {
		if (p.CompareTag("Player")) {
			players += [p];
		}
	}
	return players;
}

function LoseTickets (count :int) {
	if (Network.isServer) {
		networkView.RPC("NetTicketChange", RPCMode.All, tickets - count);
	}
}

@RPC
function NetTicketChange (t :int) {
	tickets = t;
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
	
	if (GetBase()) {
		var base : TeamBase = GetBase().GetComponent(TeamBase);
		pStatus.spawnBaseID = base.GetID();
	} // otherwise the team apparently has no bases.
	
	size++;
}

function GetSize () : int {
	return size;
}

function GetBalancedSize () : float {
	return size / balancingFactor;
}