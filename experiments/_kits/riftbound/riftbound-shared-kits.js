export function normalizeMoveAxes(moveX = 0, moveY = 0) {
  const x = Math.max(-1, Math.min(1, Number(moveX) || 0));
  const y = Math.max(-1, Math.min(1, Number(moveY) || 0));
  const length = Math.hypot(x, y);
  if (length <= 1 || length === 0) return { moveX: x, moveY: y, length };
  return { moveX: x / length, moveY: y / length, length: 1 };
}

export function normalizedPointerToNdc(pointer) {
  return {
    x: Math.max(-1, Math.min(1, Number(pointer?.x) || 0)),
    y: Math.max(-1, Math.min(1, Number(pointer?.y) || 0))
  };
}

export function normalizedPointerFromEvent(event, element = event?.currentTarget ?? globalThis.document?.body) {
  const rect = element?.getBoundingClientRect?.() ?? { left: 0, top: 0, width: globalThis.innerWidth || 1, height: globalThis.innerHeight || 1 };
  const width = Math.max(1, rect.width || 1);
  const height = Math.max(1, rect.height || 1);
  return {
    x: Math.max(-1, Math.min(1, ((event.clientX - rect.left) / width) * 2 - 1)),
    y: Math.max(-1, Math.min(1, -(((event.clientY - rect.top) / height) * 2 - 1))),
    clientX: event.clientX,
    clientY: event.clientY
  };
}

export function computeCameraRelativeMoveFromVectors({ forward, right, moveX = 0, moveY = 0 }) {
  const x = (right?.x ?? 0) * moveX + (forward?.x ?? 0) * moveY;
  const y = (right?.y ?? 0) * moveX + (forward?.y ?? 0) * moveY;
  const z = (right?.z ?? 0) * moveX + (forward?.z ?? 0) * moveY;
  const length = Math.hypot(x, y, z);
  if (length <= 1e-8) return { x: 0, y: 0, z: 0, length: 0 };
  return { x: x / length, y: y / length, z: z / length, length: 1 };
}

export function yawFromDirection(direction) {
  const x = Number(direction?.x) || 0;
  const z = Number(direction?.z) || 0;
  if (Math.hypot(x, z) < 1e-8) return null;
  return Math.atan2(x, z);
}

export function expSmoothingAlpha(speed, dt) {
  return 1 - Math.exp(-Math.max(0, speed) * Math.max(0, dt));
}

export function createInputIntentKit(config = {}) {
  return {
    name: "input-intent-kit",
    install({ target = globalThis, element = globalThis.document?.body } = {}) {
      const keys = new Set();
      const pressed = new Set();
      const pointer = { x: 0, y: 0, clientX: 0, clientY: 0 };
      function keyName(event) { return String(event.key || event.code || "").toLowerCase(); }
      function down(event) { const key = keyName(event); if (!keys.has(key)) pressed.add(key); keys.add(key); }
      function up(event) { keys.delete(keyName(event)); }
      function pointerMove(event) { Object.assign(pointer, normalizedPointerFromEvent(event, element)); }
      function pointerDown(event) { if (event.button === 0) pressed.add("mouse0"); if (event.button === 2) keys.add("mouse2"); pointerMove(event); }
      function pointerUp(event) { if (event.button === 2) keys.delete("mouse2"); pointerMove(event); }
      function contextMenu(event) { if (config.preventContextMenu !== false) event.preventDefault(); }
      target.addEventListener?.("keydown", down);
      target.addEventListener?.("keyup", up);
      element?.addEventListener?.("pointermove", pointerMove);
      element?.addEventListener?.("pointerdown", pointerDown);
      element?.addEventListener?.("pointerup", pointerUp);
      element?.addEventListener?.("contextmenu", contextMenu);
      return {
        update() {
          const rawX = (keys.has("d") || keys.has("arrowright") ? 1 : 0) + (keys.has("a") || keys.has("arrowleft") ? -1 : 0);
          const rawY = (keys.has("w") || keys.has("arrowup") ? 1 : 0) + (keys.has("s") || keys.has("arrowdown") ? -1 : 0);
          const normalized = normalizeMoveAxes(rawX, rawY);
          const state = {
            moveX: normalized.moveX,
            moveY: normalized.moveY,
            sprint: keys.has("shift"),
            dashPressed: pressed.has("shift") || pressed.has("x"),
            guard: keys.has("q") || keys.has("mouse2"),
            parryPressed: pressed.has(" ") || pressed.has("space"),
            castPressed: pressed.has("f") || pressed.has("mouse0"),
            altCast: keys.has("mouse2"),
            interactPressed: pressed.has("e"),
            restartPressed: pressed.has("r"),
            debugPressed: pressed.has("f2"),
            pointer: { ...pointer }
          };
          pressed.clear();
          return state;
        },
        dispose() {
          target.removeEventListener?.("keydown", down);
          target.removeEventListener?.("keyup", up);
          element?.removeEventListener?.("pointermove", pointerMove);
          element?.removeEventListener?.("pointerdown", pointerDown);
          element?.removeEventListener?.("pointerup", pointerUp);
          element?.removeEventListener?.("contextmenu", contextMenu);
        }
      };
    }
  };
}

