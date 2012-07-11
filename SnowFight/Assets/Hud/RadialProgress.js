
static var progress :float = 0.5;
var isGlobal :boolean = true;
var progr :float = progress;

function Awake () {
	progress = 1;
}

function Update () {
	if (isGlobal) {
		progr = progress;
		progress = 1;
	}
	renderer.material.mainTextureOffset = Vector2(progr, 0);
	progr = 1;
}

static function SetRadialProgress (reason :String, prog :float) {
	progress = prog;
}