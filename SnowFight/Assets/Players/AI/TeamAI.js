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
	var closestBall : GameObject;
	var targets : GameObject[] = [];
	
	//find bases
	UpdateBases();
	//if there'still a free base, return that as targets!
	if (unoccupiedBases.Length > 0)
		targets += [GetClosestObjectInArray (player,unoccupiedBases)];
	
	GetUfos ();
	for (ufo in ufos) {
		//if the ufo is empty and we're closest, go get it!
		if (IsUfoUnoccupied (ufo) && IsClosestTeamMember(player, ufo.transform.position)) {
			targets += [ufo];
			break;
		}
		//if there's an enemy in a ufo
		else if (IsUfoOccupiedByEnemy(ufo)) {
			GetBazookas();
			//if there's a bazooka somewhere
			if (bazookas.Length > 0) {
				for (baz in bazookas) {
					//and we're the closest bot, return that bazooka
					if (IsClosestTeamMember(player, baz.transform.position)) {
						targets += [baz];
						break;
					}
				}
			}
			//if there's no bazooka find a snowball or snowfield to take to the base
			else {
				GetSnowBalls();
				GetSnowRessources();
				
				closestBall = GetClosestObjectInArray(player, snowBalls);
				var closestRessource = GetClosestObjectInArray(player, snowRessources);
				if (closestBall && Vector3.Distance(player.transform.position, closestBall.transform.position) < 
					Vector3.Distance(player.transform.position, closestRessource.transform.position))
					targets += [closestBall];
				else 
					targets += [closestRessource];
			}
		}
	}
	
	//we're still here, so there's no ufo or bazooka for us to get
	//so perhaps get snowballs
	GetSnowBalls();
	if (snowBalls.Length > 0) {
		closestBall = GetClosestObjectInArray(player, snowBalls);
		if (IsClosestTeamMember(player, closestBall.transform.position) && !closestBall.transform.parent) {
			targets += [closestBall];
		}
	}
	
	//or go make a snowball at a snowressource
	GetSnowRessources();
	if (Random.value > 0.8) {
		closestRessource = GetClosestObjectInArray(player, snowRessources);
		if (IsClosestTeamMember(player, closestRessource.transform.position)) {
			targets += [closestRessource];
			//return targets;
		}
	}
	
	//otherwise return an enemies base to regain
	if (unoccupiedBases.Length == 0) {
		if (enemyBases.Length > 0)
			targets += [GetClosestObjectInArray (player,enemyBases)];
		else 
			targets += [GetClosestObjectInArray (player,ownBases)];
	}
	
	return targets;
}

function UpdateBases () {
//	var unoccupied = 0;
//	var own = 0;
//	var enemy = 0;
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

function GetClosestBase (respawningBot : GameObject) : GameObject {
	return GetClosestObjectInArray(respawningBot, allBases);
}

function GetClosestOwnBase (respawningBot : GameObject) : GameObject {
	UpdateBases ();
	//just get the closest spawn base for now
	return GetClosestObjectInArray(respawningBot, ownBases);
}

function GetUfos () : GameObject[] {
	ufos = GameObject.FindGameObjectsWithTag("Ufo");
	return ufos;
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
	snowBalls = GameObject.FindGameObjectsWithTag("BigSnowball");
	return snowBalls;
}

function GetSnowRessources () : GameObject[] {
	snowRessources = GameObject.FindGameObjectsWithTag("SnowballRessource");
	return snowRessources;
}

//Get the closest team member that's not busy
function GetClosestTeamMember (pos : Vector3) : GameObject {
	//var botPosition = bot.transform.position;
	var closest : GameObject;
	var minDist = Mathf.Infinity;
	var curDist = 0.0;
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
	for (var bot in teamMembers) {
		curDist = Vector3.Distance(bot.position, pos);
		if (curDist < minDist && !bot.GetComponent(BotAI).IsBusy()) {
			minDist = curDist;
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
		if (Random.value > 0.8)
			return obj;
		
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

function FindClosestEnemy () : GameObject {
    // Find all game objects with tag Enemy
    var gos:GameObject[] = GameObject.FindGameObjectsWithTag("Player"); 
    var closest:GameObject;
    var distance:float = Mathf.Infinity; 
    var position:Vector3 = transform.position; 
   // var diff;
	var curDistance:float = 0.0;
	        
    // Iterate through them and find the closest one
    for (var go : GameObject in gos)  { 
    	var status = go.GetComponent(PlayerStatus);
    	//get closest bot
    	if (status != null && !status.team.Friendly(teamComponent)) {
    		position.y = go.transform.position.y;
	        curDistance = Vector3.Distance(go.transform.position, position);
	        
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