var attackTurnTime = 0.7;
var rotateSpeed = 120.0;
var attackDistance = 20.0;
var extraRunTime = 2.0;

var attackSpeed = 1.0;
var attackRotateSpeed = 20.0;

var idleTime = 1.6;

var punchRadius = 7.1;
//var freezeRadius = 50.0;
//var sightRadius = 50.0;

private var attackAngle = 10.0;
private var isAttacking = false;

private var target : GameObject;

// Cache a reference to the motor
private var motor : CharacterMotorSF;
private var pStatus : PlayerStatus;
private var itemManager : ItemManager;

private var groundBase : GameObject;

private var strafing = 0.0;
private var moveDir = Vector3.zero;

private var ball : GameObject;

private var stuck : boolean = false;
private var stuckTime : float = 0.0;
var timeoutWhenStuck : float = 0.5;
private var alternateDir = Vector3.zero;

function Start ()
{
	var game : GameStatus = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus);
	motor = GetComponent(CharacterMotorSF);
	pStatus = GetComponent(PlayerStatus);
	itemManager = GetComponent(ItemManager);
	groundBase = pStatus.team.GetBase().gameObject;
	
	yield WaitForSeconds(Random.value);
			
	// Just attack for now
//	while (true)	
//	{
//		// Don't do anything when idle. And wait for player to be in range!
//		// This is the perfect time for the player to attack us
		yield Idle();
//	}
}

function Awake () {

}

function Update () {

	if (target && pStatus.IsRidingUfo())
		Debug.Log("target: " + target.tag, this);
	
	//if (target && target.CompareTag("BigSnowball"))
	//we're probably not moving forward although we want to
	if (moveDir != Vector3.zero && !ball && !(target && target.CompareTag("BigSnowball")) 
		&& !pStatus.IsRidingUfo() && Time.time > (stuckTime + timeoutWhenStuck) 
		&& motor.movement.velocity.magnitude < attackSpeed * 0.3) {
		
		if (!stuck) { //strafe, or change direction
			stuck = true;
			if (Random.value > 0.5)
				alternateDir = Vector3.Cross(moveDir, Vector3.up); //strafe to left
			else
				alternateDir = Vector3.Cross(Vector3.up, moveDir); //strafe to right
		}
		else { //this has happened before..strafing might not have worked, so walk backwards
//					Debug.Log("Backing up! at " + Time.time, this);
			alternateDir.x = -moveDir.x;
			alternateDir.y = moveDir.y;
			alternateDir.z = -moveDir.z;
		}
		stuckTime = Time.time;
	}
	else
		stuck = false;

	if(Time.time < (stuckTime + timeoutWhenStuck) && !pStatus.IsRidingUfo() && (target && !target.CompareTag("BigSnowball")))
		motor.inputMoveDirection = alternateDir;
	else
		motor.inputMoveDirection = moveDir;
	
}

function Idle ()
{
	
	// Don't do anything when idle
	// The perfect time for the player to attack us
	yield WaitForSeconds(idleTime);
	var tar : GameObject;

	// And if the player is really far away.
	// We just idle around until he comes back
	// unless we're dying, in which case we just keep idling.
	while (true)
	{
		moveDir = Vector3.zero;
		itemManager.ReleaseItem();
//		yield WaitForSeconds(0.2);
		
		if (pStatus.GetCurrentSnowballs() == 0 && !pStatus.IsRidingUfo()) { //RELOAD
			tar = FindSnowResource();
			if (tar) {
				target = tar;
				if(target.CompareTag("SnowballRessource"))
					yield GetAmmo();
				else if (target.CompareTag("BigSnowball"))
					yield RollBall();
			}
		}
		else {

			//first of all head towards a free base if there is one and there is no enemy really really close
			tar = FindFreeBase();
			if (tar) {
				target = tar;
				yield ConquerBase();
			}

			//otherwise just do business as usual
			tar = FindClosestBigSnowball();
			if (tar) {
				target = tar;
				yield RollBall();
			}
			
			tar = FindClosestEnemy();
			if (tar) {
				target = tar;
				yield Attack();
			}
			
			tar = FindCloseUFO();
			if (tar) {
				target = tar;
				yield GetUFO();
			}
		}
		yield;
	}
} 

function FindFreeBase() : GameObject{
	if (pStatus.IsRidingUfo()) 
		return null;
			
	var base = null;
	for (var t in GameObject.FindObjectsOfType(TeamBase)) {
		var team = t.transform.parent;
		if (team && team.GetComponent(Team).GetTeamNumber() == 0)
			base = t.gameObject;
			if (Random.value > 0.8) {
				return base;
			}
	}
	return base;
}