export function computeCameraRelativeMove({ THREE, camera, input, up = null }) {
  const worldUp = up?.clone?.() ?? new THREE.Vector3(0, 1, 0);
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  if (forward.lengthSq() < 1e-8) forward.set(0, 0, -1);
  forward.normalize();
  const right = new THREE.Vector3().crossVectors(forward, worldUp).normalize();
  const direction = new THREE.Vector3().addScaledVector(forward, input.moveY || 0).addScaledVector(right, input.moveX || 0);
  const hasInput = direction.lengthSq() > 1e-8;
  if (hasInput) direction.normalize();
  return { direction, forward, right, hasInput, speedScale: hasInput ? 1 : 0 };
}

export function createCameraRelativeMovementKit(config = {}) {
  return {
    name: "camera-relative-movement-kit",
    install({ THREE, camera, up } = {}) {
      return {
        compute(input) { return computeCameraRelativeMove({ THREE, camera, input, up }); },
        applyToObject({ object, input, dt, speed = config.speed ?? 5, sprintScale = config.sprintScale ?? 1.45 }) {
          const move = computeCameraRelativeMove({ THREE, camera, input, up });
          const scale = speed * (input.sprint ? sprintScale : 1) * dt;
          if (move.hasInput) object.position.addScaledVector(move.direction, scale);
          return move;
        }
      };
    }
  };
}

export function safeDirectionOnGround(THREE, direction) {
  const dir = direction?.clone?.() ?? new THREE.Vector3(direction?.x || 0, direction?.y || 0, direction?.z || 0);
  dir.y = 0;
  if (dir.lengthSq() < 1e-8) return null;
  return dir.normalize();
}

export function createQuaternionFacingKit(config = {}) {
  return {
    name: "quaternion-facing-kit",
    install({ THREE, up = new THREE.Vector3(0, 1, 0) } = {}) {
      const matrix = new THREE.Matrix4();
      const targetQuat = new THREE.Quaternion();
      return {
        faceDirection(object, direction, options = {}) {
          const dir = options.projectToGround === false ? direction?.clone?.() : safeDirectionOnGround(THREE, direction);
          if (!dir || dir.lengthSq() < 1e-8) return false;
          const origin = object.position?.clone?.() ?? new THREE.Vector3();
          matrix.lookAt(origin, origin.clone().add(dir), up);
          targetQuat.setFromRotationMatrix(matrix);
          if ((options.mode ?? config.mode ?? "smooth") === "instant") object.quaternion.copy(targetQuat);
          else object.quaternion.slerp(targetQuat, Math.max(0, Math.min(1, expSmoothingAlpha(options.turnSpeed ?? config.turnSpeed ?? 12, options.dt ?? 1 / 60))));
          object.quaternion.normalize();
          return true;
        }
      };
    }
  };
}

