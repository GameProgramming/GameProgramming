var frontDamage : int = 5;
var behindDamage : int = 7;
var headDamage : int = 15; 
var dmg : int = 5;

private var team : Team; //team who shot and will get score increase

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