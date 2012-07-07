
var mode = false;
var player :Transform;
var playerCam :Transform;
var camFollow :SmoothFollow;


function Awake () {
}

function Start () {
	camFollow = GameObject.FindGameObjectWithTag("MainCamera").GetComponent(SmoothFollow);
	ResetPlayerCam();
}

function Update () {
	if (Input.GetButtonUp("Map")) {
		var status : PlayerStatus = GameObject.FindGameObjectWithTag("Game").GetComponent(GameStatus).player.GetComponent(PlayerStatus);
		if (!status.IsDead()) {
			mode = !mode;
			SetMode(mode);
		}
	}
}

function SetMode ( m :boolean ) {
	mode = m;
	
	if (m) {
		camFollow.target = transform;
	} else {
		camFollow.target = playerCam;
	}
}

function SetPlayerCam ( c :Transform ) {
	playerCam = c;
	if (!mode) camFollow.target = playerCam;
}

function ResetPlayerCam () {
	if (player) {
		SetPlayerCam(player.Find("CameraSetup/CameraTarget"));
	}
}

function SetPlayer ( p :Transform ) {
	player = p;
}

function GetMode() : boolean {
	return mode;
}