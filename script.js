(() => {
    const canvas = document.getElementById('canvas');
    const divStateStage = document.getElementById('state_stage');

    const ctx = canvas.getContext('2d');

    ctx.font = '12px Verdana';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'blue';

    const canvasLocation = canvas.getBoundingClientRect();

    const state = (() => {
        return {
            points: [],
            tasks: [
                function clearCanvas() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                },
                function displayPoints() {
                    this.points.forEach((point, i) => {
                        fillRect(point.x, point.y, 20, 20, point.color || 'black');
                        ctx.fillText(i + 1, point.x, point.y - 12);
                    });
                },
                function displayCurve() {
                    if (!this.points.length) {
                        return;
                    }

                    drawBezierCurve(this.points);
                }
            ],
            start() {
                setInterval(() => {
                    this.tasks.forEach(task => {
                        task.bind(this)();
                    });
                }, 16);
            },
            addPoint(point) {
                this.points.push(point);
            }
        };
    })();

    state.start();

    const setupMouseEvent = cb => {
        return event => {
            cb({
                x: event.clientX - canvasLocation.x,
                y: event.clientY - canvasLocation.y,
                event
            });
        }
    };

    canvas.onclick = setupMouseEvent(e => {
        if (state.activePoint) {
            state.activePoint = null;

            return;
        }

        state.addPoint({
            x: e.x,
            y: e.y
        });
    });

    canvas.onmousedown = setupMouseEvent(e => {
        const activePoint = state.points.find(point => point.color === 'red');

        if (!activePoint) {
            return;
        }

        state.activePoint = activePoint;
    });

    canvas.oncontextmenu = setupMouseEvent(e => {
        const activePoint = state.activePoint || state.points.find(point => point.color === 'red');

        state.points = state.points.filter(p => p !== state.activePoint);

        state.activePoint = null;

        e.event.preventDefault();
    });

    canvas.onmousemove = setupMouseEvent(e => {
        if (state.activePoint) {
            state.activePoint.x = e.x;
            state.activePoint.y = e.y;
            return;
        }

        state.points.forEach(point => {
            if (e.x > point.x && e.x < point.x + 20 && e.y > point.y && e.y < point.y + 20)  {
                point.color = 'red';
                return;
            }

            point.color = 'black';
        });

        canvas.style.cursor = state.points.find(point => point.color === 'red') ? 'pointer' : 'default';
    });

    function fillRect(x, y, width, height, color) {
        const initialFillStyle = ctx.fillStyle;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = initialFillStyle;
    }

    function drawLine(line) {
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        ctx.lineTo(line[1].x, line[1].y);
        ctx.stroke();
    }

    function drawBezierCurve(points) {
        const curvePoints = [];

        for (let t = 0; t < 1; t += 0.01) {
            const n = points.length - 1;

            let x = Math.pow(1 - t, n) * points[0].x;
            let y = Math.pow(1 - t, n) * points[0].y;

            for (let i = 1; i <= points.length - 2; i++) {
                x += n * Math.pow(1 - t, n - i) * Math.pow(t, i) * points[i].x;
                y += n * Math.pow(1 - t, n - i) * Math.pow(t, i) * points[i].y;
            }

            x += Math.pow(t, n) * points[points.length - 1].x;
            y += Math.pow(t, n) * points[points.length - 1].y;

            curvePoints.push({
                x,
                y
            });
        }

        const lines = [];

        for (let i = 0; i < curvePoints.length - 1; i++) {
            lines.push([
                curvePoints[i],
                curvePoints[i + 1]
            ]);
        }

        lines.forEach(drawLine);
    }
})();
