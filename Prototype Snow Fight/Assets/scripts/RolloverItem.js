var rolloverText = "";
var rolloverColor = Color.red;
var originalColor = Color.brown;
private var textDisplay : GUIText;

function Start() {
    //originalColor = renderer.material.color;
    if (rolloverText == "") { rolloverText = gameObject.tag; }
    textDisplay = GameObject.Find("Text Display").guiText;
    textDisplay.text = rolloverText;
    
}

function OnMouseEnter() {
    Debug.Log(textDisplay.gameObject.tag);
    textDisplay.material.color = rolloverColor;
    //textDisplay.text = rolloverText;
    //if(gameObject.GetComponent("Player Status")){
    //rolloverText = gameObject.GetComponent("PlayerStatus").fullHp;
    textDisplay.text = rolloverText;//gameObject.GetComponent("PlayerStatus").fullHp;//}
}

function OnMouseExit() {
    Debug.Log(textDisplay.gameObject.tag);
    textDisplay.text = "";
    //textDisplay.material.color = Color.brown;
}