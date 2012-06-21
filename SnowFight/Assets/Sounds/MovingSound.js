var music : AudioClip;
var x : float;
var z : float;

function Start () {
	
	audio.clip = music;
	x=transform.position.x;
	z=transform.position.z;
}

function Update () {
	
	    if(x != transform.position.x || z != transform.position.z ){
			if(!audio.isPlaying){
	    	   	audio.Play();
	    		x=transform.position.x;
				z=transform.position.z;
				
			}
	    }else if (x == transform.position.x && z == transform.position.z){
		    if(audio.isPlaying){
		    	audio.Pause();
		    }
	    }
	
}