function FindClosestOwnBase () : GameObject{
	if (pStatus.IsRidingUfo())
		return null;
		
	var base = null;
	var shortestDist = Mathf.Infinity;
	var curDist = 0.0;
	for (var t in GameObject.FindObjectsOfType(TeamBase)) {
		var team = t.transform.parent;
		if (team.GetComponent(Team).GetTeamNumber() == pStatus.GetTeamNumber()) {
			curDist = Vector3.Distance(transform.position, team.transform.position);
			if (curDist < shortestDist) {
				base = t.transform.Find("TeamFlag").gameObject;
				shortestDist = curDist;
			}
		}
	}
	return base;
}

function FindCloseUFO () : GameObject {
	if (pStatus.IsRidingUfo())
		return null;
		
	var ufo = null;
	for (var u in GameObject.FindGameObjectsWithTag("Ufo")) {
		var ufoPos = u.transform.position;
		ufoPos.y = transform.position.y;
		if (Vector3.Distance(ufoPos, transform.position) < 2*attackDistance && !u.GetComponent(Ufo).GetOwner())
			ufo = u.gameObject;
	}
	return ufo;
}

function FindCloseBazooka () : GameObject {
	if (pStatus.IsRidingUfo())
		return null;
		
	var bazooka = null;
	var minDist = Mathf.Infinity;
	var curDist = 0.0;
	for (var b in GameObject.FindGameObjectsWithTag("Weapon")) {
		var bazookaPos = b.transform.position;
		bazookaPos.y = transform.position.y;
		
		curDist = Vector3.Distance(bazookaPos, transform.position);
		if (curDist < minDist) {// 2*attackDistance && b.transform.parent == null)
			bazooka = b.gameObject;
			minDist = curDist;
		}
	}
	return bazooka;
}

// Find the name of the closest enemy within distance
function FindClosestEnemy () : GameObject {
    // Find all game objects with tag Enemy
    var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag("Player"); 
    var closest : GameObject;
    var distance = Mathf.Infinity; 
    var position = transform.position; 
    var diff;
	var curDistance;
	        
    // Iterate through them and find the closest one
    for (var go : GameObject in gos)  { 
    	var status = go.GetComponent(PlayerStatus);
    	//get closest bot
    	if (status != null && !status.team.Friendly(pStatus.team)) {
	        diff = (go.transform.position - position);
	        curDistance = diff.sqrMagnitude; 
	        if (curDistance < distance) { 
	            closest = go; 
	            distance = curDistance; 
	        } 
        }
    } 
    
//    if (closest && (itemManager.GetItem() && itemManager.GetItem().CompareTag("BigSnowball"))) { //can't just let go.. what if we have a bazooka?
//		Debug.Log("Releasing " + itemManager.GetItem().tag, this);
//    	itemManager.ReleaseItem();
//	}
    	
    return closest;    
}

function FindBestBigSnowball () : GameObject {
	if (pStatus.IsRidingUfo())
		return null;
			
    // Find all game objects with tag BigSnowball
    var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag("BigSnowball"); 
    
    var closest : GameObject;
    var distance = Mathf.Infinity; 
    var position = transform.position; 
    var diff;
	var curDistance;
    groundBase = FindClosestOwnBase();
    
    // Iterate through them and find the closest one
    for (var go : GameObject in gos)  { 
    	diff1 = (go.transform.position - position);
    	diff2 = (go.transform.position - groundBase.transform.position);
	    curDistance = diff1.sqrMagnitude + diff2.sqrMagnitude; 
	    if (curDistance < distance) {
	    	if (!BallOfFriend(go.transform)) { 
		        closest = go; 
		        distance = curDistance; 
	        }
	    }
    } 
    
    return closest;    
}

function FindClosestBigSnowball () : GameObject {
	if (pStatus.IsRidingUfo())
		return null;
			
    // Find all game objects with tag BigSnowball
    var gos : GameObject[] = GameObject.FindGameObjectsWithTag("BigSnowball"); 
    
    var closest : GameObject;
    var distance : float = Mathf.Infinity; 
    var position : Vector3 = transform.position; 
	var curDistance : float = 0.0;

    groundBase = FindClosestOwnBase();
    
    // Iterate through them and find the closest one
    for (var go in gos)  { 
	    curDistance = Vector3.Distance(position, go.transform.position); 
	    if (curDistance < distance && !BallOfFriend(go.transform)) { 
	        closest = go; 
	        distance = curDistance; 
	    }
    } 
    
    return closest;    
}

