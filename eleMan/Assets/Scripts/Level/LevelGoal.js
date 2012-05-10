
private var playerLink : PlayerStatus;
function OnTriggerEnter (col : Collider) {
	Debug.Log("On Goal! ", this);
	playerLink=col.GetComponent (PlayerStatus);
	if (!playerLink) // not the player.
	{
		return;
	}
	else
	{
		playerLink.LevelCompleted(true);
	}
}

function OnTriggerExit (col : Collider) {
	playerLink=col.GetComponent (PlayerStatus);
	if (!playerLink) // not the player.
	{
		return;
	}
	else
	{
		playerLink.LevelCompleted(false);
	}
}

function Update () {
}