var EventBus = function() {
    this.$on = function(n, t) {
        this[n] = this[n] || [];
        this[n].push(t)
    };
    this.$off = function(n, t) {
        if (this[n])
            if (t) {
                let i = this[n].indexOf(t);
                i >= 0 && this[n].splice(i, 1)
            } else this[n].splice(0, this[n].length)
    };
    this.$emit = function(n, ...t) {
        if (this[n])
            for (let i = 0; i < this[n].length; i++) this[n][i](...t)
    }
},
SceneManager = function() {
    function g() {
        var r, f;
        u = document.createElement("div");
        document.body.appendChild(u);
        i = new THREE.Scene;
        r = new THREE.AmbientLight(13421772, .4);
        i.add(r);
        n = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2e3);
        n.position.z = 50;
        f = new THREE.PointLight(13421772, .8);
        n.add(f);
        i.add(n);
        it(k);
        t = new THREE.WebGLRenderer;
        t.setPixelRatio(window.devicePixelRatio);
        t.setSize(window.innerWidth, window.innerHeight);
        u.appendChild(t.domElement);
        orbitControls = new THREE.OrbitControls(n, t.domElement);
        orbitControls.minDistance = 10;
        orbitControls.maxDistance = 700;
        s = new THREE.Raycaster;
        nt();
        b()
    }

    function nt() {
        orbitControls.addEventListener("change", function() {
            c = !0
        });
        window.addEventListener("resize", rt, !1);
        window.addEventListener("mousedown", function() {
            c = !1
        }, !1);
        u.addEventListener("mouseup", function() {
            if (!c && !e && o != p) {
                let n = w();
                n != null && a.addPoint(n)
            }
            e = !1
        });
        window.addEventListener("mousemove", function(n) {
            if (n.changedTouches ? (x = n.changedTouches[0].pageX, y = n.changedTouches[0].pageY) : (x = n.clientX, y = n.clientY), h.x = x / window.innerWidth * 2 - 1, h.y = -(y / window.innerHeight) * 2 + 1, e) {
                let n = w() || v;
                !n || (v = n, f.$emit("updateControlObject", n))
            }
        });
        document.addEventListener("keydown", function(n) {
            o = n.which
        });
        document.addEventListener("keyup", function() {
            o = -1
        });
        f.$on("dragControlObject", tt)
    }

    function tt(n) {
        n == "start" ? o != p ? (orbitControls.enabled = !1, e = !0, oldPosi = null) : f.$emit("removeControlObject") : n == "end" ? orbitControls.enabled = !0 : new Exception("error")
    }

    function w() {
        if (!l) return null;
        s.setFromCamera(h, n);
        let t = s.intersectObjects(r.children),
            i = null;
        return t.length > 0 && (i = {
            position: t[0].point,
            normal: t[0].face.normal.clone()
        }), i
    }

    function it(n) {
        function f(n) {
            if (n.lengthComputable) {
                var t = n.loaded / n.total * 100;
                console.log("model " + Math.round(t, 2) + "% downloaded")
            }
        }

        function e() {}
        var t = new THREE.LoadingManager,
            u;
        t.onProgress = function(n, t, i) {
            console.log(n, t, i)
        };
        u = new THREE.OBJLoader(t);
        u.load(n, function(n) {
            r = n;
            r.position.y = -175;
            i.add(r);
            l = !0;
            a = new Lasso(d)
        }, f, e)
    }

    function rt() {
        n.aspect = window.innerWidth / window.innerHeight;
        n.updateProjectionMatrix();
        t.setSize(window.innerWidth, window.innerHeight)
    }

    function b() {
        requestAnimationFrame(b);
        ut()
    }

    function ut() {
        t.render(i, n)
    }
    let u, n, i, t, s;
    var h = new THREE.Vector2;
    let c = !1,
        r, l = !1,
        k = "assets/models/ninjaHead_Low.obj",
        a = null,
        d = this,
        f = new EventBus,
        e = !1,
        v = null,
        o = -1,
        p = 16;
    this.getConfig = function() {
        return {
            scene: i,
            camera: n,
            renderer: t,
            orbitControls: orbitControls
        }
    };
    this.getObject = function() {
        return r
    };
    this.getEventBus = function() {
        return f
    };
    g()
},
Lasso = function(n) {
    function y() {
        c = new THREE.DragControls(t, r.camera, r.renderer.domElement);
        l = new THREE.SphereBufferGeometry(.2, 10, 10);
        k()
    }

    function p(n) {
        u = n.object;
        e.$emit("dragControlObject", "start")
    }

    function w() {
        u = null;
        e.$emit("dragControlObject", "end");
        h()
    }

    function b() {
        let n = t.indexOf(u);
        if (n != -1) {
            let i = t.splice(n, 1);
            r.scene.remove(i[0]);
            h()
        }
    }

    function k() {
        c.addEventListener("dragstart", p);
        c.addEventListener("dragend", w);
        e.$on("updateControlObject", d);
        e.$on("removeControlObject", b)
    }

    function d(n) {
        !u || (u.position.copy(n.position), u.normal.copy(n.normal), h())
    }

    function g(n) {
        var u = new THREE.MeshLambertMaterial({
                color: "#1ed36f"
            }),
            i = new THREE.Mesh(l, u);
        return n ? (i.position.copy(n.position), i.normal = n.normal) : (i.position.x = 0, i.position.y = 0, i.position.z = 0, i.normal = new THREE.Vector3(0, 0, 0)), r.scene.add(i), t.push(i), i
    }

    function nt(n) {
        let i = [],
            r = t.length;
        for (let u = 0; u < r - 1; u++) {
            let r = t[u],
                e = t[u + 1],
                h = e.normal.clone().sub(r.normal).divideScalar(f);
            i.push(n[u * f]);
            for (let t = 1; t < f; t++) {
                let e = r.normal.clone().add(h.clone().multiplyScalar(t)),
                    c = e.clone().transformDirection(o.children[0].matrixWorld);
                c.multiplyScalar(10).add(n[u * f + t]);
                s.set(c, e.clone().negate());
                let l = s.intersectObjects(o.children);
                l.length > 0 && i.push(l[0].point)
            }
        }
        return i
    }

    function h() {
        if (t.length > 1) {
            let n = [];
            for (let i = 0; i < t.length; i++) n.push(t[i].position);
            i.points = n;
            let u = nt(i.getPoints((n.length - 1) * f));
            a.setFromPoints(u);
            !i.mesh || r.scene.remove(i.mesh);
            let e = new THREE.LineBasicMaterial({
                color: 255,
                opacity: 1,
                linewidth: 5
            });
            i.mesh = new THREE.Line(a.clone(), e);
            i.mesh.castShadow = !0;
            r.scene.add(i.mesh)
        } else r.scene.remove(i.mesh)
    }
    let r = n.getConfig(),
        e = n.getEventBus(),
        o = n.getObject(),
        t = [],
        f = 30,
        v = .5,
        s = new THREE.Raycaster,
        c, l, u = null,
        a = new THREE.BufferGeometry,
        i = new THREE.CatmullRomCurve3([], !1, "chordal");
    this.addPoint = function(n) {
        g(n);
        h()
    };
    y()
};
let manager = new SceneManager