function FindSnowResource () : GameObject {
	if (pStatus.IsRidingUfo())
		return null;
			
	var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag("SnowballRessource"); 
    
    var closest : GameObject;
    var distance = Mathf.Infinity; 
    var pos = transform.position; 
	var curDistance = 0.0;
	        
    // Iterate through them and find the closest one
    for (var go in gos)  { 
    	curDistance = Vector3.Distance(pos, go.transform.position);
	    if (curDistance < distance) { 
	        closest = go; 
	        distance = curDistance; 
	    }
    } 
        
    var snowBall = FindClosestBigSnowball();
    if (snowBall && FirstCloserThanSecond(snowBall.transform.position,  closest.transform.position)) {
//    	target = snowBall;
//		yield RollBall();
    	closest = snowBall; //return null, then we will jump out and search for snowballs
	}
    	
    return closest;  
}

function ConquerBase() {
	var alreadyThere : boolean = false;
	var arrivalTime : float;
	var patience : float;
	var flagPosition : Vector3;
	
	while (true) {
		var team = target.transform.parent;
		if (pStatus.GetCurrentSnowballs() == 0 || pStatus.IsRidingUfo() || !target || !team || 
			team.GetComponent(Team).GetTeamNumber() == pStatus.GetTeamNumber()) {//leave once the base is conquered
			RemoveTarget();
			return;
		}
		
		//if an enemy is too close forget this stuff and attack!!
		var enemy = FindClosestEnemy();
		if(Random.value > 0.9 && enemy && Vector3.Distance(enemy.transform.position, transform.position)< 2*attackDistance) {
			RemoveTarget();
			return;
		}
			
		flagPosition = target.transform.Find("TeamFlag").position;
		
		if (alreadyThere) {
			if (Time.time > arrivalTime+patience) {
				alreadyThere = false;
				RemoveTarget();
				return;
			}
		}
		else {
			if (Vector3.Distance(transform.position, flagPosition) >= 5)
				MoveTowardsPosition(flagPosition);
			else {
				//wait for a while
				alreadyThere = true;
				arrivalTime = Time.time;
				patience = Random.Range(0.0,4.0);
				moveDir = Vector3.zero;
			}
		}

//		if (Random.value > 0.99) {
//			RemoveTarget();
//			return;
//		}
			
		yield;
	}
}

function GetUFO () {
//	var pressActionTime = Mathf.Infinity;
	while (true) {
//		motor.inputAction = false;
		
		if (!target || pStatus.IsRidingUfo()) {
			return;
		}
			
		//if target is a ufo
		if (target && target.CompareTag("Ufo")) {
			//if (Random.value > 0.95 || !target.GetComponent(Ufo).GetOwner() || pStatus.GetCurrentSnowballs() == 0)
			//	return;
			//somebody's already in the ufo
			if (target.GetComponent(Ufo).GetOwner()) { // || pStatus.GetCurrentSnowballs() == 0) {
				RemoveTarget();
				return;
			}
				
			//if an enemy is too close forget this stuff and attack!!
			var enemy = FindClosestEnemy();
			if(Random.value > 0.9 && enemy && Vector3.Distance(enemy.transform.position, transform.position)< 2*attackDistance && 
				FirstCloserThanSecond(enemy.transform.position, target.transform.position)) {
				RemoveTarget();
				return;
			}
			
			isAttacking = false;
			
			var ufoPos = target.transform.position;
			ufoPos.y = transform.position.y;
			var distance = Vector3.Distance(transform.position, ufoPos);

			MoveTowardsPosition(ufoPos);
			
			if(distance < punchRadius*0.5){
				motor.inputAction = true;					
				motor.inputAltFire = false;
			}
			if(itemManager.GetCandidateItem()) {
				moveDir = Vector3.zero;
				yield WaitForSeconds(0.01);
				motor.inputAction = false;
				//yield WaitForSeconds(0.01);
			}

		}
		
		
		yield;
	}
}

