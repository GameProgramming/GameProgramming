private var color;
private var mouseOver : boolean;

private var game :GameStatus;

function Start () {
	game = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus);
	mouseOver = false;
}

function Update () {
	if (!mouseOver) {
		var rend = GetComponent(MeshRenderer);
		rend.material.color = color;
	}

}

function SetColor(newColor : Color) {
	color = newColor;

	var light : Light = transform.FindChild("Spotlight").GetComponent("Light");
	light.color = newColor;

}

function OnMouseOver() {
	var teamNumber = transform.parent.transform.parent.GetComponent(Team).GetTeamNumber();
	var playerStatus = game.player.GetComponent(PlayerStatus);
	var playerTeamNumber = playerStatus.GetTeamNumber();
	if (playerStatus.IsDead() && teamNumber == playerTeamNumber) {
		mouseOver = true;
		var rend = GetComponent(MeshRenderer);
		rend.material.color = Color.white;
	}
}

function OnMouseExit() {
	mouseOver = false;
}


function GetColor () : Color {
	return color;
}