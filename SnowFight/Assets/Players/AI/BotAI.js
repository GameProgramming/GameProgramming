var attackTurnTime = 0.7;
var rotateSpeed = 120.0;
var attackDistance = 20.0;
var extraRunTime = 2.0;

var attackSpeed = 1.0;
var attackRotateSpeed = 20.0;

var idleTime = 1.6;

var punchRadius = 7.1;

private var attackAngle = 10.0;
private var isAttacking = false;

private var target : GameObject;

// Cache a reference to the motor
private var motor : CharacterMotorSF;
private var pStatus : PlayerStatus;
private var itemManager : ItemManager;

private var groundBase :Transform;

private var strafing = 0.0;
private var moveDir = Vector3.zero;

private var ball : GameObject;
//@System.NonSerialized
//var ballReachedBase : boolean = false;

function Start ()
{
	yield WaitForSeconds(Random.value);
	var game : GameStatus = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus);
	
	groundBase = pStatus.team.GetBase();
		
	// Just attack for now
//	while (true)	
//	{
//		// Don't do anything when idle. And wait for player to be in range!
//		// This is the perfect time for the player to attack us
		yield Idle();
//	}
}

function Awake () {
	motor = GetComponent(CharacterMotorSF);
	pStatus = GetComponent(PlayerStatus);
	itemManager = GetComponent(ItemManager);
}

function Update () {
	//if (target && target.CompareTag("BigSnowball"))
		motor.inputMoveDirection = moveDir;
	
}

function Idle ()
{
	
	// Don't do anything when idle
	// The perfect time for the player to attack us
	yield WaitForSeconds(idleTime);

	// And if the player is really far away.
	// We just idle around until he comes back
	// unless we're dying, in which case we just keep idling.
	while (true)
	{
		moveDir = Vector3.zero;
		itemManager.ReleaseItem();
		yield WaitForSeconds(0.2);
		
		var tar = FindBestBigSnowball();//FindClosestEnemy();
		if (tar != null) {
			target = tar;
			yield RollBall();
		}
		else {
			tar = FindClosestEnemy();
			if (tar != null) {
				target = tar;
				yield Attack();
			}
		}
	}
} 

function RollBall ()
{
	while (true) {
		motor.inputAction = false;
		
		if (!target)
			return;
			
		//if target is a ball
		if (target && target.CompareTag("BigSnowball")) {
			if (Random.value > 0.95 && BallOfFriend(target.transform))
				return;
			
			isAttacking = false;
			ball = itemManager.GetItem();
			//if we don't have a ball go get it
			if (!ball) {
				if (BallRolledByFriend ())
					return;
				
				var ballSize = target.GetComponent(Renderer).bounds.size.x;
				 //if we're close enough, try to get a hold of it
				if (Vector3.Distance(transform.position, target.transform.position) < ballSize + 2)
					motor.inputAction = true;
				else
					motor.inputAction = false;
					
				MoveTowardsPosition(target.transform.position);
			}
			//if we have a ball run to base
			else if (ball.CompareTag("BigSnowball") && groundBase) { //but make sure we have a base
				if(BallAtBase(groundBase.position))
					moveDir = Vector3.zero;
				else
					MoveTowardsPosition(groundBase.position);
			}
			
			if (Random.value > 0.9) {
				motor.inputAction = false;
				tar = FindClosestEnemy();
				var oldTar = target;
				if (tar && (tar.transform.position - transform.position).magnitude < attackDistance) {
					target = tar;
					Attack();
					if(!target || target.GetComponent(PlayerStatus).IsDead())
						target = oldTar;
				}
			}
		}
		yield;
	}
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
	transform.Rotate(0, clampedAngle, 0);
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

function FindBestBigSnowball () : GameObject {
    // Find all game objects with tag Enemy
    var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag("BigSnowball"); 
    
    var closest : GameObject;
    var distance = Mathf.Infinity; 
    var position = transform.position; 
    var diff;
	var curDistance;
	        
    // Iterate through them and find the closest one
    for (var go : GameObject in gos)  { 
    	diff1 = (go.transform.position - position);
    	diff2 = (go.transform.position - groundBase.position);
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

function BallOfFriend ( t : Transform ) : boolean {
    // Find all game objects with tag Enemy
    var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag("Bot");  
    var player = GameObject.FindGameObjectWithTag("Player");
    gos = gos + [player];

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

function Attack ()
{
	motor.inputAction = false;
			
	isAttacking = true;
	
	// First we wait for a bit so the player can prepare while we turn around
	// As we near an angle of 0, we will begin to move
	var angle : float;
	angle = 180.0;
	var time : float;
	time = 0.0;
	var direction : Vector3;
	
	var targetPlayer : PlayerStatus;
	targetPlayer = target.GetComponent(PlayerStatus);
	
	// Run towards player
	var timer = 0.0;
	var lostSight = false;
	
	while (true) {
		if (!target)
			return;
	
		//if (targetPlayer.IsDead()) return;
	
		angle = Mathf.Abs(RotateTowardsPosition(target.transform.position, rotateSpeed));
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
	
			// Keep looking if we are hitting our target
			// If we are, knock them out of the way dealing damage
			var pos = transform.position;
			if(!lostSight && (pos - target.transform.position).magnitude - (target.transform.position.y - pos.y) < punchRadius)
			{
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
			if (lostSight) direction = Vector3.zero;
			
//			motor.inputMoveDirection = direction;
			moveDir = direction;
		}
		
		if (Random.value > 0.99) {
			target = null;
			return;
//			motor.inputAction = false;
//			tar = FindClosestEnemy();
//			var oldTar = target;
//			if (tar && (tar.transform.position - transform.position).magnitude < attackDistance) {
//				target = tar;
//				Attack();
//				if(target.GetComponent(PlayerStatus).IsDead())
//					target = oldTar;
//			}
		}
		// We are not actually moving forward.
		// This probably means we ran into a wall or something. Stop attacking the player.
//		if (motor.movement.velocity.magnitude < attackSpeed * 0.3)
//			break;
		
		// yield for one frame
		yield;
	}
	

	isAttacking = false;
	//motor.inputMoveDirection = Vector3.zero;
	moveDir = Vector3.zero;
	
}

function ApplyDamage ()
{
	
}

// Find the name of the closest enemy within distance
function FindClosestEnemy () : GameObject {
    // Find all game objects with tag Enemy
    var gos : GameObject[];
    gos = GameObject.FindGameObjectsWithTag("Bot"); 
    var player = GameObject.FindGameObjectWithTag("Player");
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
    
    //check if player might be enemy and is closer
    if (player.GetComponent(PlayerStatus) && !player.GetComponent(PlayerStatus).team.Friendly(pStatus.team)) {
    		diff = (player.transform.position - position);
        	curDistance = diff.sqrMagnitude; 
        if (curDistance < distance) { 
            closest = player; 
            distance = curDistance; 
        } 
    }
    
    if (closest)
    	itemManager.ReleaseItem();
    	
    return closest;    
}

//function BallReachedBase (reached : boolean) {
//	ballReachedBase = reached;
//}

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

@script RequireComponent (CharacterMotorSF)
@script RequireComponent (ItemManager)