(function($) {
	var Vortex = function(element, options) {
		var kids;
		var animationIntervalId = 0;
		var isAnimating = false;
		var vortex = $(element);
		var positions = [];
		var kidsPositionIndexes = [];
		var vortexInstance = this;

		var children = [];

		var settings = $.extend({
			speed : 50,
			clockwise : true,
			manualAdvance : false,
			beforeAnimation : null,
			afterAnimation : null
		}, options || {});

		var positionsCount = vortex.width() * 2;

		var vortexHalfHeight = vortex.height() / 2;
		var vortexHalfWidth = vortex.width() / 2;

		var vars = {
			currentChild : '',
			totalChildren : 0,
			checkRadians : new Array(),
			radians : 0
		};

		kids = vortex.children().css("position", "absolute");

		kids.each(function(i) {

			vars.totalChildren++;

		});

		vars.radians = (Math.PI * 2 / vars.totalChildren);

		var radiantFactor = (positionsCount / 2) / Math.PI;

		kids
				.each(function(i) {

					var kidHalfHeight = $(this).height() / 2;
					var kidHalfWidth = $(this).width() / 2;

					var kidPositions = [];

					for ( var j = 0; j < positionsCount; j += 1) {

						kidPositions
								.push({
									top : ((1 + Math.sin(Math.PI
											+ (j / radiantFactor))) * vortexHalfHeight)
											- kidHalfHeight,
									left : vortexHalfWidth
											* (1 + Math.cos(j / radiantFactor))
											- kidHalfWidth
								});

					}

					var positionIndex = i
							* Math.ceil(positionsCount / kids.length);

					kidsPositionIndexes[i] = positionIndex;

					$(this).css({
						top : kidPositions[positionIndex].top,
						left : kidPositions[positionIndex].left
					});

					positions.push(kidPositions);

				});

		this.stop = function() {

			clearInterval(animationIntervalId);
			kids.stop();

			setAnimating(false);

		};

		this.setClockwise = function(clockwise) {

			settings.clockwise = clockwise;

			if (isAnimating) {
				this.start();
			}

		};

		var setAnimating = function(animating) {

			isAnimating = animating;

			if (isAnimating === true) {

				vortex.addClass("vortex-animating");

				if (settings.beforeAnimation) {
					if (settings.beforeAnimation.call() === false)
						return false;
				}

			} else {

				vortex.removeClass("vortex-animating");

				if (settings.afterAnimation)
					settings.afterAnimation.call(null, $(this));

			}

		};

		this.start = function(repetitions) {

			this.stop();

			setAnimating(true);

			var positionStep;

			if (settings.clockwise === true) {
				positionStep = -1;
			} else {
				positionStep = 1;
			}

			var startAnimation = function() {

				kids.each(function(i) {

					var kidPositions = positions[i];

					var positionIndex = kidsPositionIndexes[i] + positionStep;

					if (positionIndex < 0)
						positionIndex = positionsCount - 1;

					if (positionIndex > positionsCount - 1)
						positionIndex = 0;

					$(this).css({
						"left" : kidPositions[positionIndex].left,
						"top" : kidPositions[positionIndex].top
					});

					kidsPositionIndexes[i] = positionIndex;

				});

			};
			
			function setIntervalX(callback, delay, repetitions) {
			    var x = 0;
			    animationIntervalId = window.setInterval(function () {

			       callback();

			       if (++x === repetitions) {
			           window.clearInterval(animationIntervalId);
			           vortexInstance.stop();
			       }
			    }, delay);
			};

			if (repetitions) {
				setIntervalX(startAnimation, settings.speed, Math.floor(positionsCount / kids.length * repetitions));
			} else {
				animationIntervalId = setInterval(startAnimation, settings.speed);
			}
			
			

		};

		this.setSpeed = function(speed) {

			settings.speed = speed;

			if (isAnimating) {
				this.start();
			}

		};

		if (!settings.manualAdvance) {
			this.start();
		}

		this.step = function(steps) {

			this.start(steps);
			
			return;

		};

	};

	$.fn.vortex = function(options) {
		return this.each(function() {
			var element = $(this);

			if (element.data('vortex'))
				return;

			var vortex = new Vortex(this, options);

			element.data('vortex', vortex);
		});
	};
})(jQuery);
