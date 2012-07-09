#pragma strict
#pragma downcast

var skyBox : UnityEngine.Material;

@System.NonSerialized
var status :GameStatus;

var skin : GUISkin;
var fontMaterial :Material;

var distFromTop = 20;

var styleTeam1 : GUIStyle;
var styleTeam2 : GUIStyle;
var neutralStyle : GUIStyle;
var shadowStyle : GUIStyle;

var teamIndicator :Texture;

private var displayGameOver = false;

private var infoScaling :float = 1;

function Awake () {
	status = GetComponent(GameStatus);
	
	if (skyBox && !RenderSettings.skybox) {
		RenderSettings.skybox = skyBox;
	}
}

function Start ()  {
	skin.font.material = fontMaterial;
	styleTeam1.font.material = fontMaterial;
	styleTeam2.font.material = fontMaterial;
	neutralStyle.font.material = fontMaterial;
	
	//Set the colors.
	for (var t : Team in status.teams) {
		if (t.GetTeamNumber() == 1) {
			styleTeam1.normal.textColor = t.GetColor();
		}
		if (t.GetTeamNumber() == 2) {
			styleTeam2.normal.textColor = t.GetColor();
		}
	}
	neutralStyle.normal.textColor = Color.white;
	shadowStyle = new GUIStyle(neutralStyle);
	shadowStyle.normal.textColor = Color.black;
}

static function ScaleRect ( factor :float, r :Rect) :Rect{
	return Rect(factor*r.x, factor*r.y, factor*r.width, factor*r.height);
}

function SRect (x :float, y :float, w :float, h:float) :Rect{
	return ScaleRect(infoScaling, Rect(x,y,w,h));
}

function OnGUI() {
	if (!status.player) return;
	
	if (skin)
		GUI.skin = skin;
	else
		Debug.Log("StartMenuGUI: GUI Skin object missing!");

	var teams :Team[] = [status.GetTeamById(1), status.neutralTeam, status.GetTeamById(2)];

	var posX :float = 5;
	
	if (status.playerS.IsDead()) {
		infoScaling = Mathf.Clamp(infoScaling + 2*Time.deltaTime,1,2);
	} else {
		infoScaling = Mathf.Clamp(infoScaling - 2*Time.deltaTime,1,2);
	}
	
	for (var t :Team in teams) {
		var posY :float = 5;
		if (t.teamNumber == 0) {
			posY += 15+30;
			GUI.Label (SRect(posX, posY, 35, 25), "  :", shadowStyle);
			GUI.Label (SRect(posX-1, posY-2, 35, 25), "  :", GetTeamStyle(t));
		} else {
			if (t == status.playerS.GetTeam()) {
				GUI.Label(SRect(posX, posY, 20,20), teamIndicator);
			} else if (status.playerS.IsDead()) {
				if (GUI.Button(SRect(posX, posY, 20,20), "o")) {
					t.AddPlayer (status.player); 
				}
			}
			posY += 15;
			GUI.Label(SRect(posX-10, posY, 35,35), t.teamIcon);
			posY += 30;
			GUI.Label (SRect(posX, posY, 35, 25), t.tickets.ToString(), shadowStyle);
			GUI.Label (SRect(posX-1, posY-2, 35, 25), t.tickets.ToString(), GetTeamStyle(t));
		}
		posY += 15;
		var offX :float = 0;
		for (var b : Transform in t.GetAllBases()) {
			GUI.Label (SRect (posX+offX, posY, 20, 20), t.teamBaseIcon);
			offX += 5;
			posY += 5;
		}

		posX += 20;
	}
	
	//Show the win message.
	if (displayGameOver) {
		var winText : String;
		winText = "Team "+ status.winner.ToString() + " wins!";
		GUI.color = new Color(0.4, 0.4, 0.9, 0.8);
		GUI.Box(Rect(0, 0, Screen.width, Screen.height), "");
		if (status.winner.GetTeamNumber() == 1) {
			GUI.Label (Rect (Screen.width/2 - 105, Screen.height/2-15, 210, 30), winText, styleTeam1);
		}
		if (status.winner.GetTeamNumber() == 2) {
			GUI.Label (Rect (Screen.width/2 - 105, Screen.height/2-15, 210, 30), winText, styleTeam2);
		}		
	}
}

function GetTeamStyle (t :Team) :GUIStyle {
	if (t) {
		if (t.teamNumber == 1) return styleTeam1;
		if (t.teamNumber == 2) return styleTeam2;
	}
	return neutralStyle;
}

function GameOver () {
	yield WaitForSeconds(0.2);
	var lastFrag :Frag = GetComponent(FragMonitor).GetLastFrag();
	if (lastFrag && lastFrag.victim) {
		var overview :MapOverview = GameObject.FindGameObjectWithTag("OverviewCam")
				.GetComponent(MapOverview);
		overview.SetPlayerCam(lastFrag.victim.transform.Find("CameraSetup/CameraDeath"));
	}
	yield WaitForSeconds(0.4);
	displayGameOver = true;
	while (true) {
		if (status.gameOver && Input.GetKeyDown("space")) {
			status.SendMessage("Restart");
		}
		yield;
	}
}