
static var progress :float = 0.5;

function Awake () {
	progress = 1;
}

function Update () {
	renderer.material.mainTextureOffset = Vector2(progress, 0);
	progress = 1;
}

static function SetRadialProgress (reason :String, prog :float) {
	progress = prog;
}