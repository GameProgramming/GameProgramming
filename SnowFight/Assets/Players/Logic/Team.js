var teamNumber = 0;
var tickets = 10;
var teamName = "Team";
private var color : Color;

var playerSkin :Texture;

function Start() {
	if (teamNumber == 0) {
		color = Color.gray;
	}
	if (teamNumber == 1) {
		color = Color.blue;
	}
	if (teamNumber == 2) {
		color = Color.red;
	}

}

function Update () {

}

function HasLost () {
	return tickets <= 0;
}

function GetSpawnPoints () :Transform[] {
	var spawns :Transform[] = [];
	
	for (var b :Transform in transform) {
		if (b.tag == "Base") {
			for (var t :Transform in b.transform) {
				if (t.tag == "PlayerSpawn") {
					spawns += [t];
				}
			}
		}
	}
	return spawns;
}

function GetBase () :Transform {
	for (var t :Transform in transform) {
		if (t.tag == "Base") {
			return t;
		}
	}
}

function LoseTickets (count :int) {
	tickets -= count;
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