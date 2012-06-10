var frontDamage : int;
var behindDamage : int;
var headDamage : int; 
var dmg : int;

private var team : Team; //team who shot and will get score increase

function Start(){
	dmg = gameObject.GetComponent("Projectile").dmg;
	frontDamage = dmg;
	behindDamage = dmg * 1.5;
 	headDamage = dmg * 3;
}

function GetFrontDamage () : int {
	return frontDamage;
}

function GetBehindDamage() : int {
	return behindDamage;
}

function GetHeadDamage() : int {
	return headDamage;
}

function GetShootingTeam () : Team {
	return team;
}


function GetShooter () : GameObject {
	var parent = transform.parent;
	if (parent != null)
		return parent.gameObject;
	else
		return null;
}