private var hit : boolean = false;
private var hitTime : float = 0.0;	
private var inUFO : boolean = false;

private var ammoTime : float = 0.0;	

private var blinkingTime : float = 0.0;
private var hasRocketLauncher : boolean = false;
private var rocketLauncher :RocketLauncher;

var neutralStyle : GUIStyle;
var snowballTexture : Texture2D;
var rocketTexture : Texture2D;
var noAmmoTexture : Texture2D;
var noAmmoTextureBlink : Texture2D;

var healthIcon :Texture;
var healthIconGrey :Texture;
var ufoIcon :Texture;
var energyIcon :Texture;

var quickInfo :String = "";
var quickInfoProgress :float = 0;
var quickInfoStyle :GUIStyle;
private var quickInfoShadowStyle :GUIStyle;

var player :PlayerStatus;

function Awake () {
	player = gameObject.GetComponent(PlayerStatus);
	quickInfoShadowStyle = new GUIStyle(quickInfoStyle);
	quickInfoShadowStyle.normal.textColor = Color.black;
}

function SetQuickInfo (info :String) {
	quickInfo = info;
	quickInfoProgress = 1;
}

function OnFrag (f :Frag) {
	SetQuickInfo("You killed "+f.victim.playerName+".");
}

function OnDeath () {
	if (player.GetLastAttack() && player.GetLastAttack().attacker) {
		var attacker = player.GetLastAttack().attacker.GetComponent(PlayerStatus);
		if (attacker == player) {
			SetQuickInfo("You commited suicide.");
		} else {
			SetQuickInfo("You were killed by "+attacker.playerName);
		}
	} else {
		SetQuickInfo("You died.");
	}
}

function OnGUI() {
	if (!player.IsMainPlayer()) return; // should not happen, actually.
	if (quickInfoProgress > 0) {
		quickInfoProgress -= .1 * Time.deltaTime;
		var xi :float;
		if (quickInfoProgress > 0.8) {
			xi = Screen.width - (Screen.width - 20) * 5*(1-quickInfoProgress);
		} else if (quickInfoProgress > 0.2) {
			xi = 20;
		} else {
			xi = Screen.width - (Screen.width - 20) * 5*(.4-quickInfoProgress);
		}
		GUI.Label(Rect(xi+1,Screen.height-98,300,50), quickInfo,quickInfoShadowStyle);
		GUI.Label(Rect(xi,Screen.height-100,300,50), quickInfo,quickInfoStyle);
	}
	if (!player.IsDead()) {
		var hpPercent : float = parseFloat(player.GetHp()) / parseFloat(player.GetFullHp());
		var x :float = 10;
		var y :float = Screen.height - 50;
		if (hit) {
			hitTime += Time.deltaTime;
			if (hitTime >= 3.0) {
				hitTime = 0.0;
				hit = false;
			}
		}
		
		ammoTime = Mathf.Clamp(ammoTime-2*Time.deltaTime, 0,3);
		
		var playerInfoShift :float = 0;
		if (inUFO || hasRocketLauncher) playerInfoShift = 10;
		GUI.Label (Rect (x, y-15+2*playerInfoShift, 60-2*playerInfoShift, 60-2*playerInfoShift), player.team.teamIcon);
		GUI.Label (Rect (x+20, y+2*playerInfoShift, (60-2*playerInfoShift), (60-2*playerInfoShift)), healthIconGrey);
		var iconSize :float = hpPercent*(60-2*playerInfoShift);
		var iconOff :float = ((60-2*playerInfoShift)-iconSize)*.5;
		GUI.Label (Rect (x+20+iconOff, y+2*playerInfoShift+iconOff, iconSize, iconSize), healthIcon);
//		DrawBar ( Rect(x - 200+3*playerInfoShift, y-5*playerInfoShift, 180-3*playerInfoShift, 20), hpPercent,
//					Color(0.8, 0.0, 0.0,0.5), 0);
		
		var ammoMaxNumber : int = player.GetMaximumSnowballs();
		var ammoNumber : int = player.GetCurrentSnowballs();
		var h :float = 45-1.5*playerInfoShift;
		var w :float = 2*3*(30-playerInfoShift) / ammoMaxNumber;
		var currX :float = x+50+2*playerInfoShift+ 2*3*(30-playerInfoShift);
		for (var i :int = 0; i < ammoMaxNumber; i++) {
			var tex :Texture =
				i >= (ammoMaxNumber-ammoNumber) ? snowballTexture
							   				    : (ammoTime%1 > 0.5 ? noAmmoTextureBlink : noAmmoTexture);
			GUI.Label( Rect (currX, y+2*playerInfoShift, h, h), tex);
			currX -= w;
		}
		
		if (hasRocketLauncher) {
			ammoMaxNumber = rocketLauncher.initialAmmo;
			ammoNumber= rocketLauncher.GetAmmo();
			h = 60;
			w = 120 / ammoMaxNumber;
			currX = x+20+120;
			for (i = 0; i < ammoMaxNumber; i++) {
				tex =
					i >= (ammoMaxNumber-ammoNumber) ? rocketTexture
								   				    : (ammoTime%1 > 0.5 ? noAmmoTextureBlink : noAmmoTexture);
				GUI.Label( Rect (currX, y-40, h, h), tex);
				currX -= w;
			}
		}
		
		if (inUFO) {
			var ray : FreezingRay = transform.GetComponentInChildren(FreezingRay);
			GUI.Label( Rect (x+35, y-10, 30, 30), energyIcon);
			if(ray)
				DrawBar ( Rect(x+50, y+2, 180-3*playerInfoShift, 10), ray.energy / ray.energyMax,
					Color(0.6, 0.8, 0.0,0.6), 0);
		}
	}
}

function DrawBar ( r :Rect, ratio :float, color :Color, off :float) {
	var tex : Texture2D = new Texture2D(1, 1);
	var style = new GUIStyle();
	tex.SetPixel(0, 0, color);
	tex.Apply();
	style.normal.background = tex;
	
	GUI.Box (r, "");
	GUI.Box (Rect (r.x+1, r.y+1+off, ratio * (r.width - 2 - off*2), r.height-2-2*off), "", style);
}

function OnSetBot () {
	enabled = false;
}
function OnSetMainPlayer () {
	enabled = true;
}
function OnSetRemote () {
	enabled = false;
}

function SetHit () {
	hitTime = 0.0;
	hit = true;
}

function SetInUFO (newInUFO : boolean) {
	inUFO = newInUFO;
}

function GetInUFO () : boolean {
	return inUFO;
}

function OnCantThrow () {
	if (ammoTime < 0.5) ammoTime = 3;
}

function OnItemChange(itemManager :ItemManager) {
	var item : GameObject = itemManager.GetItem();
	if (item != null) {
		hasRocketLauncher = item && item.CompareTag("Weapon");
		inUFO = item && item.CompareTag("Ufo");
		if (hasRocketLauncher) {
			rocketLauncher = item.GetComponent(RocketLauncher);
		}
	} else {
		inUFO = false;
		hasRocketLauncher = false;
	}
}