export function createAimRayKit(config = {}) {
  return {
    name: "aim-ray-kit",
    install({ THREE, camera, groundY = 0, targets = [] } = {}) {
      const raycaster = new THREE.Raycaster();
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -groundY);
      const aimPoint = new THREE.Vector3();
      const fallback = new THREE.Vector3();
      return {
        compute({ pointer, origin, targetObjects = targets, maxRange = config.maxRange ?? 80 } = {}) {
          const ndc = normalizedPointerToNdc(pointer);
          raycaster.setFromCamera(ndc, camera);
          const ray = raycaster.ray.clone();
          let hoveredEntityId = null;
          let hasTargetHit = false;
          let targetHit = null;
          if (targetObjects?.length) {
            const hits = raycaster.intersectObjects(targetObjects, true);
            if (hits.length) {
              hasTargetHit = true;
              targetHit = hits[0];
              hoveredEntityId = hits[0].object?.userData?.entityId ?? hits[0].object?.parent?.userData?.entityId ?? null;
            }
          }
          const hasGroundHit = ray.intersectPlane(plane, aimPoint) !== null;
          if (!hasGroundHit) aimPoint.copy(fallback.copy(ray.direction).multiplyScalar(maxRange).add(ray.origin));
          const castOrigin = origin?.clone?.() ?? ray.origin.clone();
          const aimDirection = aimPoint.clone().sub(castOrigin);
          if (aimDirection.lengthSq() < 1e-8) aimDirection.copy(ray.direction);
          aimDirection.normalize();
          return { ray, aimPoint: aimPoint.clone(), aimDirection, hoveredEntityId, hasGroundHit, hasTargetHit, targetHit };
        }
      };
    }
  };
}

export function createControlDebugOverlayKit(config = {}) {
  return {
    name: "control-debug-overlay-kit",
    install({ THREE, scene } = {}) {
      const group = new THREE.Group();
      group.name = "control-debug-overlay";
      group.visible = Boolean(config.visible);
      const mats = {
        camera: new THREE.LineBasicMaterial({ color: 0x2cff79 }),
        move: new THREE.LineBasicMaterial({ color: 0x56a6ff }),
        aim: new THREE.LineBasicMaterial({ color: 0xffd76a }),
        target: new THREE.LineBasicMaterial({ color: 0xff5577 })
      };
      const lines = {};
      for (const name of Object.keys(mats)) {
        const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, 1)]), mats[name]);
        group.add(line);
        lines[name] = line;
      }
      const aimDot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      group.add(aimDot);
      scene.add(group);
      function setLine(name, from, direction, length = 2) {
        const line = lines[name];
        if (!line || !from || !direction || direction.lengthSq?.() < 1e-8) return;
        line.geometry.setFromPoints([from.clone(), from.clone().add(direction.clone().normalize().multiplyScalar(length))]);
      }
      return {
        setVisible(value) { group.visible = Boolean(value); },
        toggle() { group.visible = !group.visible; return group.visible; },
        update({ playerPosition, cameraForward, movementDirection, aimDirection, targetDirection, aimPoint } = {}) {
          if (!group.visible || !playerPosition) return;
          const base = playerPosition.clone().add(new THREE.Vector3(0, 0.12, 0));
          setLine("camera", base, cameraForward, 2.8);
          setLine("move", base, movementDirection, 2.2);
          setLine("aim", base, aimDirection, 3);
          setLine("target", base, targetDirection, 3.2);
          if (aimPoint) aimDot.position.copy(aimPoint).add(new THREE.Vector3(0, 0.14, 0));
        }
      };
    }
  };
}

export function createSoftTargetFollowCameraKit(config = {}) {
  const settings = { distance: 9, height: 5.4, shoulderOffset: 1.15, followSpeed: 8, lookSpeed: 10, targetFocusStrength: 0.38, aimFocusStrength: 0.25, dashPullback: 1.7, minDistance: 6.4, maxDistance: 12, ...config };
  return {
    name: "soft-target-follow-camera-kit",
    install({ THREE, camera } = {}) {
      const desiredPosition = new THREE.Vector3();
      const desiredLook = new THREE.Vector3();
      const flatForward = new THREE.Vector3(0, 0, -1);
      const right = new THREE.Vector3(1, 0, 0);
      return {
        update({ player, aimPoint, softTarget, movementDirection, isDashing = false, dt = 1 / 60 } = {}) {
          if (!player?.position) return;
          if (movementDirection?.lengthSq?.() > 1e-6) flatForward.copy(movementDirection).setY(0).normalize();
          else {
            camera.getWorldDirection(flatForward);
            flatForward.y = 0;
            if (flatForward.lengthSq() < 1e-6) flatForward.set(0, 0, -1);
            flatForward.normalize();
          }
          right.crossVectors(flatForward, new THREE.Vector3(0, 1, 0)).normalize();
          const distance = Math.max(settings.minDistance, Math.min(settings.maxDistance, settings.distance + (isDashing ? settings.dashPullback : 0)));
          desiredPosition.copy(player.position).addScaledVector(flatForward, -distance).addScaledVector(right, settings.shoulderOffset).add(new THREE.Vector3(0, settings.height, 0));
          const playerFocus = player.position.clone().add(new THREE.Vector3(0, 1.15, 0));
          desiredLook.copy(playerFocus);
          if (aimPoint) desiredLook.lerp(aimPoint.clone().lerp(playerFocus, 0.55), settings.aimFocusStrength);
          if (softTarget?.position) desiredLook.lerp(softTarget.position.clone().add(new THREE.Vector3(0, 1.0, 0)), settings.targetFocusStrength);
          camera.position.lerp(desiredPosition, expSmoothingAlpha(settings.followSpeed, dt));
          const currentLook = playerFocus.clone().add(flatForward).lerp(desiredLook, expSmoothingAlpha(settings.lookSpeed, dt));
          camera.lookAt(currentLook);
          return { position: camera.position.clone(), lookTarget: currentLook.clone() };
        }
      };
    }
  };
}

