var rolloverText = "";
var rolloverColor = Color.red;
var originalColor = Color.brown;
private var textDisplay : GUIText;

function Start() {
    //originalColor = renderer.material.color;
    if (rolloverText == "") { rolloverText = gameObject.tag; }
    if(GameObject.Find("Text Display")) {
	    textDisplay = GameObject.Find("Text Display").guiText;
	    textDisplay.text = rolloverText;
    } 
}

function OnMouseEnter() {
	if (!textDisplay)
		return;
	    Debug.Log(gameObject.tag);
	    textDisplay.material.color = rolloverColor;
	    //textDisplay.text = rolloverText;
	    //if(gameObject.GetComponent("Player Status")){
	    //rolloverText = gameObject.GetComponent("PlayerStatus").fullHp;
	    textDisplay.text = rolloverText;//gameObject.GetComponent("PlayerStatus").fullHp;//}
}

function OnMouseExit() {
	if(!textDisplay)
		return;
		
    Debug.Log("");
    textDisplay.text = "";
    //textDisplay.material.color = Color.brown;
}