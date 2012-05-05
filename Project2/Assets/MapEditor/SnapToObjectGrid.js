//@MenuItem ("GameObject/Snap to Grid %g")
//static function MenuSnapToGrid()
@script ExecuteInEditMode()


// Just a simple script that snaps an object to its scale-size-grid.

function Update () 
{
	var transform : Transform = gameObject.transform;
	
	var scalex : float = 0.1;
	var scaley : float = 0.1;
	var scalez : float = 0.1;
	
	var newScale : Vector3 = transform.localScale;    
	
	if (newScale.x > 0 && newScale.y > 0 && newScale.z > 0 ){
		newScale.x = Mathf.Round(newScale.x / scalex) * scalex;
		newScale.y = Mathf.Round(newScale.y / scaley) * scaley;
		newScale.z = Mathf.Round(newScale.z / scalez) * scalez;
		transform.localScale = newScale;
	}else{
		newScale.x = 0.1;
		newScale.y = 0.1;
		newScale.z = 0.1;
		transform.localScale = newScale;
	} 
	
	var gridx : float = transform.localScale.x;
	var gridy : float = transform.localScale.y;
	var gridz : float = transform.localScale.z;
	
	if(GameObject.Find("Text Display")) {
		var textDisplay : GUIText;
        //textDisplay = GameObject.Find("Text Display").guiText;
	    //textDisplay.text = gridx + " , "+ gridy + " , "+gridz;
	       //textDisplay.text += scalex + " , "+ scaley + " , "+scalez;
	       //textDisplay.text += "newscale"+newScale;
    }
	var newPosition : Vector3 = transform.position;
	
	newPosition.x = Mathf.Round(newPosition.x / gridx) * gridx;
	newPosition.y = Mathf.Round(newPosition.y / gridy) * gridy;
	newPosition.z = Mathf.Round(newPosition.z / gridz) * gridz;
	transform.position = newPosition;
	   
      
}