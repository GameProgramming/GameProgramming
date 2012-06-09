#pragma strict

private var game : GameStatus;
private var pStatus : PlayerStatus;
private var motor : CharacterMotorSF;

private var rotateSpeed : float;
private var moveSpeed : float;
private var move : float;

private var groundBase :Transform;
private var target : GameObject;
private var ball : GameObject;
@System.NonSerialized
var ballReachedBase : boolean;

function Start () {
	//game = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus);
	//pStatus = GetComponent(PlayerStatus);
	//motor = GetComponent(CharacterMotorSF);
	
//	var botAI = GetComponent(BotAI);
////	game = botAI.game;
//	pStatus = botAI.pStatus;
//	motor = botAI.motor;
//	
//	rotateSpeed = botAI.rotateSpeed;
//	moveSpeed = botAI.attackSpeed;
//	move = botAI.move;
//	
//	groundBase = pStatus.team.GetBase();
//	if (!groundBase)
//		Debug.Log("No ground base set!", this);
		
	ballReachedBase = false;
	ball = null;
}

function InitializeValues () {
	var botAI = GetComponent(BotAI);
//	game = botAI.game;
//	pStatus = botAI.pStatus;
//	motor = botAI.motor;
	
//	rotateSpeed = botAI.rotateSpeed;
//	moveSpeed = botAI.attackSpeed;
//	move = botAI.move;
	
	groundBase = pStatus.team.GetBase();
	if (!groundBase)
		Debug.Log("No ground base set!", this);
}

function Update () {
	if (!pStatus)
		return;
	//Get the target
	//target = gameObject.GetComponent(BotAI).GetTarget();
	if (target && target.CompareTag("BigSnowball")) {
		//if we don't have a ball go get it
		if (!ball) {
			motor.inputPush = true; //try to get a hold of it
			MoveTowards(target.transform.position);
		}
		//if we have a ball run to base
		else if (groundBase) { //but make sure we have a base
			Debug.Log("Go to base", this);
			MoveTowards(groundBase.position);
			if (ballReachedBase) {
				Debug.Log("Ball reached base", this);
				motor.inputPush = false;
				ballReachedBase = false; //is set to true in BigSnowBall when it has reached the base and respawns
				target = null;
				ball = null;
			}
		}
		
		motor.inputMoveDirection = Vector3.zero;
	}
}

