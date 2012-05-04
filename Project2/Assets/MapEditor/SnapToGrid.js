//@MenuItem ("GameObject/Snap to Grid %g")
//static function MenuSnapToGrid()
@script ExecuteInEditMode()

// Just a simple script that snaps an object to a given grid.

var gridx : float = 1.0;
var gridy : float = 1.0;
var gridz : float = 1.0;

function Update () 
{
    var transforms : Transform[] = Selection.GetTransforms(SelectionMode.TopLevel | SelectionMode.OnlyUserModifiable);

	
    
    for (var transform : Transform in transforms)
    {
	    
        var newPosition : Vector3 = transform.position;
        newPosition.x = Mathf.Round(newPosition.x / gridx) * gridx;
        newPosition.y = Mathf.Round(newPosition.y / gridy) * gridy;
        newPosition.z = Mathf.Round(newPosition.z / gridz) * gridz;
        transform.position = newPosition;
    }
}