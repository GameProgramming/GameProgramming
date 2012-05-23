
var textDisplay : GUIText;


function Start() {
    if(GameObject.Find("Text Display")) {
	    textDisplay = GameObject.Find("Text Display").guiText;
	    textDisplay.text = "";
    } 
}

function Flow(player : GameObject) {
		
		for (var child : Transform in transform.parent) {
			if (child.tag == "PipeStop"){
				stopX = Round(child.transform.position.x );
				stopY = Round(child.transform.position.y );
				stopZ = Round(child.transform.position.z );
			
			}
		}
//		while(Round(player.transform.position.x) != stopX || Round(player.transform.position.y) != stopY ){//|| Round(playerPos.z) != stopZ){
//		
//			if (player.transform.position.x < stopX ){
//				player.transform.position.x += 0.1;
//			}
//			else if (player.transform.position.x > stopX){
//			  	player.transform.position.x -= 0.1;
//			}
//			if (player.transform.position.y < stopY ){
//				player.transform.position.y += 0.1;
//			}
//			else if (player.transform.position.y > stopY){
//			  	player.transform.position.y -= 0.1;
//			}
//			//Debug.Log(Round(player.transform.position.x));
//		
//			
//		}
				player.transform.position.x = stopX;
				player.transform.position.y = stopY;
		
		textDisplay.text = "PlayerHit: "+  player.transform.position.x +" - Pipe start :"+ transform.position.x + " pipe end:  "+stopX ;
}

function Round(number : float) : float{
	roundNumber = (Mathf.Round(number * 10f) / 10f);
	return roundNumber;
}

function OnTriggerEnter(col : Collider) {
	
	if (col.gameObject.tag == "Player") {
		player = col.gameObject;
        //Physics.IgnoreLayerCollision (LayerMask.NameToLayer("Player"), LayerMask.NameToLayer("Grid"), true);
        Flow(player);
        
        
		//print("hit");
        
    }
}