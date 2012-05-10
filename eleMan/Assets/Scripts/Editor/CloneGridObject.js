/////X
@MenuItem ("GameObject/Clone/GridObjectX+ #1")
static function MenuCloneGridObjectXPos()
{
	for (var object : Object in Selection.objects)
    {
		var myClonedObject = Instantiate(object);
		object.transform.position.x += object.transform.localScale.x ;
	}    	
	
}
@MenuItem ("GameObject/Clone/GridObjectX- #2")
static function MenuCloneGridObjectXNeg()
{
	for (var object : Object in Selection.objects)
    {
		var myClonedObject = Instantiate(object);
		object.transform.position.x -= object.transform.localScale.x ;
	}    	
	
}
////Y
@MenuItem ("GameObject/Clone/GridObjectY+ #3")
static function MenuCloneGridObjectyPos()
{
	for (var object : Object in Selection.objects)
    {
		var myClonedObject = Instantiate(object);
		object.transform.position.y += object.transform.localScale.y ;
	}    	
	
}
@MenuItem ("GameObject/Clone/GridObjectY- #4")
static function MenuCloneGridObjectYNeg()
{
	for (var object : Object in Selection.objects)
    {
		var myClonedObject = Instantiate(object);
		object.transform.position.y -= object.transform.localScale.y ;
	}    	
	
}
////Z
@MenuItem ("GameObject/Clone/GridObjectZ+ #5")
static function MenuCloneGridObjectZPos()
{
	for (var object : Object in Selection.objects)
    {
		var myClonedObject = Instantiate(object);
		object.transform.position.z += object.transform.localScale.z ;
	}    	
	
}
@MenuItem ("GameObject/Clone/GridObjectZ- #6")
static function MenuCloneGridObjectZNeg()
{
	for (var object : Object in Selection.objects)
    {
		var myClonedObject = Instantiate(object);
		object.transform.position.z -= object.transform.localScale.z ;
	}    	
	
}