export function createGameStateKit(config = {}) {
  return {
    name: "game-state-kit",
    install() {
      let phase = config.initialPhase ?? "ready";
      let previousPhase = null;
      let elapsed = 0;
      return {
        get phase() { return phase; },
        getState() { return { phase, previousPhase, elapsed }; },
        is(...phases) { return phases.includes(phase); },
        transition(nextPhase) { if (!nextPhase || nextPhase === phase) return false; previousPhase = phase; phase = nextPhase; elapsed = 0; return true; },
        tick(dt) { elapsed += Math.max(0, dt || 0); return { phase, previousPhase, elapsed }; }
      };
    }
  };
}

export function createKitActivationKit(rules = {}) {
  return {
    name: "kit-activation-kit",
    install({ gameState } = {}) {
      function ruleFor(phase) { return rules[phase] ?? rules.default ?? { active: [], input: [] }; }
      return {
        isActive(kitName) { const active = ruleFor(gameState?.getState?.().phase ?? "default").active ?? []; return active.includes("*") || active.includes(kitName); },
        allows(inputName) { const input = ruleFor(gameState?.getState?.().phase ?? "default").input ?? []; return input.includes("*") || input.includes(inputName); }
      };
    }
  };
}

export function createRedMountainBackdropKit(config = {}) {
  const settings = { radius: 92, layers: 4, segments: 36, colorNear: 0x9b2a1d, colorFar: 0x351018, ...config };
  return {
    name: "red-mountain-backdrop-kit",
    install({ THREE, scene } = {}) {
      const group = new THREE.Group();
      group.name = "red-mountain-backdrop";
      for (let layer = 0; layer < settings.layers; layer += 1) {
        const radius = settings.radius + layer * 18;
        const height = (settings.height ?? 20) * (1 - layer * 0.12);
        const vertices = [];
        for (let i = 0; i < settings.segments; i += 1) {
          const a0 = (i / settings.segments) * Math.PI * 2;
          const a1 = ((i + 1) / settings.segments) * Math.PI * 2;
          const r0 = Math.sin(i * 1.73 + layer) * 0.28 + Math.sin(i * 0.61 + layer * 2) * 0.38;
          const r1 = Math.sin((i + 1) * 1.73 + layer) * 0.28 + Math.sin((i + 1) * 0.61 + layer * 2) * 0.38;
          const p0 = new THREE.Vector3(Math.cos(a0) * radius, 4 + height * (0.54 + r0 * 0.22), Math.sin(a0) * radius);
          const b0 = new THREE.Vector3(Math.cos(a0) * radius, -2, Math.sin(a0) * radius);
          const p1 = new THREE.Vector3(Math.cos(a1) * radius, 4 + height * (0.54 + r1 * 0.22), Math.sin(a1) * radius);
          const b1 = new THREE.Vector3(Math.cos(a1) * radius, -2, Math.sin(a1) * radius);
          vertices.push(p0, b0, p1, b0, b1, p1);
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
        const color = new THREE.Color(settings.colorNear).lerp(new THREE.Color(settings.colorFar), layer / Math.max(1, settings.layers - 1));
        const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.95 - layer * 0.12, depthWrite: false });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = -20 - layer;
        group.add(mesh);
      }
      scene.add(group);
      return { update(dt) { group.rotation.y += dt * 0.002; }, group };
    }
  };
}

