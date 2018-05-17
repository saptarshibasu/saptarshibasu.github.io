        var imageCanvas = document.createElement('canvas');
        var imageCanvasContext = imageCanvas.getContext('2d');
        var lineCanvas = document.createElement('canvas');
        var lineCanvasContext = lineCanvas.getContext('2d');
        var pointLifetime = 1000;
        var points = [];
        var image = document.createElement('img');
        
        /**
         * Attaches event listeners and starts the effect.
         */
        function start() {
            document.getElementsByClassName("flacard-footer__copyright").item(0).querySelector('p').innerHTML = 'Copyright &copy; '+ new Date().getFullYear() +' Saptarshi Basu';
            image = document.getElementsByClassName("front-header").item(0).querySelector('img:nth-of-type(2)');
            document.getElementsByClassName("front-header").item(0).addEventListener('mousemove', onMouseMove);
            window.addEventListener('resize', resizeCanvases);
            imageCanvas.style.position = "absolute";
            imageCanvas.style.left = "0";
            imageCanvas.style.top = "0";

            document.getElementsByClassName("front-header").item(0).appendChild(this.imageCanvas);
            resizeCanvases();
            tick();
        }

        /**
         * Records the user's cursor position.
         *
         * @param {!MouseEvent} event
         */
        function onMouseMove(event) {
            points.push({
                time: Date.now(),
                x: event.clientX,
                y: event.clientY
            });
        }

        /**
         * Resizes both canvases to fill the window.
         */
        function resizeCanvases() {
            imageCanvas.width = lineCanvas.width = document.getElementsByClassName("front-header").item(0).clientWidth;
            imageCanvas.height = lineCanvas.height = document.getElementsByClassName("front-header").item(0).clientHeight;
        }

        /**
         * The main loop, called at ~60hz.
         */
        function tick() {
            // Remove old points
            points = points.filter(function (point) {
                var age = Date.now() - point.time;
                return age < pointLifetime;
            });

            drawLineCanvas();
            drawImageCanvas();
            requestAnimationFrame(tick);
        }

        /**
         * Draws a line using the recorded cursor positions.
         *
         * This line is used to mask the original image.
         */
        function drawLineCanvas() {
            var minimumLineWidth = 300;
            var maximumLineWidth = 100;
            var lineWidthRange = maximumLineWidth - minimumLineWidth;
            var maximumSpeed = 50;

            lineCanvasContext.clearRect(0, 0, lineCanvas.width, lineCanvas.height);
            lineCanvasContext.lineCap = 'square';
            lineCanvasContext.shadowBlur = 30;
            lineCanvasContext.shadowColor = '#000';

            for (var i = 1; i < points.length; i++) {
                var point = points[i];
                var previousPoint = points[i - 1];

                // Change line width based on speed
                var distance = getDistanceBetween(point, previousPoint);
                var speed = Math.max(0, Math.min(maximumSpeed, distance));
                var percentageLineWidth = (maximumSpeed - speed) / maximumSpeed;
                lineCanvasContext.lineWidth = minimumLineWidth + percentageLineWidth * lineWidthRange;

                // Fade points as they age
                var age = Date.now() - point.time;
                var opacity = (pointLifetime - age) / pointLifetime;
                lineCanvasContext.strokeStyle = 'rgba(0, 0, 0, ' + opacity + ')';

                lineCanvasContext.beginPath();
                lineCanvasContext.moveTo(previousPoint.x, previousPoint.y);
                lineCanvasContext.lineTo(point.x, point.y);
                lineCanvasContext.stroke();
            }
        }

        /**
         * @param {{x: number, y: number}} a
         * @param {{x: number, y: number}} b
         * @return {number} The distance between points a and b
         */
        function getDistanceBetween(a, b) {
            return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        }

        /**
         * Draws the original image, masked by the line drawn in drawLineToCanvas.
         */
        function drawImageCanvas() {
            // Emulate background-size: cover
            var width = imageCanvas.width;
            var height = imageCanvas.width / image.naturalWidth * image.naturalHeight;

            if (height < imageCanvas.height) {
                width = imageCanvas.height / image.naturalHeight * image.naturalWidth;
                height = imageCanvas.height;
            }

            imageCanvasContext.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
            imageCanvasContext.globalCompositeOperation = 'source-over';
            imageCanvasContext.drawImage(image, 0, 0, width, height);
            imageCanvasContext.globalCompositeOperation = 'destination-in';
            imageCanvasContext.drawImage(lineCanvas, 0, 0);
        }        
