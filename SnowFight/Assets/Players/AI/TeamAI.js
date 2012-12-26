#pragma strict

private var teamComponent : Team;
private var teamNumber = 0;
private var teamMembers : Transform[];
private var allBases : GameObject[] = [];
private var unoccupiedBases : GameObject[] = [];
private var ownBases : GameObject[] = [];
private var enemyBases : GameObject[] = [];
private var ufos : GameObject[];
private var bazookas : GameObject[];
private var snowBalls : GameObject[];
private var snowRessources : GameObject[];

function Start () {
	teamComponent = GetComponent(Team);
	teamNumber = teamComponent.GetTeamNumber();
	teamMembers = teamComponent.GetAllPlayers();
}

function Update () {

}

function GetTargets (player : GameObject) : GameObject[] {
	var targets : GameObject[] = [];
	
	//find all relevant objects - we will probably need them anyways
	GetUfos ();
	GetBazookas();
	GetSnowBalls();
	GetSnowRessources();
	UpdateBases();
	
	if (Random.value > 0.5 && bazookas.Length > 0 && WantsBazooka(player)) {
		var closestBazooka = GetClosestObjectInArray(player, bazookas);
		targets += [closestBazooka];
	} else {
		if (snowBalls.Length > 0) {
			var closestBall = GetClosestObjectInArray(player, snowBalls);
			if (IsClosestTeamMember(player, closestBall.transform.position) && !closestBall.transform.parent) {
				targets += [closestBall];
			}
		}	
		var closestRessource = GetClosestObjectInArray(player, snowRessources);
		targets += [closestRessource];
	}
	
	//if theres still a free base, return that as targets!
	if (unoccupiedBases.Length > 0) {
		targets += unoccupiedBases;
	}
	
	if (enemyBases.Length > 0)
		targets += [GetClosestObjectInArray (player,enemyBases)];
	else 
		targets += [GetClosestObjectInArray (player,ownBases)];
	
	for (ufo in ufos) {
		if (IsUfoUnoccupied (ufo)) {
			targets += [ufo];
		}
	}
		
	return targets;
}

function UpdateBases () {
//	var unoccupied = 0;
//	var own = 0;
//	var enemy = 0;
	allBases = [];
	ownBases = [];
	enemyBases = [];
	unoccupiedBases = [];

	for (var base in GameObject.FindGameObjectsWithTag("Base")) {
		allBases += [base.gameObject];
		
		var team = base.transform.parent;
		if (team && team.GetComponent(Team).GetTeamNumber() == 0) {
			unoccupiedBases += [base.gameObject];
		}
		else if (team && team.GetComponent(Team).GetTeamNumber() == teamNumber) {
			ownBases += [base.gameObject];
		}
		else {
			enemyBases += [base.gameObject];
		}
	}
}

function GetClosestBase (bot : GameObject) : GameObject {
	return GetClosestObjectInArray(bot, allBases);
}

function GetClosestOwnBase (bot : GameObject) : GameObject {
	//UpdateBases ();
	//just get the closest spawn base for now
	return GetClosestObjectInArray(bot, teamComponent.GetAllBases());
}

function GetUfos () : GameObject[] {
	ufos = GameObject.FindGameObjectsWithTag("Ufo");
	return ufos;
}

function GetClosestFlyingEnemy (bot : GameObject) : GameObject {
	GetUfos();
	var flyingBots : GameObject[] = [];
	for (u in ufos) {
		if (IsUfoOccupiedByEnemy(u)) {
			flyingBots += [u.GetComponent(Ufo).GetOwner()];
		}
	}
	return GetClosestObjectInArray(bot, flyingBots);
}

function IsUfoOccupiedByEnemy (ufo : GameObject) : boolean {
	var owner = ufo.GetComponent(Ufo).GetOwner();
	if (owner && owner.GetComponent(PlayerStatus).GetTeamNumber() != teamNumber)
		return true;
	else return false;
}

function IsUfoUnoccupied (ufo : GameObject) : boolean {
	return (ufo.GetComponent(Ufo).GetOwner() == null);
}

function GetBazookas () : GameObject[] {
	bazookas = GameObject.FindGameObjectsWithTag("Weapon");
	return bazookas;
}

