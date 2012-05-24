

function Start() {
	var levelStateMachine : LevelStatus = FindObjectOfType(LevelStatus);
    levelStateMachine.existingStars++;
}


function OnTriggerEnter(col : Collider) {
	
    if (col.gameObject.tag == "Player") {
        player = col.gameObject;
        var levelStateMachine : LevelStatus = FindObjectOfType(LevelStatus);
        levelStateMachine.collectedStars++;
    	EndStar();
    }
}

function EndStar() {
	GetComponent("Detonator").Explode();
    gameObject.active = false;
    yield WaitForSeconds(5);
	Destroy(transform.gameObject);
}