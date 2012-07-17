
var iconLmb :Texture;
var iconRmb :Texture;
var iconAction :Texture;

private var tipLMB :String = "";
private var tipRMB :String = "";
private var tipAction :String = "";
private var tipIcon :Texture;

private var newTipLMB :String = "";
private var newTipRMB :String = "";
private var newTipAction :String = "";
private var newTipIcon :Texture;

private var changeProgress :float = 0;

private var style : GUIStyle;
private var shadowStyle : GUIStyle;

private var tooltipActivity = true;

function Awake () {
	style = GetComponent(GameStatusDisplay).neuralStyle;
	shadowStyle = GetComponent(GameStatusDisplay).shadowStyle;
}

function Update () {
	if (tipLMB != newTipLMB || tipRMB != newTipRMB || tipAction != newTipAction) {
		changeProgress -= 8*Time.deltaTime;
		if (changeProgress <= 0) {
			tipLMB = newTipLMB;
			tipRMB = newTipRMB;
			tipAction = newTipAction;
			tipIcon = newTipIcon;
		}
	} else {
		changeProgress = Mathf.Clamp01(changeProgress + 8*Time.deltaTime);
	}
}

function OnGUI() {
	if (tooltipActivity) {
		style = GetComponent(GameStatusDisplay).neutralStyle;
		shadowStyle = GetComponent(GameStatusDisplay).shadowStyle;
	
		var y :float = Screen.height - 100 ;
		var x :float = Screen.width - changeProgress * 310;
		
		if (tipIcon) GUI.Label (Rect (x, y, 60, 60), tipIcon);
		x += 50;
		y += 10;
		if (tipLMB != "") {
			GUI.Label (Rect (x, y-5, 30, 70), iconLmb);
			GUI.Label (Rect (x+31, y+2, 200, 70), tipLMB, shadowStyle);
			GUI.Label (Rect (x+30, y, 200, 70), tipLMB, style);
			y += 20;
		}
		if (tipRMB != "") {
			GUI.Label (Rect (x, y-5, 30, 70), iconRmb);
			GUI.Label (Rect (x+31, y+2, 200, 70), tipRMB, shadowStyle);
			GUI.Label (Rect (x+30, y, 200, 70), tipRMB, style);
			y += 20;
		}
		if (tipAction != "") {
			GUI.Label (Rect (x, y-5, 30, 70), iconAction);
			GUI.Label (Rect (x+31, y+2, 200, 70), tipAction, shadowStyle);
			GUI.Label (Rect (x+30, y, 200, 70), tipAction, style);
			y += 20;
		}
	}
}

function SetTooltip (lmb :String, rmb :String, action :String, icon :Texture) {
	newTipLMB = lmb;
	newTipRMB = rmb;
	newTipAction = action;
	newTipIcon = icon;
}

function SetTooltipActivity (a :boolean) {
	tooltipActivity = a;
}