function GetSnowBalls () : GameObject[] {
	snowBalls = [];
	for (var s in GameObject.FindGameObjectsWithTag("BigSnowball")) {
		if (!s.GetComponent(BigSnowBall).IsHeld()) {
			snowBalls += [s];
		}
	}
	return snowBalls;
}

function GetSnowRessources () : GameObject[] {
	snowRessources = [];
	for (var sr in GameObject.FindGameObjectsWithTag("SnowballRessource")) {
		if (sr.GetComponent(SnowRessource).IsGrabBigSnowballPossible()) {
			snowRessources += [sr];
		}
	}
	return snowRessources;
}

//Get the closest team member that's not busy
function GetClosestTeamMember (pos : Vector3) : GameObject {
	//var botPosition = bot.transform.position;
	var closest : GameObject;
	var minDist = Mathf.Infinity;
	var curDist = 0.0;
	teamMembers = teamComponent.GetAllPlayers();
	for (var player in teamMembers) {
		curDist = Vector3.Distance(player.position, pos);
		if (curDist < minDist && !player.GetComponent(BotAI).IsBusy()) {
			closest = player.gameObject;
			minDist = curDist;
		}
	}
	return closest;
}

//Get the closest team member that's not busy
function IsClosestTeamMember (player : GameObject, pos : Vector3) : boolean {
	var minDist = Vector3.Distance(player.transform.position, pos);
	var curDist = 0.0;
	teamMembers = teamComponent.GetAllPlayers();
	for (var bot in teamMembers) {
		if (bot != player && bot.GetComponent(BotAI).enabled && !bot.GetComponent(PlayerStatus).IsDead()){// && !bot.GetComponent(BotAI).IsBusy()) {
			curDist = (bot.position-pos).sqrMagnitude;
			if (curDist < minDist)
				return false;
		}
	}
	return true;
}

function GetClosestObjectInArray (bot : GameObject, objects : GameObject[]) : GameObject {
	var botPosition = bot.transform.position;
	var closest : GameObject;
	var minDist = Mathf.Infinity;
	var curDist = 0.0;
	for (var obj in objects) {
		//with are certain possibility, give a result that's not actually the closest
//		if (Random.value > 0.8)
//			return obj;
		
		if(obj.CompareTag("Base")) {
			var flag = obj.transform.Find("TeamFlag");
			curDist = Vector3.Distance(botPosition, flag.position);
		}
		else
			curDist = Vector3.Distance(botPosition, obj.transform.position);
		
		
		if (curDist < minDist) {
			closest = obj;
			minDist = curDist;
		}
	}
	return closest;
}

function FindClosestEnemy (bot :GameObject) : GameObject {
    // Find all game objects with tag Enemy
    var gos:GameObject[] = GameObject.FindGameObjectsWithTag("Player"); 
    var closest:GameObject;
    var distance:float = Mathf.Infinity; 
    var position:Vector3 = bot.transform.position; 
   // var diff;
	var curDistance:float = 0.0;
	        
    // Iterate through them and find the closest one
    for (var go : GameObject in gos)  {
    	var status :PlayerStatus = go.GetComponent.<PlayerStatus>();
    	//get closest bot
    	if (status != null && !status.IsDead() && !status.IsRidingUfo() 
    			&& !status.team.Friendly(teamComponent)) {
    		position.y = go.transform.position.y;
	        curDistance = (go.transform.position - position).sqrMagnitude;
	        
	        if (curDistance < distance) { 
	            closest = go; 
	            distance = curDistance; 
	            
        		//with are certain possibility, give a result that's not actually the closest
				if (Random.value > 0.8)
					return closest;
	        } 
        }
    } 
    return closest;
}

function IsAFriend(player :GameObject) :boolean {
	return player != null && player.GetComponent(PlayerStatus) != null
		&& player.GetComponent(PlayerStatus).team.Friendly(teamComponent);
}

function WantsBazooka (player:GameObject) : boolean {
	return (GetClosestFlyingEnemy(player)!=null);// && Random.value>0.5);
}

function WantsSpecialWeapon (player:GameObject) : boolean {
	return (GetClosestFlyingEnemy(player)!=null || Random.value>0.2);
}