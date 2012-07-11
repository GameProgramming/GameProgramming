var attackTurnTime = 0.7;
var rotateSpeed = 120.0;
var attackDistance = 20.0;
var extraRunTime = 2.0;

var attackSpeed = 1.0;
var attackRotateSpeed = 20.0;

var idleTime = 1.6;

var punchRadius = 10;//7.1;
//var freezeRadius = 50.0;
//var sightRadius = 50.0;

private var attackAngle = 10.0;
private var isAttacking = false;

private var target : GameObject;

// Cache a reference to the motor
private var motor : CharacterMotorSF;
private var pStatus : PlayerStatus;
private var itemManager : ItemManager;

private var groundBaseFlag : Transform;

private var strafing = 0.0;
private var moveDir = Vector3.zero;

private var ball : GameObject;

private var stuck : boolean = false;
private var stuckTime : float = 0.0;
var timeoutWhenStuck : float = 0.5;
private var alternateDir = Vector3.zero;

private var busy : boolean = false;
private var teamAI : TeamAI;
//private var lostTarget : int = 0;
private var targets : GameObject[];

function Awake () {
	var game : GameStatus = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus);
	motor = GetComponent(CharacterMotorSF);
	pStatus = GetComponent(PlayerStatus);
	itemManager = GetComponent(ItemManager);
}

function Start ()
{	
	yield WaitForSeconds(Random.value);
			
	//Idle might be the wrong name for the function.. this does it all
	yield Idle();
}

function OnJoinTeam (t :Team) {
	teamAI = t.gameObject.GetComponent(TeamAI);
}

function Update () {
	// find a new respawning base.
	if (teamAI && pStatus.IsDead() && pStatus.GetSpawnBaseID() < 0) {
		var spawnBase = teamAI.GetClosestOwnBase (gameObject);
		if (spawnBase)
			pStatus.SetSpawnBaseID(spawnBase.GetComponent(TeamBase).GetID());
	}

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
	var whileCounter = 0;

	// And if the player is really far away.
	// We just idle around until he comes back
	// unless we're dying, in which case we just keep idling.
	while (true)
	{
		if (!pStatus.IsDead()) {
	
			whileCounter ++;
			moveDir = Vector3.zero;
			itemManager.ReleaseItem();
	
			targets = teamAI.GetTargets(gameObject);
				for (t in targets) {
	//		if (targets.Length > 0) {
	//			var t = targets[0];
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
				tar = teamAI.FindClosestEnemy();			
				if (tar && (Vector3.Distance(transform.position, tar.transform.position) < attackDistance*2 || pStatus.IsRidingUfo())) {
					target = tar;
					yield Attack();	
				}
				
				busy = false;
				target = t;
				if (target) {
					if(target.CompareTag("SnowballRessource")) {
						yield GetAmmo();
					}
					else if (target.CompareTag("BigSnowball")) {
						yield RollBall();	
					}
					else if (target.CompareTag("Base")) {
						yield ConquerBase();
					}
					else if (target.CompareTag("Ufo")) {
						yield GetUFO();
					}
					else if (target.CompareTag("Weapon")) {
						yield GetBazooka();
					}
					else {
						Debug.Log("Tag not recognized!", this);
					}
				}
			}
		}
		yield;
	}
} 

function FindSnowResource () : GameObject {

	var closest = teamAI.GetClosestObjectInArray(gameObject, teamAI.GetSnowRessources());
	var ball = teamAI.GetClosestObjectInArray(gameObject, teamAI.GetSnowBalls());
	
	if (ball && FirstCloserThanSecond(ball.transform.position,  closest.transform.position))
		closest = ball;
    	
    return closest;  
}