function MoveTowards (position : Vector3) {
	var direction = position - transform.position;
	var dist = (direction).sqrMagnitude;
	
	var angle = Mathf.Abs(RotateTowardsPosition(position, rotateSpeed));
	if (Mathf.Abs(angle) > 2) //rotate towards ball
	{
		move = Mathf.Clamp01((90 - angle) / 90);
		// depending on the angle, start moving
		direction = transform.TransformDirection(Vector3.forward * moveSpeed * move);
		motor.inputMoveDirection = direction;//Vector3.zero;
		Debug.Log("1. direction : " + direction, this);
	} else {
		// Just move forward at constant speed
		direction = transform.TransformDirection(Vector3.forward * moveSpeed);
		motor.inputMoveDirection = direction;
		Debug.Log("2. direction : " + direction, this);
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

//function BallOfFriend ( t : Transform ) : boolean {
//    // Find all game objects with tag Enemy
//    var gos : GameObject[];
//    gos = GameObject.FindGameObjectsWithTag("Bot");  
//    var player = GameObject.FindGameObjectWithTag("Player");
//    gos = gos + [player];
//
//    var position = t.position; 
//    var diff;
//	var curDistance;
//	        
//    // Iterate through them and find the closest one
//    for (var go : GameObject in gos)  {
//    	var status = go.GetComponent(PlayerStatus);
//    	//get closest bot
//    	if (go != gameObject && status != null && status.team.Friendly(pStatus.team)) {
//	        diff = (go.transform.position - position);
//	        curDistance = diff.sqrMagnitude; 
//	        if (curDistance < 5) { 
//	            return true;
//	        } 
//        }
//    }
//    return false;
//}

function GetBall () : GameObject {
	ball = motor.GetBall();
		
	return ball;
}

//function RollBall ()
//{
//	var angle : float;
//	angle = 180.0;
//	var direction : Vector3;
//	var ball : GameObject;
//	
//	while (true) {
//		//TODO: HIER ABBRECHEN, FALLS DIE KUGEL BEREITS AM ZIEL IST!!
//		var baseDir : Vector3 = (groundBase.transform.position - target.transform.position).normalized;
//		var movePos : Vector3 = target.transform.position - 2*baseDir;
//		var pos = transform.position;
//		var dist = (pos - movePos).sqrMagnitude;
//		var tar;
//		
//		if (Random.value > 0.95 && BallOfFriend(target.transform))
//			return;
//		
//		motor.inputPush = true;
//		ball = motor.GetBall();
//		
//		if (!ball) {
//			if (!target.CompareTag("BigSnowball")) { //we've lost the ball somewhere on the way
//				tar = FindBestBigSnowball();//FindClosestEnemy();
//				if (tar)
//					target = tar;
//			}
//				
//			// needs to approach...
//			angle = Mathf.Abs(RotateTowardsPosition(movePos, rotateSpeed));
//			if (Mathf.Abs(angle) > 2) //rotate towards ball
//			{
//				move = Mathf.Clamp01((90 - angle) / 90);
//				// depending on the angle, start moving
//				direction = transform.TransformDirection(Vector3.forward * attackSpeed * move);
//				motor.inputMoveDirection = Vector3.zero;
//			} else {
//				// Just move forward at constant speed
//				direction = transform.TransformDirection(Vector3.forward * attackSpeed);
//				motor.inputMoveDirection = direction;
//			}
////			if (dist < 20) { //jump over ball
////				var off : Vector3 = (pos - movePos).normalized;
////				if ((off - baseDir).sqrMagnitude < 0.3) {
////					motor.inputJump = true;
////				}
////			}
//			if (Random.value > 0.9) {
//				motor.inputPush = false;
//				tar = FindClosestEnemy();
//				var oldTar = target;
//				if (tar != null && (tar.transform.position - pos).magnitude < attackDistance) {
//					target = tar;
//					yield Attack();
//					target = oldTar;
//				}
//			}
//		} else if (ball && motor.pushing) {
//			// needs to push!
//			//set base as target
//			target = groundBase.gameObject;
//			
//			angle = Mathf.Abs(RotateTowardsPosition(target.transform.position, rotateSpeed));
//			if (Mathf.Abs(angle) > 2) {
//				move = Mathf.Clamp01((90 - angle) / 90);
//				
//				// depending on the angle, start moving
//				direction = transform.TransformDirection(Vector3.forward * attackSpeed * move);
//				motor.inputMoveDirection = Vector3.zero;
//			}
//			else {
//				//motor.inputFire = true;
////				motor.inputPush = true;
//				direction = transform.TransformDirection(Vector3.forward * attackSpeed);
//				motor.inputMoveDirection = Vector3.zero;
//				//motor.inputMoveDirection = direction;
//			}
//			
//			if (Random.value > 0.9) {
//				motor.inputPush = false;
//				tar = FindClosestEnemy();
//				oldTar = target;
//				if (tar != null && (tar.transform.position - pos).magnitude < attackDistance / 2) {
//					target = tar;
//					yield Attack();
//					target = oldTar;
//				}
//			}
//			
//		}
//		// We are not actually moving forward.
//		// This probably means we ran into a wall or something. Stop attacking the player.
////		if (motor.movement.velocity.magnitude < attackSpeed * 0.3)
////			break;
//		
//		// yield for one frame
//		yield;
//	}
//	
//
//	isAttacking = false;
//	motor.inputMoveDirection = Vector3.zero;
//	
//}