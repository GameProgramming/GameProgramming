var teamNumber = 0;
var tickets = 10;
var teamName = "Team";
var color : Color = Color.gray;

var playerSkin :Texture;

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