export function createRiftArenaKit(config = {}) {
  return {
    name: "rift-arena-kit",
    install({ THREE, scene } = {}) {
      const group = new THREE.Group();
      const radius = config.radius ?? 28;
      const floor = new THREE.Mesh(new THREE.CircleGeometry(radius, 96), new THREE.MeshStandardMaterial({ color: config.floorColor ?? 0x17101f, roughness: 0.86, metalness: 0.04 }));
      floor.rotation.x = -Math.PI / 2;
      group.add(floor);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.72, 0.045, 10, 128), new THREE.MeshBasicMaterial({ color: 0xff6a38, transparent: true, opacity: 0.7 }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.06;
      group.add(ring);
      const obstacles = [];
      const mat = new THREE.MeshStandardMaterial({ color: 0x2b1420, roughness: 0.92, emissive: 0x22070b, emissiveIntensity: 0.18 });
      for (let i = 0; i < 9; i += 1) {
        const angle = (i / 9) * Math.PI * 2 + 0.2;
        const r = 8 + (i % 3) * 4.2;
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.82, 2.2 + (i % 2), 7), mat);
        pillar.position.set(Math.cos(angle) * r, pillar.geometry.parameters.height * 0.5, Math.sin(angle) * r);
        pillar.userData.colliderRadius = 1.2;
        obstacles.push(pillar);
        group.add(pillar);
      }
      const gate = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.16, 12, 64), new THREE.MeshBasicMaterial({ color: 0xff7844, transparent: true, opacity: 0.82 }));
      gate.position.set(0, 2.6, -23);
      gate.rotation.x = Math.PI / 2;
      group.add(gate);
      scene.add(group);
      return {
        floor, obstacles, gate,
        collideSphere(position, objectRadius = 0.45) {
          for (const obstacle of obstacles) {
            const dx = position.x - obstacle.position.x;
            const dz = position.z - obstacle.position.z;
            const min = (obstacle.userData.colliderRadius ?? 1) + objectRadius;
            const dist = Math.hypot(dx, dz);
            if (dist > 0.0001 && dist < min) {
              position.x += (dx / dist) * (min - dist);
              position.z += (dz / dist) * (min - dist);
            }
          }
          const max = radius - objectRadius;
          const d = Math.hypot(position.x, position.z);
          if (d > max) { position.x = (position.x / d) * max; position.z = (position.z / d) * max; }
        },
        update(dt) { gate.rotation.z += dt * 0.6; }
      };
    }
  };
}

export function createMagicProjectileKit(config = {}) {
  const settings = { speed: 18, radius: 0.35, life: 2.6, damage: 12, ...config };
  return {
    name: "magic-projectile-kit",
    install({ THREE, scene, onHit } = {}) {
      const projectiles = [];
      const geometry = new THREE.SphereGeometry(settings.radius, 16, 10);
      function spawn({ ownerId, from, direction, color = 0xffd76a, damage = settings.damage, hostile = false }) {
        if (!direction || direction.lengthSq() < 1e-8) return null;
        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color }));
        mesh.position.copy(from);
        scene.add(mesh);
        const projectile = { id: `${ownerId}-${performance.now().toFixed(2)}-${projectiles.length}`, mesh, velocity: direction.clone().normalize().multiplyScalar(settings.speed), life: settings.life, radius: settings.radius, damage, hostile };
        projectiles.push(projectile);
        return projectile;
      }
      function update(dt, targets = []) {
        for (let i = projectiles.length - 1; i >= 0; i -= 1) {
          const projectile = projectiles[i];
          projectile.life -= dt;
          projectile.mesh.position.addScaledVector(projectile.velocity, dt);
          let hit = null;
          for (const target of targets) {
            if (!target?.position || target.userData?.dead) continue;
            if (projectile.hostile === Boolean(target.userData?.isBot)) continue;
            if (projectile.mesh.position.distanceTo(target.position.clone().add(new THREE.Vector3(0, 0.85, 0))) < (target.userData?.hitRadius ?? 0.75) + projectile.radius) { hit = target; break; }
          }
          if (hit) { onHit?.({ projectile, target: hit }); projectile.life = 0; }
          if (projectile.life <= 0) { scene.remove(projectile.mesh); projectile.mesh.material?.dispose?.(); projectiles.splice(i, 1); }
        }
      }
      return { spawn, update, getState: () => ({ count: projectiles.length }) };
    }
  };
}