function ConquerBase() {
	var alreadyThere : boolean = false;
	var arrivalTime : float;
	var patience : float;
	var flagPosition : Vector3;
	
	while (true) {
		if (pStatus.GetCurrentSnowballs() == 0 || pStatus.IsRidingUfo() || !target) {
			RemoveTarget();
			return;
		}
		
		var team = target.transform.parent;
		if (!team || team.GetComponent(Team).GetTeamNumber() == pStatus.GetTeamNumber()) {//leave once the base is conquered
			RemoveTarget();
			return;
		}
		
		//if an enemy is too close forget this stuff and attack!!
		var enemy = teamAI.FindClosestEnemy();
		if(Random.value > 0.8 && enemy && Vector3.Distance(enemy.transform.position, transform.position)< 2*attackDistance) {
			RemoveTarget();
			return;
		}
		
		if (alreadyThere) {
			if (Time.time > arrivalTime+patience) {
				alreadyThere = false;
				RemoveTarget();
				return;
			}
		}
		else {
			//Debug.DrawRay(target.transform.position, transform.up * 50, Color.black);
			Debug.DrawRay(transform.position, transform.up * 50, Color.black);
			
			flagPosition = target.transform.Find("TeamFlag").position;
			if (Vector3.Distance(transform.position, flagPosition) >= 5)
				MoveTowardsPosition(flagPosition);
			else {
				//wait for a while
				alreadyThere = true;
				arrivalTime = Time.time;
				patience = Random.Range(2.0,4.0);
				moveDir = Vector3.zero;
			}
		}			
		yield;
	}
}

function GetUFO () {
	motor.inputAction = false;
	while (true) {
		
		if (!target) {
			return;
		}
			
		//if target is a ufo and someone's already in it, forget it
		if (target.CompareTag("Ufo")) {
			//Either we just got into the ufo or the ufo is already taken
			if (pStatus.IsRidingUfo() || target.GetComponent(Ufo).GetOwner()) {
				RemoveTarget();
				return;
			}
				
			//if an enemy is too close forget this stuff and attack!!
			var enemy = teamAI.FindClosestEnemy();
			if(Random.value > 0.8 && enemy && Vector3.Distance(enemy.transform.position, transform.position)< 2*attackDistance && 
				FirstCloserThanSecond(enemy.transform.position, target.transform.position)) {
				RemoveTarget();
				return;
			}
			
			isAttacking = false;
			
			var ufoPos = target.transform.position;
			ufoPos.y = transform.position.y;
			var distance = Vector3.Distance(transform.position, ufoPos);

			Debug.DrawRay(target.transform.position, transform.up * 50, Color.blue);
			
			var candidateItem = itemManager.GetCandidateItem();	
			if (candidateItem && (candidateItem.CompareTag("Ufo") || 
				candidateItem.transform.parent && candidateItem.transform.parent.CompareTag("Ufo"))) {
				motor.inputAction = true;
				motor.inputAltFire = false;
				yield WaitForSeconds(0.01);
				motor.inputAction = false;
			}
			Debug.DrawRay(transform.position, transform.up * 50, Color.blue);
			MoveTowardsPosition(ufoPos);
		}
		
		
		yield;
	}
}

