#pragma strict

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

var specialWeapons : GameObject[];


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
}

function Awake () {
	game = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus);
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

function Update () {
	if (Network.isServer) {
		var takeOverDist = takeOverRadius * takeOverRadius;
		
		var gos : GameObject[];
	    gos = GameObject.FindGameObjectsWithTag("Player");  
		
		var teamTakingOver :Team = null;
		
		for (var go : GameObject in gos)  {
			if ((go.transform.position - transform.position).sqrMagnitude < takeOverDist) {
		    	var status :PlayerStatus = go.GetComponent(PlayerStatus);
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
		if (other.CompareTag("BigSnowball")) {
			enterTime += Time.deltaTime;
			if (enterTime > 2.0 && other.GetComponent(BigSnowBall)) {
				other.transform.parent = null;
				var weapon = specialWeapons[Random.Range(0,specialWeapons.Length)];
				Network.Instantiate(weapon, other.transform.position, Quaternion.identity,0);
				Network.Destroy(other.gameObject);
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
    if (!stream.isWriting) {
        if (team == null || team.GetTeamNumber() != teamNumber) {
        	var t :Team = game.GetTeamById(teamNumber);
        	if (!t) t = neutralTeam;
        	SetTeam(t);
        }
    }
}