export function createDuelBotKit(config = {}) {
  const settings = { preferredRange: 8, retreatRange: 3.2, speed: 3.2, castCooldown: 1.25, boltDamage: 9, ...config };
  return {
    name: "duel-bot-kit",
    install({ THREE, bot, target, spawnProjectile } = {}) {
      let castTimer = settings.castCooldown * 0.5;
      let state = "chase";
      const direction = new THREE.Vector3();
      const side = new THREE.Vector3();
      return {
        getState: () => ({ state, castTimer }),
        update(dt) {
          if (!bot?.position || !target?.position || bot.userData?.dead) return;
          castTimer -= dt;
          direction.subVectors(target.position, bot.position);
          const distance = direction.length();
          if (distance > 0.001) direction.normalize();
          if (distance > settings.preferredRange) { state = "chase"; bot.position.addScaledVector(direction, settings.speed * dt); }
          else if (distance < settings.retreatRange) { state = "retreat"; bot.position.addScaledVector(direction, -settings.speed * 0.9 * dt); }
          else { state = "weave"; side.set(-direction.z, 0, direction.x).normalize(); bot.position.addScaledVector(side, (Math.sin(performance.now() * 0.004) > 0 ? 1 : -1) * settings.speed * 0.55 * dt); }
          if (castTimer <= 0 && distance < settings.preferredRange + 5) {
            castTimer = settings.castCooldown;
            spawnProjectile?.({ ownerId: bot.userData?.entityId ?? "bot", from: bot.position.clone().add(new THREE.Vector3(0, 1.05, 0)), direction: direction.clone(), color: 0xff4ecb, damage: settings.boltDamage, hostile: true });
          }
        }
      };
    }
  };
}

export function createCombatHudKit() {
  return {
    name: "combat-hud-kit",
    install({ root = globalThis.document?.body } = {}) {
      const hud = document.createElement("aside");
      hud.className = "riftbound-hud";
      hud.innerHTML = `<div class="hud-title">Riftbound Duel</div><div class="hud-row"><span>Player</span><b data-player-hp>100</b></div><div class="hud-bar"><i data-player-bar></i></div><div class="hud-row"><span>Mana</span><b data-mana>100</b></div><div class="hud-bar mana"><i data-mana-bar></i></div><div class="hud-row"><span>Bot</span><b data-bot-hp>100</b></div><div class="hud-bar enemy"><i data-bot-bar></i></div><div class="hud-status" data-status>WASD move · Mouse aim · Left click cast · Shift dash · Q guard · Space parry · F2 debug</div>`;
      root.appendChild(hud);
      const refs = { playerHp: hud.querySelector("[data-player-hp]"), playerBar: hud.querySelector("[data-player-bar]"), mana: hud.querySelector("[data-mana]"), manaBar: hud.querySelector("[data-mana-bar]"), botHp: hud.querySelector("[data-bot-hp]"), botBar: hud.querySelector("[data-bot-bar]"), status: hud.querySelector("[data-status]") };
      const pct = (value, max) => `${Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))}%`;
      return {
        update({ playerHp = 100, playerMaxHp = 100, mana = 100, maxMana = 100, botHp = 100, botMaxHp = 100, phase = "playing", message = "" } = {}) {
          refs.playerHp.textContent = Math.ceil(playerHp);
          refs.playerBar.style.width = pct(playerHp, playerMaxHp);
          refs.mana.textContent = Math.ceil(mana);
          refs.manaBar.style.width = pct(mana, maxMana);
          refs.botHp.textContent = Math.ceil(botHp);
          refs.botBar.style.width = pct(botHp, botMaxHp);
          refs.status.textContent = message || (phase === "victory" ? "Victory · press R to restart" : phase === "defeat" ? "Defeat · press R to restart" : "WASD move · Mouse aim · Left click cast · Shift dash · Q guard · Space parry · F2 debug");
        }
      };
    }
  };
}