function GetBazooka () {
	while (true) {
		motor.inputAction = false;
		
		if (!target || pStatus.IsRidingUfo()) {
			return;
		}
			
		//if target is a ball
		if (target && target.CompareTag("Weapon")) {
			//if (Random.value > 0.95 || !target.GetComponent(Ufo).GetOwner() || pStatus.GetCurrentSnowballs() == 0)
			//	return;
			if (target.transform.parent) {//This means, another bot is already holding this weapon || pStatus.GetCurrentSnowballs() == 0) {
				RemoveTarget();
				return;
			}
				
			//if an enemy is too close forget this stuff and attack!!
			var enemy = FindClosestEnemy();
			if(Random.value > 0.9 && enemy && Vector3.Distance(enemy.transform.position, transform.position)< attackDistance && 
				FirstCloserThanSecond(enemy.transform.position, target.transform.position)) {
				RemoveTarget();
				return;
			}
			
			isAttacking = false;
			
			var bazookaPos = target.transform.position;
			bazookaPos.y = transform.position.y;
			var distance = Vector3.Distance(transform.position, bazookaPos);

			MoveTowardsPosition(bazookaPos);
			
			if(distance < punchRadius*0.5){
				motor.inputAction = true;					
				motor.inputAltFire = false;
			}
			if(itemManager.GetCandidateItem()) {
				moveDir = Vector3.zero;
				yield WaitForSeconds(0.01);
				motor.inputAction = false;
			//	yield WaitForSeconds(0.01);
			}

		}
		yield;
	}
}

function GetAmmo () {
	var alreadyThere : boolean = false;
	var arrivalTime : float;
	var reloadTime : float;
	
	itemManager.ReleaseItem();
	
	while (true) {
		if (!target || pStatus.IsRidingUfo()) {
			RemoveTarget();
			return;
		}
		
		if (alreadyThere) {
			if (Random.value > 0.9 && target.GetComponent(SnowRessource).IsGrabBigSnowballPossible()) {
				motor.inputAction = true;
				buildingBall = Time.time;
				yield WaitForSeconds(GetComponent(ItemManager).srPickTime);
				RemoveTarget();
				return;
			}
			
			if (pStatus.GetCurrentSnowballs() == pStatus.GetMaximumSnowballs() || Time.time > arrivalTime+reloadTime
				|| !target.GetComponent(SnowRessource).IsGrabPossible()) {
				alreadyThere = false;
				RemoveTarget();
				return;
			}
		}
		else {
			if (Vector3.Distance(transform.position, target.transform.position) >= 1)
				MoveTowardsPosition(target.transform.position);
			else {
				//wait for a while
				alreadyThere = true;
				arrivalTime = Time.time;
				reloadTime = Random.Range(1.0,2.0);
				moveDir = Vector3.zero;
			}
		}
		yield;
	}
}

function RollBall ()
{
	groundBase = FindClosestOwnBase();
	
	while (true) {
		motor.inputAction = false;
		
		if (!target || pStatus.IsRidingUfo()) {
			RemoveTarget();
			return;
		}
			
		//if target is a ball
		if (target && target.CompareTag("BigSnowball")) {
			if (Random.value > 0.90 && BallOfFriend(target.transform)) {
				RemoveTarget();
				return;
			}
			
			isAttacking = false;
			ball = itemManager.GetItem();
			
			//if we have a ball, find out where the closest base is
//			if (ball)
//				groundBase = FindClosestOwnBase();
			
			//if we don't have a ball go get it
			if (!ball) {
				//if the ball is already taken or we're out of ammo, return to check your other options
				if (BallRolledByFriend () || pStatus.GetCurrentSnowballs() == 0) { //RELOAD
					RemoveTarget();
					return;
				}
					
				//if an enemy is too close forget this stuff and attack!!
				var enemy = FindClosestEnemy();
				if(Random.value > 0.8 && enemy && 
					Vector3.Distance(enemy.transform.position, transform.position)< attackDistance && 
					FirstCloserThanSecond(enemy.transform.position, target.transform.position)) {
					RemoveTarget();
					return;
				}
				
				var ballSize = target.GetComponent(Renderer).bounds.size.x;
				 //if we're close enough, try to get a hold of it
				if (Vector3.Distance(transform.position, target.transform.position) < ballSize + 2) {
					motor.inputAction = true;
					motor.inputAltFire = false;
				}
				else
					motor.inputAction = false;
					
				MoveTowardsPosition(target.transform.position);
			}
			//if we have a ball run to base
			else if (ball.CompareTag("BigSnowball") && groundBase) { //but make sure we have a base
				//if you're out of ammo, just create a snow seurce with right mouse click
				if (ball.GetComponent(BigSnowBall).IsBallTooFarAway (gameObject)) {
					RemoveTarget();
					return;
				}
					
				if (pStatus.GetCurrentSnowballs() == 0) { //RELOAD
					motor.inputAltFire = true;
					var tar = FindSnowResource();
					if (tar) {
						target = tar;
						yield GetAmmo();
					}
					RemoveTarget();
					return;
				}
					
				if(BallAtBase(groundBase.transform.position))
					moveDir = Vector3.zero;
				else
					MoveTowardsPosition(groundBase.transform.position);
			}
			
			if (Random.value > 0.9) {
				motor.inputAction = false;
				tar = FindClosestEnemy();
				//var oldTar = target;
				if (tar && (tar.transform.position - transform.position).magnitude < 2*attackDistance) {
					target = tar;
					Attack();
//					if(!target || target.GetComponent(PlayerStatus).IsDead())
//						target = oldTar;
					RemoveTarget();
					return;
				}
			}
		}
		yield;
	}
}

