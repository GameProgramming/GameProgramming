
class Frag {
	var time :float;
	var victim :PlayerStatus;
	var attacker :PlayerStatus;
}

private var fragLog :Array = new Array();

private var statusDisplay :GameStatusDisplay;

function Start () {
	statusDisplay = GetComponent(GameStatusDisplay);
}

function OnPlayerDeath (pl :PlayerStatus) {
	var f :Frag = new Frag();
	f.victim = pl;
	if (pl.GetLastAttack() && pl.GetLastAttack().attacker) {
		f.attacker = pl.GetLastAttack().attacker.GetComponent(PlayerStatus);
	}
	f.time = Time.time;
	fragLog.Add(f);
}

function OnGUI () {
    GUILayout.BeginArea (Rect (Screen.width-200,0,200,200));
    for (var i :int = Mathf.Max(0, fragLog.length-5); i < fragLog.length; i++) {
    	if (i < fragLog.length - 5) break;
    	var f :Frag = fragLog[i];
    	if (f.time < Time.time - 10) continue;
	    GUILayout.BeginHorizontal();
	    if (f.attacker) {
	    	GUILayout.Label(f.attacker.playerName, statusDisplay.GetTeamStyle(f.attacker.GetTeam()));
	    	GUILayout.Label(" killed ", statusDisplay.neutralStyle);
	    }
	    GUILayout.Label(f.victim.playerName, statusDisplay.GetTeamStyle(f.victim.GetTeam()));
	    if (f.attacker) {
	    	GUILayout.Label(".", statusDisplay.neutralStyle);
	    } else {
	    	GUILayout.Label(" died.", statusDisplay.neutralStyle);
	    }
	    GUILayout.EndHorizontal();
    }
    GUILayout.EndArea ();
}