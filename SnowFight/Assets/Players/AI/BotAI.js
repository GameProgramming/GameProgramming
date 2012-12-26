var rotateSpeed = 120.0;
var attackDistance = 20.0;

var attackSpeed = 1.0;

var shootRadius = 15;
var punchRadius = 4;

private var attackAngle = 10.0;

// Cache a reference to the motor
private var motor : CharacterMotorSF;
private var pStatus : PlayerStatus;
private var itemManager : ItemManager;

private var strafing = 0.0;
private var moveDir = Vector3.zero;

private var stuck : boolean = false;
private var stuckTime : float = 0.0;
var timeoutWhenStuck : float = 0.5;
private var alternateDir = Vector3.zero;

private var busy : boolean = false;
private var teamAI : TeamAI;
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
	
	// lets spawn...
	yield Spawn();
	
	yield Idle();
}

function OnJoinTeam (t :Team) {
	teamAI = t.gameObject.GetComponent(TeamAI);
}

function Spawn () {
	while (pStatus.IsDead()) {
		if (teamAI && pStatus.GetSpawnBaseID() < 0) {
			var spawnBase = teamAI.GetClosestOwnBase (gameObject);
			if (spawnBase)
				pStatus.SetSpawnBaseID(spawnBase.GetComponent(TeamBase).GetID());
		}
		yield;
	}
	Debug.Log(pStatus.playerName+" spawned.");
}

function Idle ()
{
	var whileCounter = 0;

	while (true)
	{
		whileCounter++;
		moveDir = Vector3.zero;
		
		if (pStatus.IsRidingUfo()) {
			yield AirIdle();
		} else if (itemManager.GetItem()) {
			if (itemManager.GetItem().CompareTag("BigSnowball")) {
				yield RollBall();
			} else if (itemManager.GetItem().CompareTag("Weapon")) {
				yield AntiAir();
			}
		} else {
			var targets :GameObject[] = teamAI.GetTargets(gameObject);
			if (targets != null && targets.Length > 0) {
				var target = targets[Random.Range(0,targets.Length)];
				if (target) {
					Debug.Log(pStatus.playerName+" : "+target.ToString());
					if(target.CompareTag("SnowballRessource")) {
						yield ObtainAmmo(target);
					} else if (target.CompareTag("BigSnowball")
							|| 	target.CompareTag("Ufo")
							||	target.CompareTag("Weapon") ) {
						yield ObtainItem(target);
					} else if (target.CompareTag("Base")) {
						yield ConquerBase(target);
					} else {
						Debug.Log("Tag not recognized!", this);
					}
				}
			}
		}
		yield;
	}
} 

function Update () {
	//we're probably not moving forward although we want to
	if (moveDir != Vector3.zero && Time.time > (stuckTime + timeoutWhenStuck) 
		&& motor.movement.velocity.magnitude < attackSpeed * 0.1) {
		
		if (!stuck) { //strafe, or change direction
			stuck = true;
			if (Random.value > 0.5)
				alternateDir = Vector3.Cross(moveDir, Vector3.up); //strafe to left
			else
				alternateDir = Vector3.Cross(Vector3.up, moveDir); //strafe to right
		} else { //this has happened before..strafing might not have worked, so walk backwards
			alternateDir.x = -moveDir.x;
			alternateDir.y = moveDir.y;
			alternateDir.z = -moveDir.z;
		}
		stuckTime = Time.time;
	} else {
		stuck = false;
	}
	
	if(Time.time < (stuckTime + timeoutWhenStuck))
		motor.inputMoveDirection = alternateDir;
	else
		motor.inputMoveDirection = moveDir;
}



function FindSnowResource () : GameObject {

	var closest = teamAI.GetClosestObjectInArray(gameObject, teamAI.GetSnowRessources());

	var ball = teamAI.GetClosestObjectInArray(gameObject, teamAI.GetSnowBalls());
	
	if (ball && FirstCloserThanSecond(ball.transform.position,  closest.transform.position))
		closest = ball;
    	
    return closest;  
}

