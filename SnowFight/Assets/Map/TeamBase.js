private var enterTime :float = 0;

var baseID : int;

@System.NonSerialized
var team : Team;
@System.NonSerialized
var neutralTeam : Team;


@System.NonSerialized
private var game :GameStatus;

var points : int = 3;

var takeOverRadius :int = 10;
var takeOverTime :float = 5.0;
var takeOverProgress :float = 0.0;
@System.NonSerialized
var takeOverCurrTeam :Team = null;

private var currentTeamTakingOver : Team;
private var progress : float;

private var mainPlayerStatus : PlayerStatus;

var specialWeapons : GameObject[];
var specialWeaponIcons : Texture2D[];

var spawnWeaponPipelineLength :int = 4;
var spawnWeaponPipeline : Array;


function GetSpawnPoint() : Vector3 {
	for (var t : Transform in transform) {
		if (t.tag == "PlayerSpawn") {
			var spawnScript = t.GetComponent(SpawnScript);
			if (!spawnScript.IsOccupied() && !spawnScript.IsPlayerInSpawn()) {
				spawnScript.SetOccupied(true);
				return t.position;
			}
		}
	}
	return Vector3.zero;
}

function Awake () {
	game = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus);
	spawnWeaponPipeline = new Array();
	FillPipeline();
}

function Start () {
	team = transform.parent.gameObject.GetComponent(Team);
	if (team == null) {
		Debug.LogError("Could not determine TeamBase team. "+
			"(TeamBase object has to be child of Team object!)");
	}
	neutralTeam = GameObject.FindGameObjectWithTag("TeamNeutral").GetComponent(Team);
	SetTeam(team);
	currentTeamTakingOver = null;
	progress = 0.0;
}

function FillPipeline() {
	if (Network.isServer) {
		while (spawnWeaponPipeline.length < spawnWeaponPipelineLength) {
			spawnWeaponPipeline.Add(Random.Range(0,specialWeapons.Length));
		}
	}
}

function Update () {
	if (Network.isServer) {
		var takeOverDist = takeOverRadius * takeOverRadius;
		
		var gos : GameObject[];
	    gos = GameObject.FindGameObjectsWithTag("Player");  
		
		var teamTakingOver :Team = null;
		
		for (var go : GameObject in gos)  {
			if ((go.transform.position - transform.position).sqrMagnitude < takeOverDist) {
		    	var status : PlayerStatus = go.GetComponent(PlayerStatus);
		    	if (status.IsMainPlayer()) {
		    		mainPlayerStatus = status;
		    	}
	    		if (!status.IsDead() && status.team != teamTakingOver) {
	    			if (teamTakingOver == null) {
	    				teamTakingOver = status.team;
	    			} else {
	    				teamTakingOver = neutralTeam;
	    			}
	    		}
	    	}
		}
		
	//	Debug.Log("taking over "+teamTakingOver);
		if (teamTakingOver != team && team != neutralTeam && teamTakingOver != null) {
			teamTakingOver = neutralTeam;
		}
		
		if (teamTakingOver == null || teamTakingOver != takeOverCurrTeam) {
			//Debug.Log("takeOverReset");
			takeOverProgress = 0;
			takeOverCurrTeam = null;
		} else if (teamTakingOver != team) {
			takeOverProgress += Time.deltaTime / takeOverTime;
	//		Debug.Log("taking over "+takeOverProgress);
			if (takeOverProgress >= 1) {
	//			Debug.Log("takeOverFinished");
				SetTeam(teamTakingOver);
			}
		} 
		takeOverCurrTeam = teamTakingOver;
	}
	
}

function SetTeam (t :Team) {
	transform.parent = t.transform;
	team = t;
	transform.GetComponentInChildren(TeamFlagColor).SetColor(team.color);
}

function OnTriggerStay(other : Collider) {
	if (Network.isServer) {
		if (other.CompareTag("BigSnowball") && other.GetComponent(BigSnowBall).HasReachedFullSize()) {
			enterTime += Time.deltaTime;
			if (enterTime > 2.0 && other.GetComponent(BigSnowBall)) {
				other.transform.parent = null;
				var weapon = specialWeapons[spawnWeaponPipeline.Shift()];
				FillPipeline();
				Network.Instantiate(weapon, other.transform.position, Quaternion.identity,0);
				other.gameObject.SendMessage("OnReachBase", SendMessageOptions.DontRequireReceiver);
				enterTime = 0.0;
			}
		}
	}
}

function SetID (newId : int) {
	baseID = newId;
}

function GetID () : int {
	return baseID;
}

function OnSerializeNetworkView(stream :BitStream, info :NetworkMessageInfo) {
    var teamNumber :int = team.GetTeamNumber();
    stream.Serialize(teamNumber);
    var newSWP :Array = new Array();
    for (var i = 0; i < spawnWeaponPipelineLength; i++) {
    	var itemId :int = 0;
    	if (spawnWeaponPipeline.length > i) {
    		itemId = spawnWeaponPipeline[i];
    	}
    	stream.Serialize(itemId);
    	newSWP.Add(itemId);
    }
    spawnWeaponPipeline = newSWP;
    if (!stream.isWriting) {
        if (team == null || team.GetTeamNumber() != teamNumber) {
        	var t :Team = game.GetTeamById(teamNumber);
        	if (!t) t = neutralTeam;
        	SetTeam(t);
        }
    }
}

function OnGUI () {
	var pos :Vector3 = Camera.main.WorldToScreenPoint(transform.position);
	if (pos.z > 1 && pos.z < 70 && pos.x > -10 && pos.y > -10
				  			    && pos.x < Screen.width-10 && pos.y < Screen.height-10) {
		GUILayout.BeginArea(Rect(pos.x, Screen.height-pos.y, 20,150));
		GUILayout.BeginVertical();
		for (var itemId :int in spawnWeaponPipeline) {
			if (itemId < specialWeaponIcons.Length)
				GUILayout.Label(specialWeaponIcons[itemId],GUILayout.Height(25));
		}
		GUILayout.EndVertical();
		GUILayout.EndArea();
	}
	if (mainPlayerStatus != null) {
		if (takeOverProgress > 0.0 && !mainPlayerStatus.IsDead()) {
			var texture : Texture2D = new Texture2D(1, 1);
			var style : GUIStyle = new GUIStyle();
			var color : Color;
			var takeOverPercent : float = takeOverProgress;
			color = new Color(1-takeOverPercent, takeOverPercent, 0, 0.5);
			texture.SetPixel(0, 0, color);
			texture.Apply();
			style.normal.background = texture;
		
			var boxWidth : float= (Screen.width/8 + 10);
			var boxHeight = 19;
			var finalBoxWidth = takeOverPercent * boxWidth;
			
			GUI.Box (Rect (Screen.width / 2 - boxWidth/2-1, Screen.height - 25, (Screen.width/8 + 12), boxHeight+2), "");
			GUI.Box (Rect (Screen.width / 2 - boxWidth/2, Screen.height - 24, finalBoxWidth, boxHeight), "", style);
		}
	}
	if (takeOverProgress <= 0.0) {
		mainPlayerStatus = null;
	}
	
}