private var enterTime :float = 0;

var baseID : int;
var onFlagWonSound  : AudioClip;

@System.NonSerialized
var team : Team;
@System.NonSerialized
var neutralTeam : Team;


@System.NonSerialized
private var game :GameStatus;

var points : int = 3;

var takeOverRadius :int = 10;
private var takeOverDist :float;
var takeOverTime :float = 5.0;
var takeOverProgress :float = 0.0;
@System.NonSerialized
var takeOverCurrTeam :Team = null;

private var currentTeamTakingOver : Team;
private var progress : float;
private var regenerationProgress :float = 0;
var regenerationTime :float = 1;
var regenerationAmount :float = 5;

private var mainPlayerStatus : PlayerStatus;

var specialWeapons : GameObject[];
var specialWeaponIcons : Texture2D[];

//var spawnWeaponPipelineLength :int = 4;
//var spawnWeaponPipeline : Array;

function PlayAudio(audio : AudioClip){
	transform.audio.clip=audio;
	if(!transform.audio.isPlaying){
	    	   	transform.audio.Play();
	}
}


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
	takeOverDist = takeOverRadius * takeOverRadius;
	//spawnWeaponPipeline = new Array();
	//FillPipeline();
	
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

function Start () {

}

//function FillPipeline() {
//	if (Network.isServer) {
//		while (spawnWeaponPipeline.length < spawnWeaponPipelineLength) {
//			spawnWeaponPipeline.Add(Random.Range(0,specialWeapons.Length));
//		}
//	}
//}

function PlayerInRange (go :GameObject) {
	return (go.transform.position - transform.position).sqrMagnitude < takeOverDist;
}

function Update () {
	regenerationProgress += Time.deltaTime;
	var regenerationFrame = false;
	if (regenerationProgress > regenerationTime) {
		regenerationProgress = 0;
		regenerationFrame = Network.isServer;
	}
	var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag("Player");  
	
	var teamTakingOver :Team = null;
	
	for (var go : GameObject in gos)  {
		if (PlayerInRange(go)) {
	    	var status : PlayerStatus = go.GetComponent(PlayerStatus);
	    	if (!status.IsDead()) {
	    		go.SendMessage("SetClosestBase", this, SendMessageOptions.DontRequireReceiver);
    			if (status.team != teamTakingOver) {
	    			if (teamTakingOver == null) {
	    				teamTakingOver = status.team;
	    			} else {
	    				teamTakingOver = neutralTeam;
	    			}
	    		}
	    		if (regenerationFrame && status.team == team) {
	    			status.Regenerate(regenerationAmount);
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
		if (takeOverProgress >= 1 && Network.isServer) {
//			Debug.Log("takeOverFinished");
			SetTeam(teamTakingOver);
		}
	} 
	takeOverCurrTeam = teamTakingOver;
}

function SetTeam (t :Team) {
	transform.parent = t.transform;
	var oldTeam :Team = team;
	team = t;
	if (oldTeam) oldTeam.SendMessage("OnBaseSwitchesTeam", this);
	if (t) t.SendMessage("OnBaseSwitchesTeam", this);
	gameObject.BroadcastMessage("SetColor", team.color, SendMessageOptions.DontRequireReceiver);
	if (oldTeam != team) PlayAudio(onFlagWonSound);
}

function OnTriggerStay(other : Collider) {
	if (Network.isServer) {
		if (other.CompareTag("BigSnowball")) {
			enterTime += Time.deltaTime;
			if (enterTime > 2.0 && other.GetComponent(BigSnowBall)) {
				other.transform.parent = null;
				//var weapon = specialWeapons[spawnWeaponPipeline.Shift()];
				//FillPipeline();
				var weapon;
				if(other.GetComponent(BigSnowBall).HasReachedFullSize())
					weapon = specialWeapons[1];
				else
					weapon = specialWeapons[0];
					
				Network.Instantiate(weapon, other.transform.position + Vector3(0,8,0), Quaternion.identity,0);
					
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
//    var newSWP :Array = new Array();
//    for (var i = 0; i < spawnWeaponPipelineLength; i++) {
//    	var itemId :int = 0;
//    	if (spawnWeaponPipeline.length > i) {
//    		itemId = spawnWeaponPipeline[i];
//    	}
//    	stream.Serialize(itemId);
//    	newSWP.Add(itemId);
//    }
//    spawnWeaponPipeline = newSWP;
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
//	if (pos.z > 1 && pos.z < 70 && pos.x > -10 && pos.y > -10
//				  			    && pos.x < Screen.width-10 && pos.y < Screen.height-10) {
//		GUILayout.BeginArea(Rect(pos.x, Screen.height-pos.y, 20,150));
//		GUILayout.BeginVertical();
//		for (var itemId :int in spawnWeaponPipeline) {
//			if (itemId < specialWeaponIcons.Length)
//				GUILayout.Label(specialWeaponIcons[itemId],GUILayout.Height(25));
//		}
//		GUILayout.EndVertical();
//		GUILayout.EndArea();
//	}
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