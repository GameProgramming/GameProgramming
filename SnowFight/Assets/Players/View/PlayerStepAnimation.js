private var anim :Animation;
private var leftFootEmitter :ParticleSystem;
private var rightFootEmitter :ParticleSystem;
private var terrain :Terrain;

static private var initialized = false;

var onLeftSound : AudioClip;
var onRightSound : AudioClip;

function Awake() {
	anim = GetComponent(Animation);
	
	if (!initialized) {
		var stepEv :AnimationEvent = new AnimationEvent();
		stepEv.functionName = "OnRightStep";
		stepEv.time = 0;
		anim["walk"].clip.AddEvent(stepEv);
		anim["push"].clip.AddEvent(stepEv);
		anim["rocketlauncher"].clip.AddEvent(stepEv);
		stepEv = new AnimationEvent();
		stepEv.functionName = "OnLeftStep";
		stepEv.time = 15;
		anim["walk"].clip.AddEvent(stepEv);
		anim["push"].clip.AddEvent(stepEv);
		anim["rocketlauncher"].clip.AddEvent(stepEv);
		initialized = true;
	}

	terrain = Terrain.activeTerrain;

	leftFootEmitter = transform.Find("StepsLeft").particleSystem;
	rightFootEmitter = transform.Find("StepsRight").particleSystem;
}

//TODO: das mit den richtungen haut noch nicht so recht hin :/
function OnRightStep () {
	rightFootEmitter.transform.position.y =
		 terrain.SampleHeight(rightFootEmitter.transform.position) + 0.05;
	rightFootEmitter.startRotation = transform.rotation.eulerAngles.y;
	rightFootEmitter.Emit(1);
	audio.clip = onRightSound;
	if(!audio.isPlaying){
	    	   	audio.Play();
			}
}
function OnLeftStep () {
	leftFootEmitter.transform.position.y =
		 terrain.SampleHeight(leftFootEmitter.transform.position) + 0.05;
	leftFootEmitter.startRotation = transform.rotation.eulerAngles.y;
	leftFootEmitter.Emit(1);
	audio.clip = onLeftSound;
	if(!audio.isPlaying){
	    	   	audio.Play();
			}
}