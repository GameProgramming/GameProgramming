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
	
	var playerStatus = game.player.GetComponent(PlayerStatus);
	if (playerStatus.IsDead()) {
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