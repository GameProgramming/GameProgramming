
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
		player.collider.enabled = false;
		while(Mathf.Abs(player.transform.position.x-stopX) + Mathf.Abs(player.transform.position.y - stopY) > 0.4 ){//|| Round(playerPos.z) != stopZ){
		
			player.transform.LookAt(Vector3(stopX, stopY, stopZ));
			player.transform.position += player.transform.forward * Time.deltaTime*10;
//			if (player.transform.position.x < stopX ){
//				player.transform.position.x += Time.deltaTime*10;
//			}
//			else if (player.transform.position.x > stopX){
//			  	player.transform.position.x -= Time.deltaTime*10;
//			}
//			if (player.transform.position.y < stopY ){
//				player.transform.position.y += Time.deltaTime*10;
//			}
//			else if (player.transform.position.y > stopY){
//			  	player.transform.position.y -= Time.deltaTime*10;
//			}
			//Debug.Log(Round(player.transform.position.x));
			yield;
			
		}
		player.collider.enabled = true;
//				player.transform.position.x = stopX;
//				player.transform.position.y = stopY;
		
		textDisplay.text = "PlayerHit: "+  player.transform.position.x +" - Pipe start :"+ transform.position.x + " pipe end:  "+stopX ;
}

function Round(number : float) : float{
	roundNumber = (Mathf.Round(number * 10f) / 10f);
	return roundNumber;
}

function OnTriggerEnter(col : Collider) {
	
	if (col.gameObject.tag == "Player") {
		player = col.gameObject;
		if (player.GetComponent("EleManStats").element == "water") {
        //Physics.IgnoreLayerCollision (LayerMask.NameToLayer("Player"), LayerMask.NameToLayer("Grid"), true);
        	Flow(player);
        
        }
		//print("hit");
        
    }
}