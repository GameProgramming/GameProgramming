
// Whoever enters the DeathTrigger gets an OnDeath message sent to them.
// They don't have to react to it.
function OnTriggerEnter (other : Collider) {
	//~ playerLink=col.GetComponent (PlayerStatus);
	if (!other.GetComponent (PlayerStatus) && other.gameObject.tag == "Props") { // not the player or necessary props
		//destroy the object
		Destroy(other.gameObject);
	}
	else //otherwise tell the player to die
		other.gameObject.SendMessage ("OnDeath", SendMessageOptions.DontRequireReceiver);
}

// Helper function: Draw an icon in the sceneview so this object gets easier to pick
function OnDrawGizmos () {
	Gizmos.DrawIcon (transform.position, "Deathbox_Icon.tif");
}