function Attack ()
{
	motor.inputAction = false;
			
	isAttacking = true;
	
	var targetPlayer : PlayerStatus = target.GetComponent(PlayerStatus);
	
	var angle : float = 180.0;
	var time : float = 0.0;
	var direction : Vector3 = Vector3.zero;
	
	// Run towards player
	var timer : float = 0.0;
	var lostSight : boolean = false;
	var pos : Vector3 = Vector3.zero;
	var distanceToEnemy : float = 0.0;
	
	while (true) {
		//if we're out of ammo or our target is dead, stop
		if (!target || pStatus.GetCurrentSnowballs() == 0 || targetPlayer.IsDead()) { //RELOAD
			RemoveTarget();
			return;
		}
		
		pos = transform.position;
		distanceToEnemy = Vector3.Distance(pos, target.transform.position);

		angle = Mathf.Abs(RotateTowardsPosition(target.transform.position, rotateSpeed));
		// First we wait for a bit so the player can prepare while we turn around
		// As we near an angle of 0, we will begin to move
		if (Mathf.Abs(angle) > 5)
		{
			time += Time.deltaTime;			
			move = Mathf.Clamp01((90 - angle) / 90);
			
			// depending on the angle, start moving
			direction = transform.TransformDirection(Vector3.forward * attackSpeed * move);
			//motor.inputMoveDirection = Vector3.zero;
			moveDir = Vector3.zero;
		} else {
			// The angle of our forward direction and the player position is larger than 100 degrees
			// That means he is out of sight
			if (Mathf.Abs(angle) > 150)
				lostSight = true;
				
			// If we lost sight then we keep running for some more time (extraRunTime). 
			// then stop attacking 
			if (lostSight)
				timer += Time.deltaTime;	
			
			// Just move forward at constant speed
			direction = transform.TransformDirection(Vector3.forward * attackSpeed);
			
			//we're getting too close, move back!
			if (distanceToEnemy < punchRadius)
				backup = true;
			
			//we're far away now, move closer again
			if (backup && distanceToEnemy > punchRadius)
				backup = false;

			//TODO: move away from enemy
//			if (backup && !pStatus.IsRidingUfo())
//				direction *= -1;
				
			//if a bot is in a ufo and above an enemy, make him use the freeze ray
		 	if (pStatus.IsRidingUfo() && AboveTarget() && 
		 	(target.GetComponent(PlayerStatus) && !target.GetComponent(PlayerStatus).IsRidingUfo())) {
		 		motor.inputAltFire = true;
		 	}
		 	
		 	//we've turned our back and suffer a loss of memory
			if (lostSight) {
		 		moveDir = Vector3.zero;
		 		RemoveTarget();
		 		return;
		 	}
		 	
		 	//the enemy is riding a ufo.. desperate times call for desperate measures
		 	if (target.GetComponent(PlayerStatus) && target.GetComponent(PlayerStatus).IsRidingUfo() && !pStatus.IsRidingUfo()) {
		 		var weapon : GameObject = itemManager.GetItem();
		 		//if we have a bazooka, use it!
		 		if (weapon && weapon.CompareTag("Weapon")) {
		 			//aim and then shoot
		 			motor.inputFire = !motor.inputFire;
		 		}
		 		else { //if there's a bazooka lying around, go get it!
		 			weapon = FindCloseBazooka ();
		 			
		 			if (weapon) {
		 				GetBazooka();
		 			}
		 			//if there's nothing, find a snowfield, make a ball and take it to base wishing for a bazooka
		 			else {
		 				tar = FindSnowResource();
						if (tar) {
							target = tar;
							yield GetAmmo();
						}
		 			}
		 		}
		 		
//		 		//TODO:
				//when holding a bazooka  -- shoot!! :)
				//else
//		 		//if there's a bazooka close, go get it!
//		 		//otherwise try finding a snowball
//		 		target == null;
//				RemoveTarget();
//		 		return;
		 	}

			//shoot and move around a bit ;)
//			if((pos - target.transform.position).magnitude - (target.transform.position.y - pos.y) < punchRadius
			if (distanceToEnemy < punchRadius) {
				motor.inputFire = !motor.inputFire;
				direction = Vector3.left * strafing;
				if (Random.value > 0.9) {
					strafing = 0;
					var x = Random.value;
					if (x > 0.7) strafing = 1;
					if (x < 0.3) strafing = -1;
					if (x > 0.95) motor.inputJump = true;
				}
			}

			moveDir = direction;
		}
		
		if (Random.value > 0.90) {
			RemoveTarget();
			return;
		}

		// yield for one frame
		yield;
	}
	

	isAttacking = false;
	//motor.inputMoveDirection = Vector3.zero;
	moveDir = Vector3.zero;
	
}

