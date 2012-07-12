
private var statusDisplay :GameStatusDisplay;
private var players1 :Array;
private var players2 :Array;

private var show = false;
private var showProgress :float = 0;

function Awake () {
	statusDisplay = GetComponent(GameStatusDisplay);
}

function SetShow (s :boolean) {
	show = s;
	if (s) {
		players1 = new Array();
		players2 = new Array();
		for (var go :GameObject in GameObject.FindGameObjectsWithTag("Player")) {
			var ps :PlayerStatus = go.GetComponent(PlayerStatus);
			switch (ps.GetTeamNumber()) {
			case 1: players1.Add(ps); break;
			case 2: players2.Add(ps); break;
			}
		}
	}
}

function CompareScore (p1 :PlayerStatus, p2 :PlayerStatus) {
	if ((p1.killCount-p1.deathCount) - (p2.killCount-p2.deathCount) != 0) {
		return -((p1.killCount-p1.deathCount) - (p2.killCount-p2.deathCount));
	} else if (p1.killCount - p2.killCount != 0) {
		return -(p1.killCount - p2.killCount);
	} else {
		return -String.Compare(p1.playerName, p2.playerName);
	}
}

function ShadowedLabel (r :Rect, text :String, style :GUIStyle) {
	GUI.Label(Rect(r.x, r.y+2, r.width, r.height), text, statusDisplay.shadowStyle);
	GUI.Label(r, text, style);
}

function Update () {
	showProgress = Mathf.Clamp01(showProgress + (show?2:-2)*Time.deltaTime);
	if (Input.GetButtonDown("ShowPlayerList")) {
		SetShow(!show);
	}
	if (show) {
		players1.Sort(CompareScore);
		players2.Sort(CompareScore);
	}
}

function OnGUI () {
	if (showProgress > 0) {
		var y: int = 70;
		for (var p :PlayerStatus in players1) {
			var x: int = showProgress*Screen.width*.5-200;
			if (p.IsMainPlayer()) {
				ShadowedLabel(Rect(x-20, y, 20, 20), ">", statusDisplay.neutralStyle);
			}
			ShadowedLabel(Rect(x, y, 150, 20), p.playerName, statusDisplay.GetTeamStyle(p.GetTeam()));
			x += 150;
			ShadowedLabel(Rect(x, y, 100, 20), p.killCount.ToString() + " / " + p.deathCount.ToString()
												, statusDisplay.neutralStyle);
			y += 20;
		}
		y = 70;
		for (var p :PlayerStatus in players2) {
			x = Screen.width+30-showProgress*Screen.width*.5;
			if (p.IsMainPlayer()) {
				ShadowedLabel(Rect(x-20, y, 20, 20), ">", statusDisplay.neutralStyle);
			}
			ShadowedLabel(Rect(x, y, 150, 20), p.playerName, statusDisplay.GetTeamStyle(p.GetTeam()));
			x += 150;
			ShadowedLabel(Rect(x, y, 100, 20), p.killCount.ToString() + " / " + p.deathCount.ToString()
												, statusDisplay.neutralStyle);
			y += 20;
		}
	}
}