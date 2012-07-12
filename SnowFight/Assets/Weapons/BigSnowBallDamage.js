#pragma strict

var maximumDamage : int = 0;
var painfulSpeed : float = 2.0;
var speed : int = 5;

private var shooter : GameObject;
private var velocity : Vector3;
private var damage : int = 0;

function Start () {

}

function Update () {

}

function GetDamage() : int {
	damage = 0;
	//TODO.. no harm if shooter is hit by own ball
	if (GetVelocity().sqrMagnitude > painfulSpeed * painfulSpeed) {
		damage = Mathf.Round(maximumDamage * GetVelocity().magnitude/speed);
	}
//	Debug.Log("Velocity " + GetVelocity().magnitude + " damage " + damage, this);
	return Mathf.Min(maximumDamage, damage);
}

function GetShooter() : GameObject{
	return shooter;
}

function SetShooter(player : GameObject) {
	shooter = player;
}

function GetScoringTeam () : Team {
	return shooter.GetComponent(PlayerStatus).team;
}

//actual velocity
function GetVelocity() : Vector3{
	return gameObject.GetComponent(BigSnowBall).velocity;
}

function GetSpeed () : int{
	return speed * 10;
}