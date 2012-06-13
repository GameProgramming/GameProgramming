var frontDamage : int;
var behindDamage : int;
var headDamage : int; 
var dmg : int = 2;

private var team : Team; //team who shot and will get score increase

function Start(){
	if (gameObject.GetComponent("Projectile")) {
		dmg = gameObject.GetComponent("Projectile").dmg;
		frontDamage = dmg;
		behindDamage = dmg * 1.5;
	 	headDamage = dmg * 3;
 	}
 	else {
		frontDamage = dmg;
		behindDamage = dmg;
	 	headDamage = dmg;
 	}
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

function SetShootingTeam (t : Team) {
	team = t;
}

function GetShooter () : GameObject {
	var parent = transform.parent;
	if (parent)
		return parent.gameObject;
	else
		return null;
}