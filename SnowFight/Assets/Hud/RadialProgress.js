
static var progress :float = 0.5;
static var dominance :float = 0;
static var icon :Texture;

private var drawIcon :Texture;

function Awake () {
	progress = 1;
	dominance = 0;
	icon = null;
	drawIcon = null;
}

function LateUpdate () {
	renderer.material.mainTextureOffset = Vector2(progress, 0);
	progress = 1;
	dominance = 0;
	drawIcon = icon;
	icon = null;
}

function OnGUI () {
	if (drawIcon) {
		
	}
}

static function SetRadialProgress (prog :float, dom :float, iconTex :Texture) {
	if (dom > dominance) {
		progress = prog;
		dominance = dom;
		icon = iconTex;	
	}
}