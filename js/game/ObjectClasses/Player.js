Player = function() {
	Player.superclass.constructor.call(this);
	
	// Player settings
	this.mGroundHeight = 50;
	this.mHorizontalSpeed = 0;
	this.mJumpSpeed = 0;
	this.mGravity = 0;
	this.mAcceleration = 0;
	this.mPosition = 0;
	this.mDistance = 0;
	this.mCamDist = 0;
	this.mCurSpeed = 0;
	this.mOrigGround = 0;
	this.mCamSpeed = 0;
	this.curID = 0;
	this.mTotalJumps = 0;
	this.hasCollided = false;
	this.colliders = new Array();
	this.canJump = true;

	
	// Animation settings
	this.currentAnim = null;
	this.animArray = [];
	this.mStopped = false;
	
	// Boring stuff
	this.addEventListener("update", this.UpdatePosition.bind(this));
	this.useWorldPosition(true);
	return this;
}

Player.prototype = {


	setup : function(params) 
	{
    	this.mGame = params.gameScreen;
    	this.mOrigGround = this.mGroundHeight;
    	this.height = 128;
    	this.width = 80;
		Player.superclass.setup.call(this, params);
		this.SetupAnimations();
		this.addChild(this.UILayer = new TGE.DisplayObjectContainer().setup({}));
		this.mDebug = this.UILayer.addChild(new TGE.Text().setup({
			x : 72,
			y : 65,
			text : "0",
			font : "Tahoma 20px",
			color : "green"
		}));
		this.mDebug.text = "";
		return this;
	},
	
	SetupAnimations : function() 
	{
		
		// Running animation
		this.animArray["run"] = this.addChild(new TGE.SpriteSheetAnimation().setup({
			image : "player_running2",
			rows : 1,
			columns : 4,
			totalFrames : 4,
			fps : 10,
			looping : true,
			visible : false
		}));
		
		// Flying animation
		this.animArray["fly"] = this.addChild(new TGE.SpriteSheetAnimation().setup({
	        image : "player_flying",
	        rows : 1,
	        columns : 3,
	        totalFrames : 3,
	        fps : 16,
	        looping : false,
	        visible : false
		}));

		// Hang animation
		this.animArray["idle"] = this.addChild(new TGE.SpriteSheetAnimation().setup({
	        image : "player_idle",
	        rows : 1,
	        columns : 1,
	        totalFrames : 1,
	        fps : 8,
	        looping : false,
	        visible : false
		}));


		this.animArray["stop"] = this.addChild(new TGE.SpriteSheetAnimation().setup({
	        image : "player_running2",
	        rows : 1,
	        columns : 4,
	        totalFrames : 1,
	        fps : 8,
	        looping : false,
	        visible : false
		}));

		// Start player out running
		this.PlayAnimation("run");
	},
	
	
	UpdatePosition : function(event) 
	{
		if(this.mGame.isPaused)
		{
			this.PlayAnimation("stop");
			return;
		}
		if(!this.mStopped)
		{
			if(this.mVerticalSpeed >= 3 || this.mVerticalSpeed <= -3)
			{
				this.canJump = false;
			}
			//Jump
			if(this.mGame.mousedown)//Gets Player Input
			{
				if(this.canJump)
				{
					this.mVerticalSpeed = this.mJumpSpeed; //Apply Jump
					this.PlayAnimation("fly");
					this.mTotalJumps++;
					this.canJump = false;
				}
			}

			if(this.mPosition > this.mGroundHeight)//Apply Gravity
				this.mVerticalSpeed -= this.mGravity;

			if(this.mPosition < this.mGroundHeight)//Retrun to ground level
			{
				this.mVerticalSpeed = 0;
				this.PlayAnimation("run");
				this.mPosition = this.mGroundHeight;
				this.canJump = true;
			}

			if(this.mCurSpeed < this.mHorizontalSpeed)//Accelerate to match intended speed
			{
				this.mCurSpeed += this.mHorizontalSpeed;
			}
			if(this.mCurSpeed > this.mHorizontalSpeed) //Prevents speed from exceeding intended speed
			{
				this.mCurSpeed = this.mHorizontalSpeed;
				//Sthis.PlayAnimation("run");
			}
			if(this.mCamDist+(this.mGame.width/4) > this.mDistance)
				this.mCurSpeed += 1;
		}

		this.mCamSpeed = this.mHorizontalSpeed;
		
		
		if (this.mStopped)
		{
			this.PlayAnimation("stop");
			//this.markForRemoval();
			//this.mCurSpeed = 0;
			//return;
		}
		var nX = this.mDistance + this.mCurSpeed;
		var nY = this.mPosition + this.mVerticalSpeed;

		var playerRect = new TGE.Rectangle(this.mDistance-this.width/2, nY-this.height/2, this.width, this.height);
		if(this.checkIntersection(playerRect))
		{
			this.mVerticalSpeed = 0;
			this.canJump = true;
			this.PlayAnimation("run");
		}
		playerRect = new TGE.Rectangle(nX-this.width/2, this.mPosition-this.height/2, this.width, this.height);
		if(this.checkIntersection(playerRect))
		{
			this.mCurSpeed = 0;
			this.PlayAnimation("idle");
		}

		playerRect = new TGE.Rectangle(this.mDistance-this.width/2, this.mPosition-this.height/2, this.width, this.height);
		if(this.checkIntersection(playerRect))
		{
			this.mVerticalSpeed = 1;
			this.PlayAnimation("idle");
			this.canJump = true;
		}
		if(this.mPosition < this.getGroundHeight()-1)
		{
			//this.mVerticalSpeed = 2;
			this.mPosition = this.getGroundHeight();
		}
		//if(this.mVerticalSpeed != 0)
		//	this.PlayAnimation("fly");
		this.mPosition += this.mVerticalSpeed; //Use vertical speed to determine vertical position
		this.mDistance += this.mCurSpeed; //use horizontal speed to determine distance traveled
		this.mCamDist += this.mCamSpeed; //uses the camera's speed to determine the camera's X position
		
		if(this.mPosition <= this.mGroundHeight)
		{
			this.canJump = true;
			this.PlayAnimation("run");
		}
		if(((this.mCamDist-2) - this.mGame.width/2) > this.mDistance) //Kill the player if he/she exits on screen left
		{
			this.mStopped = true;
			this.mGame.PlayerHitObstacle("dark");
			//this.markForRemoval();
		}

		this.worldX = this.mDistance; //Applys player X
		this.worldY = this.mPosition+10; //Applys player Y
		//this.mDebug.text = "speed:" + this.mHorizontalSpeed;
		this.mHorizontalSpeed += this.mAcceleration;
		this.hasCollided = false;
		this.mGame.mousedown = false;
		if(this.colliders.length > 8)
			this.colliders.splice(0, 1);
	},

	getGroundHeight : function()
	{
		var ret = this.mOrigGround;
		var rect1 = new TGE.Rectangle(this.mDistance-this.width/2, this.mPosition-this.height/2, this.width, this.height);
		for(var i = 0; i < this.colliders.length; i++)
		{
			rect2 = this.colliders[i];
			var r1 = rect1.x + rect1.width;
			var r2 = rect2.x + rect2.width;
			if((rect1.x >= rect2.x && rect1.x <= r2) || (r1 >= rect2.x && r1 <= r2))
			{
				var y = rect2.y + rect2.height +this.mOrigGround;
				if(y > ret)
					ret = y+10;
			}
		}
		return ret;
	},

	checkIntersection : function(rect1)
	{
		var ret = false;
		for(var i = 0; i < this.colliders.length; i++)
		{
			rect2 = this.colliders[i];
			var r1 = rect1.x + rect1.width;
			var r2 = rect2.x + rect2.width;
			if((rect1.x >= rect2.x && rect1.x <= r2) || (r1 >= rect2.x && r1 <= r2))
			{
				var y2 = rect2.y + rect2.height;
				if(rect1.y <= y2)
				{
					ret = true;
				}
			}else
				continue;
		}
		return ret;
	},

	PlayAnimation : function(name) 
	{
    
	    // If it's already started playing, don't start it again
	    if (this.currentAnim == this.animArray[name]) return;
		
		// Stop playing old animation if there is one
		if (this.currentAnim != null) {
			this.currentAnim.visible = false;
			this.currentAnim.gotoAndStop(0);
		}
		
		// Start playing next animation
		this.currentAnim = this.animArray[name];
		this.currentAnim.visible = true;
		this.currentAnim.gotoAndPlay(0);
	},


	SetSpeed : function(speed)
	{
		this.mHorizontalSpeed = speed * this.mGame.width;
		console.log("speed Set");
		this.mCamSpeed = this.mHorizontalSpeed;
	},

	SetAccel : function(accel)
	{
		this.mAcceleration = accel;
		console.log("accel set");
	},
	
	SetJumpSpeed : function(jumpSpeed)
	{
		this.mJumpSpeed = jumpSpeed;
	},
	
	SetGravity : function(gravity)
	{
		this.mGravity = gravity;
	},
}

extend(Player, TGE.SpriteSheetAnimation); 