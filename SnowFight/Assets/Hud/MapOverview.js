
var mode = false;
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
		mode = !mode;
		SetMode(mode);
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
	camFollow.target = playerCam;
}

function ResetPlayerCam () {
	SetPlayerCam(gameObject.Find("CameraTarget").transform);
}