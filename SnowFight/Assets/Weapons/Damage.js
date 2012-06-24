var frontDamage : int;
var behindDamage : int;
var headDamage : int; 
var dmg : int = 2;

enum DamageType {Direct = 1, Area = 2, Physical = 3, Crash = 4}
// direct - schneeball, area - ??, physical - schneeball, crash - ufo.

var type : DamageType;

function Start(){
	type = DamageType.Direct;
	if (gameObject.GetComponent("Projectile")) {
		dmg = gameObject.GetComponent("Projectile").dmg;
		frontDamage = dmg;
		behindDamage = dmg * 1.5;
	 	headDamage = dmg * 3;
 	} else {
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

function GetShooter () : GameObject {
	var parent = transform.parent;
	if (parent)
		return parent.gameObject;
	else
		return null;
}