function GetBazooka () {
	motor.inputAction = false;
	while (true) {

		if (!target || pStatus.IsRidingUfo() || pStatus.GetCurrentSnowballs() == 0 || 
			itemManager.GetItem() && itemManager.GetItem().CompareTag("Weapon")) {
			return;
		}
			
		//if target is a weapon
		if (target.CompareTag("Weapon")) {
			if (target.transform.parent) {//This means, another bot is already holding this weapon || pStatus.GetCurrentSnowballs() == 0) {
				RemoveTarget();
				return;
			}
				
			//if an enemy is too close forget this stuff and attack!!
			var enemy = teamAI.FindClosestEnemy();
			if(Random.value > 0.99 && enemy && Vector3.Distance(enemy.transform.position, transform.position)< 2*attackDistance && 
				FirstCloserThanSecond(enemy.transform.position, target.transform.position)) {
				RemoveTarget();
				return;
			}
			
			isAttacking = false;
			
			var bazookaPos = target.transform.position;
			bazookaPos.y = transform.position.y;
			var distance = Vector3.Distance(transform.position, bazookaPos);

			var candidateItem = itemManager.GetCandidateItem();
			if(candidateItem && candidateItem.CompareTag("Weapon")) {
				motor.inputAction = true;
				motor.inputAltFire = false;
//				RemoveTs
				yield WaitForSeconds(0.01);
				motor.inputAction = false;
				moveDir = Vector3.zero;
				if (!target) return;
				
				if (itemManager.GetItem()) {
					RemoveTarget();
					return;
				}
			}
			Debug.DrawRay(target.transform.position, transform.up * 50, Color.yellow);
			Debug.DrawRay(transform.position, transform.up * 50, Color.yellow);
			
			MoveTowardsPosition(bazookaPos);
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
		
		busy = true;
		Debug.DrawRay(transform.position, transform.up * 50, Color.cyan);
		Debug.DrawRay(target.transform.position, transform.up * 50, Color.cyan);
		
		if (alreadyThere) {
			if (Random.value > 0.8 && target.GetComponent(SnowRessource).IsGrabBigSnowballPossible()) {
				motor.inputAction = true;
				buildingBall = Time.time;
				yield WaitForSeconds(GetComponent(ItemManager).srPickTime);
//				targets = [];
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
			if (Vector3.Distance(transform.position, target.transform.position) >= 1) {
				MoveTowardsPosition(target.transform.position);
				
				if (Random.value > 0.999) {
					enemy = teamAI.FindClosestEnemy();
					if (enemy && (enemy.transform.position - transform.position).magnitude < 2*attackDistance) {
						RemoveTarget();
						return;
					}
				}
			}
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
	groundBaseFlag = null;
	while (true) {
		motor.inputAction = false;
		
		if (!target || pStatus.IsRidingUfo()) {
			groundBaseFlag = null;
			RemoveTarget();
			return;
		}
			
		//if target is a ball
		if (target && target.CompareTag("BigSnowball")) {
			isAttacking = false;
			ball = itemManager.GetItem();
			
			Debug.DrawRay(transform.position, transform.up * 50, Color.green);
			Debug.DrawRay(target.transform.position, transform.up * 50, Color.green);
			//if we don't have a ball go get it
			if (!ball) {
				//if the ball is already taken or we're out of ammo, return to check your other options
				if (BallRolledByFriend ()) {
					groundBaseFlag =  null;
					RemoveTarget();
					return;
				}
					
				//if an enemy is too close forget this stuff and attack!!
//				var enemy = teamAI.FindClosestEnemy();
//				if(Random.value > 0.8 && enemy && 
//					Vector3.Distance(enemy.transform.position, transform.position)< 2*attackDistance && 
//					FirstCloserThanSecond(enemy.transform.position, target.transform.position)) {
//					groundBaseFlag = null;
//					RemoveTarget();
//					return;
//				}
//				
				//var ballRadius = target.GetComponent(Renderer).bounds.size.x * 0.5;
				 //if we're close enough, try to get a hold of it
				MoveTowardsPosition(target.transform.position);
				
				var candidateItem = itemManager.GetCandidateItem();
				if(candidateItem && candidateItem.CompareTag("BigSnowball")) {
					motor.inputAction = true;
					motor.inputAltFire = false;
					moveDir = Vector3.zero;
					// find out where the closest base is
					groundBaseFlag = teamAI.GetClosestBase(candidateItem).transform.Find("TeamFlag");
				}
				else {
					motor.inputAction = false;
				}
				
				if (Random.value > 0.9) {
					enemy = teamAI.FindClosestEnemy();
					if (enemy && (enemy.transform.position - transform.position).magnitude < 2*attackDistance) {
						motor.inputAction = false;
						groundBaseFlag = null;
						RemoveTarget();
						return;
					}
				}
			}
			//if we have a ball run to base
			else if (ball.CompareTag("BigSnowball") && groundBaseFlag) { //but make sure we have a base
				//release the button, once the ball is yours
				motor.inputAction = false;
				
				if (ball.GetComponent(BigSnowBall).IsBallTooFarAway (gameObject)) {
					groundBaseFlag = null;
					RemoveTarget();
					itemManager.ReleaseItem();
					return;
				}
				
				//if you're out of ammo, just create a snow seurce with right mouse click					
				if (pStatus.GetCurrentSnowballs() == 0) { //RELOAD
					motor.inputAltFire = true;
					groundBaseFlag = null;
					RemoveTarget();
					return;
				}
				
//				busy = true;
					
				if(BallAtBase(groundBaseFlag.position)) {
					moveDir = Vector3.zero;
//					targets = [];
				}
				else {
					if (teamAI.WantsBazooka(gameObject) || ball.GetComponent(BigSnowBall).HasReachedFullSize() || Vector3.Distance(transform.position, groundBaseFlag.position)>attackDistance) {
						MoveTowardsPosition(groundBaseFlag.position);
					}
					else {
						// walk in circles, until the ball has full size
						var radiusWalk : float = attackDistance/2;
						MoveTowardsPosition(groundBaseFlag.position+radiusWalk*Vector3.Slerp((transform.position-groundBaseFlag.position).normalized,Vector3.Cross(groundBaseFlag.position-transform.position, Vector3.up).normalized, 0.1));
					}
					Debug.DrawRay(groundBaseFlag.position, transform.up * 50, Color.green);
				}
			}
			else itemManager.ReleaseItem();
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
	var shootDistance = punchRadius;
	var RL = null;
	
	while (true) {
		//if our target is dead, stop
//		if (!target || pStatus.GetCurrentSnowballs() == 0 || targetPlayer.IsDead()) { //RELOAD
		if (!target || targetPlayer.IsDead()) {
			RemoveTarget();
			return;
		}
		
		Debug.DrawRay(transform.position, transform.up * 50, Color.red);
		Debug.DrawRay(target.transform.position, transform.up * 50, Color.magenta);
		busy = true;
		
		pos = transform.position;
		pos.y = target.transform.position.y;
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
		//	moveDir = Vector3.zero;
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
			
			shootDistance = punchRadius;
			var weapon : GameObject = itemManager.GetItem();
			if (weapon && (weapon.CompareTag("Weapon") || weapon.CompareTag("Ufo"))) {
 				shootDistance *= 3;
	 			//get the closest enemy in a ufo if there is one
	 			tar = teamAI.GetClosestFlyingEnemy(gameObject);
	 			if (tar)
	 				target = tar;
			}
		 				
			
			//we're getting too close, move back!
			if (distanceToEnemy < shootDistance*0.1 && !pStatus.IsRidingUfo())
				backup = true;
			
			//we're far away now, move closer again
			if (backup && distanceToEnemy > shootDistance)
				backup = false;
				
			//if a bot is in a ufo and above an enemy, make him use the freeze ray
			if (pStatus.IsRidingUfo()) {
//				if(target.GetComponent(PlayerStatus).IsRidingUfo()) {
//					motor.inputFire = !motor.inputFire;
//				}
//			 	else 
				if (target.GetComponent(PlayerStatus) && AboveTarget() && Random.value > 0.7) {
			 		motor.inputAltFire = true;
//					motor.inputAltFire = !motor.inputAltFire;
			 	}
		 	}
		 	
		 	//we've turned our back and suffer a loss of memory
			if (lostSight && !pStatus.IsRidingUfo()) {
		 		moveDir = Vector3.zero;
		 		RemoveTarget();
		 		return;
		 	}
		 	
		 	//the enemy is riding a ufo.. desperate times call for desperate measures
		 	if (target.GetComponent(PlayerStatus) && target.GetComponent(PlayerStatus).IsRidingUfo() &&
		 		!pStatus.IsRidingUfo()) {
//	 		if (target.GetComponent(PlayerStatus) && !pStatus.IsRidingUfo()) {
		 		//if we have a bazooka, use it!
	 			//aim and then shoot
	 			//-------------------------
	 			//wait for a while and act as if you're aming
	 			//meanwhile always rotate towards the ufo
	 			//RotateTowardsPosition(target.transform.position, rotateSpeed)
	 			//when lock-time is over, shoot
	 			//motor.inputFire = !motor.inputFire;
		 		if (weapon && weapon.CompareTag("Weapon")) {
	 				RL = weapon.GetComponent(RocketLauncher);
		 			if(RL) {		 				 					
//		 				if(newTransform == null){
//		 					newTransform = target.transform;
//		 					target.GetComponent(PlayerStatus).isLockedTarget = true;
//		 				}
		 			  	//if(newTransform.position.x lostTarget){
		 			  	//	target.GetComponent(PlayerStatus).isLockedTarget = false;
		 			  	//	newTransform = null;
		 			  	//	lostTarget +=1;
		 				//}
		 				
		 			  	if (RL.getProgress() < RL.aimFor){
		 			  		RL.addToProgress(Time.deltaTime);
		 			  		
//		 			  		Debug.Log("NT:"+newTransform.position);
//		 			  		Debug.Log("lostLock:"+lostTarget);
		 			  		//transform.LookAt(target.transform);	//locked = true;
							//	RL.Fire(1);
							var angleY = Vector3.Angle(target.transform.position-transform.position, transform.forward);
		 			  		motor.Rotate (0, angleY);
						}else if (RL.getProgress() >= RL.aimFor){
							motor.inputFire = !motor.inputFire;
							//Debug.Log("SHOOT!!!!!!!!");
								//RL.Fire(2);
								target.GetComponent(PlayerStatus).isLockedTarget = false;
								//newTransform = null;
		 			  			//lostTarget = 0;
						}
		 			}		 			
		 		}
		 		else { //if there's a bazooka lying around, go get it!
		 			//hopefully do something useful in TeamAI!
//		 			shootDistance = punchRadius;
		 			RemoveTarget();
		 			return;
		 		}
		 	}


			if (RL && !RL.HasAmmo()) {
				itemManager.ReleaseItem();
				RemoveTarget();
				return;
			}
			//shoot and move around a bit ;)
//			if((pos - target.transform.position).magnitude - (target.transform.position.y - pos.y) < punchRadius
			if (distanceToEnemy < shootDistance && !RL) {
				//if (!pStatus.IsRidingUfo()) {
					if (!pStatus.IsRidingUfo() && (pStatus.GetCurrentSnowballs() == 0 || distanceToEnemy < punchRadius*0.3))
						motor.inputAltFire = !motor.inputAltFire;
					//either we're on foot, or we're in a ufo and so is our target
					else if (!pStatus.IsRidingUfo() || (pStatus.IsRidingUfo() && target.GetComponent(PlayerStatus).IsRidingUfo()))
						motor.inputFire = !motor.inputFire;
				//}
				
				direction = Vector3.left * strafing;
				if (Random.value > 0.9) {
					strafing = 0;
					var x = Random.value;
					if (x > 0.7) strafing = 1;
					if (x < 0.3) strafing = -1;
					if (x > 0.95) motor.inputJump = true;
				}
			}

			if (backup && !pStatus.IsRidingUfo())
				moveDir = -direction;
			else
				moveDir = direction;
			
//			if (Random.value > 0.99 && !pStatus.IsRidingUfo() && !itemManager.GetItem()) {
			if (Random.value > 0.999 && !itemManager.GetItem()) {
				RemoveTarget();
				return;
			}
		}

		// yield for one frame
		yield;
	}
	

	isAttacking = false;
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
	} else {
		// Just move forward at constant speed
		direction = transform.TransformDirection(Vector3.forward * attackSpeed);
	}
	moveDir = direction;
}

//TODO: not used??
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
	return (Vector3.Distance(botPos,enemyPos) < punchRadius);
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

function IsBusy () {
	return busy;
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