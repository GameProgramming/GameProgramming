private var color :Color;
private var mouseOver : boolean;

private var game :GameStatus;

function Start () {
	game = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus);
	mouseOver = false;
}

function SetColor(newColor : Color) {
	color = newColor;

	var light : Light = transform.FindChild("Spotlight").GetComponent("Light");
	light.color = newColor;
	renderer.material.color = color;

}

function GetColor () : Color {
	return color;
}