function FirstCloserThanSecond (first : Vector3, second : Vector3) {
	return (Vector3.Distance(transform.position, first) <= Vector3.Distance(transform.position, second));
}

function RotateTowardsPosition (targetPos : Vector3, rotateSpeed : float) : float
{
	// Compute relative point and get the angle towards it
	var relative = transform.InverseTransformPoint(targetPos);
	var angle = Mathf.Atan2 (relative.x, relative.z) * Mathf.Rad2Deg;
	// Clamp it with the max rotation speed
	var maxRotation = rotateSpeed * Time.deltaTime;
	var clampedAngle = Mathf.Clamp(angle, -maxRotation, maxRotation);
	// Rotate
	motor.Rotate(clampedAngle, 0);
	// Return the current angle
	return angle;
}

function BallAtBase(basePos : Vector3) {
	return (Vector3.Distance(transform.position, basePos) < target.GetComponent(Renderer).bounds.size.x+2);
}

function MoveTowardsPosition (position : Vector3) {
	var direction = position - transform.position;
	var dist = (direction).sqrMagnitude;
	
	var angle = Mathf.Abs(RotateTowardsPosition(position, rotateSpeed));
	if (Mathf.Abs(angle) > 2) //rotate towards ball
	{
		move = Mathf.Clamp01((90 - angle) / 90);
		// depending on the angle, start moving
		direction = transform.TransformDirection(Vector3.forward * attackSpeed * move);
		//direction = Vector3.zero;
	} else {
		// Just move forward at constant speed
		direction = transform.TransformDirection(Vector3.forward * attackSpeed);
	}
	moveDir = direction;
}

function BallOfFriend ( t : Transform ) : boolean {
    // Find all game objects with tag Enemy
    var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag("Player");  
   
    var position = t.position; 
    var diff;
	var curDistance;
	        
    // Iterate through them and find the closest one
    for (var go : GameObject in gos)  {
    	var status = go.GetComponent(PlayerStatus);
    	//get closest bot
    	if (go != gameObject && status != null && status.team.Friendly(pStatus.team)) {
	        diff = (go.transform.position - position);
	        curDistance = diff.sqrMagnitude; 
	        if (curDistance < 5) { 
	            return true;
	        } 
        }
    }
    return false;
}

function BallRolledByFriend () : boolean {
	var parent = target.transform.parent;
	if (parent && parent.GetComponent(PlayerStatus) && parent.GetComponent(PlayerStatus).team == pStatus.team)
		return true;
	else
		return false;
}

function AboveTarget() {
	var botPos = transform.position;
	var enemyPos = target.transform.position;
	botPos.y = enemyPos.y;
	return (Vector3.Distance(botPos,enemyPos) < attackDistance);
}

function RemoveTarget () {
	target = null;
}

function OnDrawGizmosSelected ()
{
	Gizmos.color = Color.yellow;
	Gizmos.DrawWireSphere (transform.position, punchRadius);
	Gizmos.color = Color.red;
	Gizmos.DrawWireSphere (transform.position, attackDistance);
}

function OnSetBot () {
	enabled = true;
}
function OnSetMainPlayer () {
	enabled = false;
}
function OnSetRemote () {
	enabled = false;
}

function OnDeath () {
	StopAllCoroutines();
	if (this.enabled) StartCoroutine("Start");
}


@script RequireComponent (CharacterMotorSF)
@script RequireComponent (ItemManager)