function AirIdle() {
	var tar :GameObject = null;
	while (pStatus.IsRidingUfo()) {
		motor.inputFire = false;
		motor.inputAltFire = false;
		if (tar && tar.GetComponent(PlayerStatus).IsDead()) {
			tar == null;
		}
		if(tar == null) {
			var enemy = teamAI.GetClosestFlyingEnemy(gameObject);
			if(enemy && Vector3.Distance(enemy.transform.position, transform.position) < attackDistance*2) {
				tar = enemy;
			} else {
				enemy = teamAI.FindClosestEnemy(gameObject);
				if(enemy && Vector3.Distance(enemy.transform.position, transform.position)) {
					tar = enemy;
				}
			}
		} else {
			if (tar.GetComponent(PlayerStatus) && tar.GetComponent(PlayerStatus).IsRidingUfo()) {
				// air-air
				distanceToEnemy = Vector3.Distance(transform.position, tar.transform.position);
				angle = Mathf.Abs(RotateTowardsPosition(tar.transform.position, rotateSpeed));
				if (angle > 5) { // if were not yet pointed towards our target		
					move = Mathf.Clamp01((90 - angle) / 90);
					direction = transform.TransformDirection(Vector3.forward * attackSpeed * move);
				} else { // = looking at enemy
					direction = transform.TransformDirection(Vector3.forward * attackSpeed);
					
					if (distanceToEnemy < shootRadius*0.3)
						backup = true;
					if (distanceToEnemy > shootRadius)
						backup = false;
				 	
				 	if (distanceToEnemy < shootRadius) {
						motor.inputFire = true;
						
						if (Random.value > 0.9) {
							strafing = 0;
							var x = Random.value;
							if (x > 0.7) strafing = 1;
							if (x < 0.3) strafing = -1;
						}
						if (Mathf.Abs(distanceToEnemy-shootRadius*.5) < shootRadius * .2) {
							direction = Vector3.left * strafing;
						}
					}
				}
				if (backup)
					moveDir = -direction;
				else
					moveDir = direction;
			} else {
				// air-ground
				MoveTowardsPosition(tar.transform.position);
				if (AboveTarget(tar)) {
					motor.inputAltFire = true;
				}
			}
		}
		yield;
	}
}

function PressInputAction (time :float) {
	motor.inputAction = true;
	yield WaitForSeconds(time);
	motor.inputAction = false;
}

function AntiAir() {
	var tar :GameObject = null;
	while (true) {
		motor.inputFire = false;
		motor.inputAltFire = false;
		
		var weapon :GameObject = itemManager.GetItem();
		if (!(weapon && weapon.CompareTag("Weapon")))
			break;
		
		var RL = weapon.GetComponent(RocketLauncher);
		if (RL == null || !RL.HasAmmo()) {
			if (RL) yield PressInputAction(0.01);
			break;
		}
		
		if (tar && tar.GetComponent(PlayerStatus).IsDead()) {
			tar == null;
		}
		if(tar == null) {
			var enemy = teamAI.GetClosestFlyingEnemy(gameObject);
			if(enemy) {
				tar = enemy;
			} else {
				// no flying enemies... throw the rocket launcher away.
				yield PressInputAction(0.01);
				return;
			}
		} else {
	 		if (tar.GetComponent(PlayerStatus) && tar.GetComponent(PlayerStatus).IsRidingUfo()) {
				// ground-air
				distanceToEnemy = Vector3.Distance(transform.position, tar.transform.position);
				angle = Mathf.Abs(RotateTowardsPosition(tar.transform.position, rotateSpeed));
				if (angle > 10) { // if were not yet pointed towards our target		
					move = Mathf.Clamp01((90 - angle) / 90);
					direction = transform.TransformDirection(Vector3.forward * attackSpeed * move);
				} else { // = looking at enemy
					direction = transform.TransformDirection(Vector3.forward * attackSpeed);
					
					if (distanceToEnemy < shootRadius*0.3)
						backup = true;
					if (distanceToEnemy > shootRadius)
						backup = false;
				 	
				 	if (distanceToEnemy < shootRadius) {
						if (Random.value > 0.9) {
							strafing = 0;
							var x = Random.value;
							if (x > 0.7) strafing = 1;
							if (x < 0.3) strafing = -1;
						}
						if (Mathf.Abs(distanceToEnemy-shootRadius*.5) < shootRadius * .2) {
							direction = Vector3.left * strafing;
						}
					}
					
	 				var angleY = 0.0;
	 			  	if (RL.getProgress() <= RL.aimFor){
	 			  		RL.addToProgress(Time.deltaTime);
						angleY = Vector3.Angle(tar.transform.position-transform.position, transform.forward);
	 			  		motor.Rotate (0, angleY);
					} else {
						RL.SetTarget(tar);
						motor.inputFire = !motor.inputFire;
						tar.GetComponent(PlayerStatus).isLockedTarget = false;
					}
				}
				if (backup)
					moveDir = -direction;
				else
					moveDir = direction;
			} else {
				tar = null;
			}
		}
		yield;
	}
	StopAction();
}

