var teamNumber = 0;
var tickets = 10;
var teamName = "Team";
var color : Color = Color.gray;

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
	
	var base : TeamBase = GetBase().GetComponent(TeamBase);
	pStatus.spawnBaseID = base.GetID();
	
	size++;
}

function GetSize () {
	return size;
}