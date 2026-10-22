import {
  AnimationMixer,
  LoopRepeat,
  Object3D,
  Quaternion,
  Vector3,
  type AnimationAction,
  type AnimationClip,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import type { SkinMotion } from "./skeleton";

interface Action {
  "act.delay": number;
  "act.delayVariation": number;
  "act.entityName": string;
  "act.event": number;
  "act.eventToTrigger": string;
  "act.motionSpeed"?: number;
  "act.stopAfterNRepeats": number;
  "act.switchIndex": number;
  "act.type": number;
  "act.userEventId": string;
}

interface Value {
  "any.type": string;
  "any.value": unknown;
}

interface ScriptNode {
  type: string;
  node: Record<string, unknown> & { defaults?: Record<string, Value> };
  connections?: Record<
    string,
    { pinIn: string; pinOut: string; target: string }
  >;
}

interface Script {
  nodes: Record<string, ScriptNode>;
  variables?: Record<string, Value>;
}

interface Scenario {
  owner: Object3D;
  script: Script;
  variables: Map<string, unknown>;
}

const SELF_ENTITY = "*** Self ***";
const MAX_DEPTH = 256;
/** events firing events, as a last guard against graphs that loop */
const MAX_NESTING = 32;

const SCENE_LOADED_EVENT = 1;
const USER_EVENT = 2;
const ANIMATION_END_EVENTS = [3, 8];

const START_ANIMATION_ACTION = 6;
const STOP_ANIMATION_ACTION = 7;
const STATE_SWITCH_ACTION = 9;
const TRIGGER_EVENT_ACTION = 10;
const ANIMATING_ACTIONS = [
  START_ANIMATION_ACTION,
  STOP_ANIMATION_ACTION,
  STATE_SWITCH_ACTION,
  TRIGGER_EVENT_ACTION,
];
const ANIMATING_FUNCTIONS = [
  "StartAnimation",
  "StopAnimation",
  "ActivateState",
  "MotionUpdateSpeed",
  "MotionResume",
  "SetRotation",
  "TriggerCustomEvent",
];
// the pins graph execution leaves a node through
const EXEC_OUTPUTS = ["event", "exit", "true", "false"];

/** fired once the camo is shown, like entering the garage */
export const HANGAR_EVENTS = ["TankAliveInHangar", "TankIsShownInNewScreen"];
/** not a game event; replays the garage animations */
export const GARAGE_EVENT = "Garage";

/** events the game fires around battles, never offered as triggers */
const IGNORED_EVENTS = [
  ...HANGAR_EVENTS,
  "onBattleStart",
  "onBattleRestart",
  "TankAliveInBattle",
  "RestartFX",
];

function nameOf(object: Object3D): string {
  return object.userData.name ?? object.name;
}

function findChild(entity: Object3D, name: string): Object3D | undefined {
  for (const child of entity.children) {
    if (nameOf(child) === name) return child;

    const found = findChild(child, name);

    if (found) return found;
  }
}

function resolveTarget(owner: Object3D, entityName: string, part: Object3D) {
  if (entityName === SELF_ENTITY) return owner;

  const [first, ...rest] = entityName.split("->");
  let start = findChild(owner, first);

  // targets may also be an ancestor or one of its other descendants
  for (let ancestor = owner; ancestor !== part && !start; ) {
    ancestor = ancestor.parent!;
    start = nameOf(ancestor) === first ? ancestor : findChild(ancestor, first);
  }

  return rest.reduce<Object3D | undefined>(
    (current, name) => current && findChild(current, name),
    start,
  );
}

/**
 * Plays the animations of camo parts. Parts are passed as their roots because
 * they get rendered away from the loaded scene.
 */
export function createSkinRuntime(parts: Object3D[], clips: AnimationClip[]) {
  const mixer = new AnimationMixer(new Object3D());
  const partOf = new Map<Object3D, Object3D>();
  const scenarios: Scenario[] = [];
  const actions = new Map<Object3D, Action[]>();
  const playing = new Map<AnimationAction, Object3D>();
  const timers: [time: number, run: () => void, ambient: boolean][] = [];
  // garage animations are ambient: they don't block the menu and a trigger
  // stops them, unlike animations a trigger started
  const ambientActions = new Set<AnimationAction>();
  let ambient = false;
  const events = new Set<string>();
  const internalEvents = new Set<string>();
  const activeStates = new Map<Object3D, number>();
  const motionSpeeds = new Map<Object3D, number>();
  // reset whenever the menu starts a new session (a trigger or a replay)
  const firedAlarms = new Set<string>();
  const started = new Set<Object3D>();
  let nesting = 0;
  let elapsed = 0;

  for (const part of parts) {
    part.traverse((object) => partOf.set(object, part));
  }

  partOf.forEach((_, object) => {
    const { scenario, actions: objectActions } = object.userData;

    if (objectActions) {
      actions.set(object, objectActions);

      for (const action of objectActions as Action[]) {
        if (action["act.event"] === USER_EVENT) {
          events.add(action["act.userEventId"]);
        }
        if (action["act.type"] === TRIGGER_EVENT_ACTION) {
          internalEvents.add(action["act.eventToTrigger"]);
        }
      }
    }

    if (scenario === undefined) return;

    const scripts = partOf.get(object)!.userData.scripts as
      | Record<string, Script>
      | undefined;
    const script = scripts?.[scenario];

    if (!script) return;

    scenarios.push({ owner: object, script, variables: new Map() });

    for (const node of Object.values(script.nodes)) {
      if (node.node["ScenarioEventNode.eventName"] === "Custom") {
        events.add(node.node.defaults!["Event Name"]["any.value"] as string);
      }
      if (
        node.node["scenarioFunctionNode.functionName"] === "TriggerCustomEvent"
      ) {
        internalEvents.add(
          node.node.defaults?.["event name"]?.["any.value"] as string,
        );
      }
    }
  });

  mixer.addEventListener("finished", ({ action }) => {
    const entity = playing.get(action);

    if (!entity) return;

    playing.delete(action);

    within(ambientActions.has(action), () => {
      for (const event of ANIMATION_END_EVENTS) fireAction(entity, event);

      for (
        let ancestor: Object3D | null = entity;
        ancestor;
        ancestor = ancestor.parent
      ) {
        const owned = scenarios.filter(({ owner }) => owner === ancestor);

        if (owned.length === 0) continue;

        for (const scenario of owned) {
          fireScenario(scenario, "Motion Fragment Stop");
          fireScenario(scenario, "Motion Sequence Stop");
        }
        break;
      }
    });
  });

  function schedule(delay: number, run: () => void) {
    if (delay <= 0) {
      run();
    } else {
      timers.push([elapsed + delay, run, ambient]);
    }
  }

  // runs follow-up work in the session (ambient or triggered) that caused it
  function within(isAmbient: boolean, run: () => void) {
    const previous = ambient;

    ambient = isAmbient;
    try {
      run();
    } finally {
      ambient = previous;
    }
  }

  function startAnimation(entity: Object3D, repeats?: number, speed = 1) {
    const motion = entity.userData.motion as SkinMotion | undefined;

    if (!motion) {
      for (const child of entity.children) {
        startAnimation(child, repeats, speed);
      }
      return;
    }

    const clip = clips.find((clip) => clip.name === motion.clip);

    // some clips restart themselves when they end; once per session keeps
    // them from looping forever
    if (!clip || started.has(entity)) return;

    started.add(entity);

    const action = mixer.clipAction(clip, partOf.get(entity));
    const count = repeats ?? motion.repeats;

    action.reset();
    // endless loops play once so garage animations settle and the triggers
    // free up; the menu can replay them
    action.setLoop(LoopRepeat, count > 0 ? count : 1);
    action.clampWhenFinished = !motion.rewind;
    action.timeScale =
      motion.playbackRate * speed * (motionSpeeds.get(entity) ?? 1);
    action.play();
    playing.set(action, entity);

    if (ambient) {
      ambientActions.add(action);
    } else {
      ambientActions.delete(action);
    }
  }

  function stopAnimation(entity: Object3D) {
    for (const [action, owner] of playing) {
      if (owner !== entity) continue;

      action.stop();
      playing.delete(action);
    }
  }

  // graphs may set the speed before starting the motion
  function setMotionSpeed(entity: Object3D, speed: number) {
    motionSpeeds.set(entity, speed);

    for (const [action, owner] of playing) {
      if (owner !== entity) continue;

      action.timeScale =
        (owner.userData.motion as SkinMotion).playbackRate * speed;
    }
  }

  function resumeMotion(entity: Object3D) {
    for (const [action, owner] of playing) {
      if (owner === entity) action.paused = false;
    }
  }

  function activateState(entity: Object3D, state: number) {
    const states = entity.userData.stateNames as string[] | undefined;

    // re-activating the current state is a no-op; graphs rely on this
    if (!states || activeStates.get(entity) === state) return;

    activeStates.set(entity, state);

    for (const child of entity.children) {
      const index = states.indexOf(nameOf(child));

      if (index !== -1) child.visible = index === state;
    }

    for (const scenario of scenarios) {
      if (scenario.owner === entity) {
        fireScenario(scenario, "State Activated", state);
      }
    }
  }

  function runAction(owner: Object3D, action: Action) {
    const target = resolveTarget(
      owner,
      action["act.entityName"],
      partOf.get(owner)!,
    );

    if (!target) return;

    schedule(
      action["act.delay"] + Math.random() * action["act.delayVariation"],
      () => {
        switch (action["act.type"]) {
          case START_ANIMATION_ACTION:
            startAnimation(
              target,
              action["act.stopAfterNRepeats"] > 0
                ? action["act.stopAfterNRepeats"]
                : undefined,
              action["act.motionSpeed"] || 1,
            );
            break;

          case STOP_ANIMATION_ACTION:
            stopAnimation(target);
            break;

          case STATE_SWITCH_ACTION:
            activateState(target, action["act.switchIndex"]);
            break;

          case TRIGGER_EVENT_ACTION:
            trigger(action["act.eventToTrigger"]);
            break;
        }
      },
    );
  }

  function fireAction(entity: Object3D, event: number, name?: string) {
    for (const action of actions.get(entity) ?? []) {
      if (
        action["act.event"] === event &&
        (name === undefined || action["act.userEventId"] === name)
      ) {
        runAction(entity, action);
      }
    }
  }

  function fireScenario(scenario: Scenario, event: string, value?: unknown) {
    if (nesting >= MAX_NESTING) return;

    nesting++;
    try {
      runScenario(scenario, event, value);
    } catch (error) {
      // an unsupported graph only loses its own animations
      console.warn(`Skin scenario failed on "${event}"`, error);
    } finally {
      nesting--;
    }
  }

  function runScenario(scenario: Scenario, event: string, value?: unknown) {
    const { nodes } = scenario.script;
    let depth = 0;

    function input(id: string, pin: string): unknown {
      const node = nodes[id];
      const connection = Object.values(node.connections ?? {}).find(
        (connection) => connection.pinIn === pin,
      );

      return connection
        ? output(connection.target, connection.pinOut)
        : node.node.defaults?.[pin]?.["any.value"];
    }

    function output(id: string, pin: string): unknown {
      const { type, node } = nodes[id];
      const get = (name: string) => input(id, name);
      const number = (name: string) => Number(get(name) ?? 0);

      switch (type) {
        case "ScenarioSceneInfoNode":
          return node["scenarioSceneInfoNode.infoKind"] === "GetCurrentScene"
            ? partOf.get(scenario.owner)
            : scenario.owner;

        case "ScenarioGetVarNode":
          return (
            scenario.variables.get(
              node["scenarioGetVarNode.varPath"] as string,
            ) ?? 0
          );

        case "ScenarioSetVarNode":
          return (
            scenario.variables.get(
              node["scenarioSetVarNode.varPath"] as string,
            ) ?? 0
          );

        case "ScenarioGetMemberNode": {
          const object = get("object") as Object3D | number[] | undefined;
          const field = node["scenarioGetMemberNode.fieldName"];

          if (Array.isArray(object)) return field === "X" ? object[0] : 0;
          if (!object) return undefined;

          switch (field) {
            case "stateSwitcherVisibility":
              return object.visible;
            case "parent":
              return object.parent ?? undefined;
            case "name":
              return nameOf(object);
          }
          return undefined;
        }

        case "ScenarioFunctionNode": {
          const name = `${node["scenarioFunctionNode.className"]}.${node["scenarioFunctionNode.functionName"]}`;
          const entity = get("entity") as Object3D | undefined;

          switch (name) {
            case "Entity.FindChildByName":
              return entity && findChild(entity, get("name") as string);
            case "Entity.FindParentByName": {
              const target = get("name") as string;

              for (
                let ancestor = entity?.parent;
                ancestor;
                ancestor = ancestor.parent
              ) {
                if (nameOf(ancestor) === target) return ancestor;
              }
              return undefined;
            }
            case "Entity.GetVisibility":
              return (get("arg0") as Object3D | undefined)?.visible ?? false;
            case "Random.Random":
              return Math.floor(Math.random() * number("n"));
            case "Random.RandomFloat":
              return Math.random();
            case "Vector4.Make":
              return [number("x"), number("y"), number("z"), number("w")];
            case "Vector4.Add":
            case "Vector4.Subtract": {
              const vector = (value: unknown) =>
                Array.isArray(value) ? (value as number[]) : [0, 0, 0, 0];
              const a = vector(get("a"));
              const b = vector(get("b"));
              const sign = name === "Vector4.Add" ? 1 : -1;

              return a.map((value, index) => value + sign * b[index]);
            }
            case "Quaternion.MakeFastAroundX":
            case "Quaternion.MakeFastAroundY":
              return new Quaternion().setFromAxisAngle(
                name.endsWith("X")
                  ? new Vector3(1, 0, 0)
                  : new Vector3(0, 1, 0),
                degToRad(number("deg")),
              );
            case "Quaternion.Multiply":
              return (get("a") as Quaternion | undefined)
                ?.clone()
                .multiply(
                  (get("b") as Quaternion | undefined) ?? new Quaternion(),
                );
            case "String.Merge":
              // graphs use Separator as the prefix and Postfix as the number
              return [get("Suffix"), get("Separator"), get("Postfix")]
                .map((part) => (part === undefined ? "" : String(part)))
                .join("");
            case "String.Compare":
              return get("1") === get("2");
            case "bool.Or":
              return Boolean(get("a")) || Boolean(get("b"));
            case "TankComponent.GetSpeed":
            case "TankComponent.GetTurretAngle":
            case "TankComponent.GetGunAngle":
              return 0;
          }

          const operator = node["scenarioFunctionNode.functionName"] as string;
          const a = number("a");
          const b = number("b");

          if (operator === "==") return a === b;
          if (operator === ">") return a > b;
          if (operator === ">=") return a >= b;
          if (operator === "<=") return a <= b;
          if (operator.startsWith("Add")) return a + b;
          if (operator.startsWith("Subtract")) return a - b;
          if (operator.startsWith("Multiply")) return a * b;
          if (operator.startsWith("Divide")) return b === 0 ? 0 : a / b;
          if (operator.startsWith("Lerp")) return a + (b - a) * number("t");

          return undefined;
        }
      }

      return undefined;
    }

    function follow(id: string, pin: string) {
      for (const connection of Object.values(nodes[id].connections ?? {})) {
        if (connection.pinIn === pin) run(connection.target);
      }
    }

    function run(id: string) {
      if (++depth > MAX_DEPTH) return;

      const { type, node } = nodes[id];
      const get = (name: string) => input(id, name);

      switch (type) {
        case "ScenarioBranchNode":
          follow(id, get("condition") ? "true" : "false");
          return;

        case "ScenarioSetVarNode":
          scenario.variables.set(
            node["scenarioSetVarNode.varPath"] as string,
            get("set"),
          );
          follow(id, "exit");
          return;

        case "ScenarioSetAlarmClockNode": {
          const entity =
            (get("entity") as Object3D | undefined) ?? scenario.owner;
          const alarm = `${scenarios.indexOf(scenario)}:${id}`;

          // alarms that re-arm themselves would loop forever
          if (firedAlarms.has(alarm)) {
            follow(id, "exit");
            return;
          }

          firedAlarms.add(alarm);
          schedule(Number(get("delay") ?? 0), () => {
            for (const other of scenarios) {
              if (other.owner === entity) fireScenario(other, "Alarm Clock");
            }
          });
          follow(id, "exit");
          return;
        }

        case "ScenarioFunctionNode": {
          const name = `${node["scenarioFunctionNode.className"]}.${node["scenarioFunctionNode.functionName"]}`;
          const entity = get("entity") as Object3D | undefined;

          switch (name) {
            case "Entity.StartAnimation":
              if (entity) {
                startAnimation(entity, Number(get("repeats") ?? 0));
              }
              break;
            case "Entity.StopAnimation":
              if (entity) stopAnimation(entity);
              break;
            case "Entity.ActivateState":
              if (entity) activateState(entity, Number(get("state") ?? 0));
              break;
            case "Entity.MotionUpdateSpeed":
              if (entity) setMotionSpeed(entity, Number(get("speed") ?? 1));
              break;
            case "Entity.MotionResume":
              if (entity) resumeMotion(entity);
              break;
            case "Entity.SetRotation": {
              const self = get("self") as Object3D | undefined;
              const value = get("value");

              if (self && value instanceof Quaternion) {
                self.quaternion.copy(value);
              }
              break;
            }
            case "Entity.TriggerCustomEvent":
              trigger(get("event name") as string);
              break;
          }

          follow(id, "exit");
          return;
        }
      }
    }

    for (const [id, { type, node }] of Object.entries(nodes)) {
      if (
        type !== "ScenarioEventNode" ||
        node["ScenarioEventNode.eventName"] !== event
      ) {
        continue;
      }

      const defaults = node.defaults ?? {};

      if (
        event === "Custom" &&
        defaults["Event Name"]?.["any.value"] !== value
      ) {
        continue;
      }
      if (
        event === "State Activated" &&
        Number(defaults.State?.["any.value"] ?? 0) !== value
      ) {
        continue;
      }

      follow(id, "event");
    }
  }

  function trigger(name: string) {
    if (nesting >= MAX_NESTING) return;

    nesting++;
    try {
      for (const scenario of scenarios) fireScenario(scenario, "Custom", name);
      for (const entity of actions.keys()) fireAction(entity, USER_EVENT, name);
    } finally {
      nesting--;
    }
  }

  // start like the garage: initial states, load events, then hangar events
  function start() {
    partOf.forEach((_, object) => {
      const { stateNames: states, state } = object.userData as {
        stateNames?: string[];
        state?: string;
      };

      if (!states) return;

      // no state name means the switcher starts with nothing active
      activeStates.set(
        object,
        state === undefined ? -1 : states.indexOf(state),
      );

      for (const child of object.children) {
        if (states.includes(nameOf(child))) {
          child.visible = nameOf(child) === state;
        }
      }
    });

    for (const scenario of scenarios) {
      scenario.variables = new Map(
        Object.entries(scenario.script.variables ?? {}).map(
          ([name, variable]) => [name, variable["any.value"]],
        ),
      );
    }

    for (const entity of actions.keys()) {
      fireAction(entity, SCENE_LOADED_EVENT);
    }
    for (const scenario of scenarios) fireScenario(scenario, "Added");
    for (const event of HANGAR_EVENTS) trigger(event);
  }

  within(true, start);

  const hasGarageAnimation = playing.size > 0 || timers.length > 0;

  // whether firing the event can move or switch anything; some events only
  // drive particles, which would make for buttons that do nothing
  function animates(event: string) {
    for (const entityActions of actions.values()) {
      for (const action of entityActions) {
        if (
          action["act.event"] === USER_EVENT &&
          action["act.userEventId"] === event &&
          ANIMATING_ACTIONS.includes(action["act.type"])
        ) {
          return true;
        }
      }
    }

    return scenarios.some(({ script: { nodes } }) => {
      const visited = new Set<string>();

      function reaches(id: string): boolean {
        if (visited.has(id)) return false;

        visited.add(id);

        const { type, node } = nodes[id];

        if (
          type === "ScenarioSetAlarmClockNode" ||
          ANIMATING_FUNCTIONS.includes(
            node["scenarioFunctionNode.functionName"] as string,
          )
        ) {
          return true;
        }

        return Object.values(nodes[id].connections ?? {}).some(
          (connection) =>
            EXEC_OUTPUTS.includes(connection.pinIn) &&
            reaches(connection.target),
        );
      }

      return Object.entries(nodes).some(
        ([id, { node }]) =>
          node["ScenarioEventNode.eventName"] === "Custom" &&
          node.defaults?.["Event Name"]?.["any.value"] === event &&
          reaches(id),
      );
    });
  }

  return {
    /** events the camo reacts to that can be triggered from the menu */
    events: [...events].filter(
      (event) =>
        !IGNORED_EVENTS.includes(event) &&
        !internalEvents.has(event) &&
        animates(event),
    ),

    /** fires an event from the menu, cutting ambient animations short */
    trigger(name: string) {
      for (const action of ambientActions) {
        action.stop();
        playing.delete(action);
      }

      ambientActions.clear();

      for (let index = timers.length - 1; index >= 0; index--) {
        if (timers[index][2]) timers.splice(index, 1);
      }

      firedAlarms.clear();
      started.clear();
      within(false, () => trigger(name));
    },

    /** whether a triggered animation is playing or about to */
    busy() {
      return (
        [...playing.keys()].some((action) => !ambientActions.has(action)) ||
        timers.some(([, , isAmbient]) => !isAmbient)
      );
    },

    /** whether the camo animates on its own in the garage */
    hasGarageAnimation,

    /** plays the garage animations again from the start */
    replay() {
      mixer.stopAllAction();
      playing.clear();
      ambientActions.clear();
      timers.length = 0;
      firedAlarms.clear();
      started.clear();
      motionSpeeds.clear();
      within(true, start);
    },

    /** returns whether anything is still animating */
    update(delta: number) {
      elapsed += delta;

      for (let index = timers.length - 1; index >= 0; index--) {
        if (timers[index][0] > elapsed) continue;

        const [[, run, isAmbient]] = timers.splice(index, 1);

        within(isAmbient, run);
      }

      mixer.update(delta);

      return playing.size > 0 || timers.length > 0;
    },

    dispose() {
      mixer.stopAllAction();
      for (const part of parts) mixer.uncacheRoot(part);
    },
  };
}

export type SkinRuntime = ReturnType<typeof createSkinRuntime>;