function ConquerBase(tar :GameObject) {
	var alreadyThere : boolean = false;
	var arrivalTime : float;
	var patience : float;
	var flagPosition : Vector3;
	
	while (true) {
		var team = tar.transform.parent;
		if (!team || team.GetComponent(Team).GetTeamNumber() == pStatus.GetTeamNumber()) {
			//leave once the base is conquered
			RemoveTarget();
			return;
		}
		
		yield SelfDefense();
		
		//if an enemy is too close forget this stuff and attack!!
		if(Random.value > 0.8) {
			var enemy = teamAI.FindClosestEnemy(gameObject);
			if(enemy && Vector3.Distance(enemy.transform.position, transform.position)< attackDistance*2) {
				yield Attack(enemy);
			}
		}
		
		if(Random.value > 0.995) {
			RemoveTarget();
			return;
		}
		
		if (alreadyThere) {
			if (Time.time > arrivalTime+patience || !tar.GetComponent(TeamBase).IsBeingTaken()) {
				alreadyThere = false;
				RemoveTarget();
				return;
			}
		} else {
			Debug.DrawRay(transform.position, transform.up * 50, Color.black);
			
			flagPosition = tar.transform.Find("TeamFlag").position;
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

function ObtainItem (tar :GameObject) {
	motor.inputAction = false;
	while (true) {
		if (!tar) {
			return;
		}
		
		var pos = tar.transform.position;
		pos.y = transform.position.y;
		MoveTowardsPosition(pos);
		
//		if (Vector3.Distance(transform.position, tar.transform.position) < 10) {
//			itemManager.ReleaseItem();
//		}
		var candidateItem = itemManager.GetCandidateItem();	
		if (candidateItem && (candidateItem == tar || candidateItem.transform.parent
							     && candidateItem.transform.parent.gameObject == tar)) {
			motor.inputAltFire = false;
			yield PressInputAction(0.01);
			RemoveTarget();
			return;
		}
		
		//if an enemy is too close forget this stuff and attack!!
		if(Random.value > 0.8) { 
			var enemy = teamAI.FindClosestEnemy(gameObject);
			if (enemy && Vector3.Distance(enemy.transform.position, transform.position)< 2*attackDistance && 
				FirstCloserThanSecond(enemy.transform.position, tar.transform.position)) {
				RemoveTarget();
				return;
			}
		}
		
		//if target is a ufo and someone's already in it, forget it
		if (tar.CompareTag("Ufo") && tar.GetComponent(Ufo).GetOwner()
		  || tar.CompareTag("BigSnowball") && BallRolledByOther(tar)) {
			RemoveTarget();
			return;
		}
		yield;
	}
}

function ObtainSomeAmmo () {
	while (pStatus.GetCurrentSnowballs() < 2) {
		var snowRes :GameObject = FindSnowResource();
		if (snowRes) {
			ObtainAmmo(snowRes);
		} else {
			return;
		}
		yield;
	}
}

function ObtainAmmo (tar :GameObject) :IEnumerator {
	var alreadyThere : boolean = false;
	var arrivalTime : float;
	var reloadTime : float;
	
	while (true) {
		if (!tar) {
			RemoveTarget();
			return;
		}
		
		busy = true;
		Debug.DrawRay(transform.position, transform.up * 50, Color.cyan);
		Debug.DrawRay(tar.transform.position, transform.up * 50, Color.cyan);
		
		// if we run into a big snowball take that as snow resource.
		if (itemManager.GetCandidateItem() &&
			itemManager.GetCandidateItem().CompareTag("BigSnowball")) {
			yield PressInputAction(0.1);
			if (itemManager.GetItem() && itemManager.GetItem().CompareTag("BigSnowball")) {
				yield RollBall();
				yield WaitForSeconds(0.5);
				RemoveTarget();
				return;
			}
		}
		if (alreadyThere) {
			if (tar.CompareTag("BigSnowball")) {
			 	//we actually wanted to get some big snowball but apparently failed.
			 	return;
			}
			if (((teamAI.WantsSpecialWeapon(gameObject)
					&& pStatus.GetCurrentSnowballs() == pStatus.GetMaximumSnowballs() )
				|| teamAI.WantsBazooka(gameObject)) 
				&& tar.GetComponent(SnowRessource).IsGrabBigSnowballPossible()) {
				yield PressInputAction(GetComponent(ItemManager).srPickTime+0.1);
				RemoveTarget();
				yield RollBall();
				return;
			}
			
			if (pStatus.GetCurrentSnowballs() == pStatus.GetMaximumSnowballs()
				|| Time.time > arrivalTime+reloadTime
				|| !tar.GetComponent(SnowRessource).IsGrabPossible()) {
				alreadyThere = false;
				RemoveTarget();
				return;
			}
		} else {
			if (tar.CompareTag("BigSnowball") && BallRolledByOther(tar)) {
			 	//we actually wanted to get some big snowball but apparently somebody else took it.
			 	RemoveTarget();
			 	return;
			}
			if (Vector3.Distance(transform.position, tar.transform.position) >= .5) {
				MoveTowardsPosition(tar.transform.position);
			} else {
				alreadyThere = true;
				arrivalTime = Time.time;
				reloadTime = Random.Range(1.0,2.0);
				moveDir = Vector3.zero;
			}
		}
		motor.inputAltFire = false;
		motor.inputFire = false;
		yield;
	}
}

function SelfDefense () {
	var a = pStatus.GetLastAttack();
	if (a != null && (Time.time - a.time)<1 && a.attacker != null 
				&& !teamAI.IsAFriend(a.attacker)
				&& !a.attacker.GetComponent(PlayerStatus).IsRidingUfo()) {
		yield Attack(a.attacker);
	}
	return;
}

function IsUnderAttack () :boolean {
	var attack = pStatus.GetLastAttack();
	return attack != null && (Time.time - attack.time)<.2
		&& attack.attacker != null && !teamAI.IsAFriend(attack.attacker);
}

function RollBall ()
{
	var groundBaseFlag :Transform = teamAI.GetClosestBase(gameObject).transform.Find("TeamFlag");
	var ball = null;
	while (true) {
		ball = itemManager.GetItem();
		// we should have some ball we roll for this behavior to make any sense.
		if (ball == null || !ball.CompareTag("BigSnowball"))
			return;
		
		//if you're out of ammo, just create a snow resource				
		if (pStatus.GetCurrentSnowballs() == 0) {
			motor.inputAltFire = true;
			moveDir = Vector3.zero;
			yield WaitForSeconds(2.5);
			RemoveTarget();
			return;
		}
		
		if(IsUnderAttack()) {
			targets = [];
//			if (ball) itemManager.ReleaseItem();
			if (ball) {
				yield PressInputAction(0.01);
			}
			yield SelfDefense();
			RemoveTarget();
			return;
		} else if (groundBaseFlag) { //make sure we have a base
			if(ball.GetComponent(BigSnowBall).HasReachedBase()) {
				moveDir = Vector3.zero;
				targets = [];
				RemoveTarget();
				moveDir = Vector3.zero;
				yield WaitForSeconds(2.5);
				return;
			} else {
				if (teamAI.WantsBazooka(gameObject)
					|| ball.GetComponent(BigSnowBall).HasReachedFullSize()
					|| Vector3.Distance(transform.position, groundBaseFlag.position)>attackDistance) {
					MoveTowardsPosition(groundBaseFlag.position);
				} else {
					// walk in circles, until the ball has full size
					var radiusWalk : float = attackDistance/2;
					MoveTowardsPosition(groundBaseFlag.position+radiusWalk
							*Vector3.Slerp(
									(transform.position-groundBaseFlag.position).normalized,
									Vector3.Cross(groundBaseFlag.position-transform.position, Vector3.up).normalized,
									0.1));
				}
				Debug.DrawRay(groundBaseFlag.position, transform.up * 50, Color.green);
			}
		} else {
			moveDir = Vector3.zero;
			yield PressInputAction(1);
			RemoveTarget();
			return;
		}
		yield;
	}
}

function Attack (tar :GameObject)
{
	motor.inputAction = false;
	
	var targetPlayer : PlayerStatus = tar.GetComponent(PlayerStatus);
	
	var angle : float = 180.0;
	var direction : Vector3 = Vector3.zero;
	
	var pos : Vector3 = Vector3.zero;
	var distanceToEnemy : float = 0.0;
	var shootDistance = shootRadius;
	
	while (true) {
		//if our target is dead, stop
		if (!tar || targetPlayer.IsDead()) {
			StopAction();
			return;
		}
		if (pStatus.GetCurrentSnowballs() == 0) {
			//close combat!
			shootDistance = punchRadius;
			//or go get new ammo
			if (Random.value > 0.99) {
				yield ObtainSomeAmmo();
			}
		} else {
			shootDistance = shootRadius;
		}
		
		Debug.DrawRay(transform.position, transform.up * 50, Color.red);
		Debug.DrawRay(tar.transform.position, transform.up * 50, Color.magenta);
		busy = true;
		
		pos = transform.position;
		pos.y = tar.transform.position.y;
		distanceToEnemy = Vector3.Distance(pos, tar.transform.position);
		tarpos = tar.transform.position;

		angle = Mathf.Abs(RotateTowardsPosition(tar.transform.position, rotateSpeed));
		
		if (angle > 5) { // if were not yet pointed towards our target		
			move = Mathf.Clamp01((90 - angle) / 90);
			//move slower depending on angle.
			direction = transform.TransformDirection(Vector3.forward * attackSpeed * move);
		} else { // = looking at enemy
			// Just move forward at constant speed
			direction = transform.TransformDirection(Vector3.forward * attackSpeed);
			
			//we're getting too close, move back!
			if (distanceToEnemy < shootDistance*0.1)
				backup = true;
			//we're far away now, move closer again
			if (distanceToEnemy > shootDistance)
				backup = false;
		 	
		 	//the enemy is riding a ufo.. desperate times call for desperate measures
		 	if (tar.GetComponent(PlayerStatus) && !pStatus.IsRidingUfo()
		 		&& tar.GetComponent(PlayerStatus).IsRidingUfo()) {
		 		StopAction();
				return;
		 	}
		 	
		 	motor.inputFire = false;
		 	motor.inputAltFire = false;
		 	//shoot and move around a bit ;)
			if (distanceToEnemy < shootDistance) {
				if (pStatus.GetCurrentSnowballs() == 0 || distanceToEnemy < punchRadius) {
					motor.inputAltFire = true;
				} else {
 			  		var v :Vector3 = motor.GetSnowballVelocity();
 			  		var bspeed :float = v.magnitude;
 			  		var btime :float = distanceToEnemy / bspeed;
 			  		var estY :float = transform.position.y + btime * v.y
 			  						+ btime * btime * .5 * Physics.gravity.y;
 			  		if (estY > tarpos.y) motor.Rotate(0,-100*Time.deltaTime);
 			  		if (estY < tarpos.y) motor.Rotate(0, 100*Time.deltaTime);
					motor.inputFire = !motor.ReadyToThrow();
				}
				
				if (Random.value > 0.9) {
					strafing = 0;
					var x = Random.value;
					if (x > 0.7) strafing = 1;
					if (x < 0.3) strafing = -1;
					if (x > 0.95) motor.inputJump = true;
				}
				if (Mathf.Abs(distanceToEnemy-shootDistance*.5) < shootDistance * .2) {
					direction = Vector3.left * strafing;
				}
			}

			if (backup)
				moveDir = -direction;
			else
				moveDir = direction;
		}
		yield;
	}
	
	StopAction();
	
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

function MoveTowardsPosition (position : Vector3) {
	position = Vector3(position.x, transform.position.y, position.z);
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

function BallRolledByOther (ball :GameObject) : boolean {
	return ball && ball.CompareTag("BigSnowball")
			&& ball.GetComponent(BigSnowBall).IsHeld()
			&& !ball.GetComponent(BigSnowBall).IsHeldBy(gameObject);
}

function AboveTarget(tar :GameObject) {
	var botPos = transform.position;
	var enemyPos = tar.transform.position;
	botPos.y = enemyPos.y;
	return (Vector3.Distance(botPos,enemyPos) < punchRadius);
}

function RemoveTarget () {
	StopAction();
}

function StopAction () {
	moveDir = Vector3.zero;
	if (this.enabled) {
		busy = false;
		if (motor) {
			motor.inputAltFire = false;
			motor.inputFire = false;
			motor.inputAction = false;
		}
	}
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
	RemoveTarget();
	if (this.enabled) StartCoroutine("Start");
}


@script RequireComponent (CharacterMotorSF)
@script RequireComponent (ItemManager)