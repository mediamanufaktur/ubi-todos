Todos = new Mongo.Collection("todos");


if (Meteor.isClient) {
	Meteor.subscribe("todos");
 
	Template.main.helpers({
		todos: function(){
		  return Todos.find({}, {sort: {createdAt: -1}});
		},

		isEmpty: function(){
			console.log("isEmpty entered");
			if(Todos.find().fetch() == ""){
				console.log("isEmpty true");
				return true;
			} else {
				console.log("isEmpty false");
				return false;
			}
		}
  	});
  
  	Template.main.events({
	  "submit .new-todo": function(theEvent) {
		  var text = theEvent.target.text.value;
		  
		  Meteor.call("addTodo", text);
		  
		  theEvent.target.text.value = "";
		  
		  return false;
	  },
	  
	  "click .toggle-checked": function(){
		  Meteor.call("setChecked", this._id, !this.checked);
	  },
	  
	  "click .delete-todo": function(){ 
		  if (confirm("Sure wanna delete?")){
		  	Meteor.call("deleteTodo", this._id);
		  }
	  }
  });
  
  Accounts.ui.config({
	  passwordSignupFields: "USERNAME_ONLY"
  });
}

if(Meteor.isServer){
	Meteor.publish("todos", function(){
		var theTodos = [];

		if(!this.userId){
			theTodos = Todos.find();
		} else {
			theTodos = Todos.find({userId: this.userId});
 		}

		return theTodos;
	});
}

Meteor.methods({
	
  addTodo: function(theText){
	  if (!Meteor.userId()){
	  	throw new Meteor.Error("not authorized");
	  }
	  
	  Todos.insert({ 
			  text: theText,
			  createdAt: new Date(),
			  userId: Meteor.userId(),
			  username: Meteor.user().username
		  });
  },
  
  deleteTodo: function(todoId){
	  var todo = Todos.findOne(todoId);
	  if (todo.userId !== Meteor.userId()){
		throw new Meteor.Error("not authorized");
	  }
	  Todos.remove(todoId);
  },
  
  setChecked: function(todoId, theChecked){
	  var todo = Todos.findOne(todoId);
	  if (todo.userId !== Meteor.userId()){
		throw new Meteor.Error("not authorized");
	  }
	  Todos.update(todoId,{$set:{checked: theChecked}});
  }
});