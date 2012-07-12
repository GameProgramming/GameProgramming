
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
	if (progress >= 0) {
		renderer.material.mainTextureScale.x = 1;
		renderer.material.mainTextureOffset = Vector2(progress, 0);
	} else {
		renderer.material.mainTextureScale.x = 0.5;
		renderer.material.mainTextureOffset = Vector2(Time.time % 1, 0);
	}
	progress = 1;
	dominance = 0;
	drawIcon = icon;
	icon = null;
}

function OnGUI () {
	if (drawIcon) {
		GUI.DrawTexture(Rect(Screen.width*.47, Screen.height*.5-Screen.width*.03,
							Screen.width*.06, Screen.width*.06), drawIcon);
	}
}

static function SetRadialProgress (prog :float, dom :float, iconTex :Texture) {
	if (dom > dominance) {
		progress = prog;
		dominance = dom;
		icon = iconTex;	
	}
}