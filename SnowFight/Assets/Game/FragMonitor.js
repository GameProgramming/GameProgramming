
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
    for (var off :float = 0; off <= 1; off++) {
	    GUILayout.BeginArea (Rect (Screen.width-200,1-off,200,201-off));
	    for (var i :int = Mathf.Max(0, fragLog.length-5); i < fragLog.length; i++) {
	    	if (i < fragLog.length - 5) break;
	    	var f :Frag = fragLog[i];
	    	if (f.time < Time.time - 10) continue;
		    GUILayout.BeginHorizontal();
		    if (f.attacker) {
		    	GUILayout.Label(f.attacker.playerName, off==1 ? statusDisplay.GetTeamStyle(f.attacker.GetTeam()) : statusDisplay.shadowStyle);
		    	GUILayout.Label(" killed ", off==1 ? statusDisplay.neutralStyle : statusDisplay.shadowStyle);
		    }
		    GUILayout.Label(f.victim.playerName, off==1 ? statusDisplay.GetTeamStyle(f.victim.GetTeam()) : statusDisplay.shadowStyle);
		    if (!f.attacker) {
		    	GUILayout.Label(" died.", off==1 ? statusDisplay.neutralStyle : statusDisplay.shadowStyle);
		    }
		    GUILayout.EndHorizontal();
	    }
	    GUILayout.EndArea ();
    }
}