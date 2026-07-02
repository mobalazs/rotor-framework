# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Start Here

**Before working on any task, read `docs/ai/index.yaml` first.** This file contains a categorized index of all token-optimized documentation with topic tags. Based on the user's question or task, load the relevant YAML files (e.g., `docs/ai/cross-thread-mvi.opt.yaml`, `docs/ai/view-builder-overview.opt.yaml`). These YAML files save ~40% tokens compared to full markdown while maintaining 80% content coverage.

Full markdown documentation is available in the `docs/` directory for deeper reference.

## Project Overview

Rotor Framework is a modular, ViewModel-first UI framework for Roku applications built with BrighterScript and SceneGraph. It provides a ViewBuilder system for declarative UI construction and implements the MVI (Model-View-Intent) design pattern adapted for Roku's cross-thread architecture.

## Build Commands

### Development
```bash
npm run build              # Compile the framework (no package creation)
npm run build-tests        # Compile with test configuration
npm run lint               # Run BSLint on source code
```

### Testing
```bash
npm run build-tests        # Build with Rooibos test framework enabled
npm run coverage           # Collect coverage data and fix paths
```

**Note:** Tests use the Rooibos test framework. Test configuration is in `bsconfig-tests.json` with tags: `!integration`, `!deprecated`, `!fixme`.

### Version Management
```bash
npm run update-version     # Update version across framework files
```

## Architecture Overview

### Core Architecture Layers

**1. Framework Entry Point** (`src/source/RotorFramework.bs`)
- Main orchestrator that initializes the entire framework ecosystem
- Manages the Builder, I18n service, DispatcherProvider, and Animator
- Entry point: `frameworkInstance = new Rotor.Framework(config)`

**2. ViewBuilder System** (`src/source/engine/builder/`)
- **Builder.bs**: Core engine for widget/ViewModel lifecycle (create, update, remove)
- **Tree.bs**: Virtual node tree maintaining UI hierarchy and HID (Hierarchical Identifier) system
- **WidgetCreate.bs**: Widget instantiation logic
- **WidgetUpdate.bs**: Widget update and diffing logic
- **PostProcessor.bs**: Post-build processing and plugin invocation

**3. Cross-Thread MVI Pattern** (`src/source/engine/providers/`)
- **Model**: State container (extends `BaseModel.bs`)
- **Reducer**: State transformation via middleware + reducer functions (extends `BaseReducer.bs`)
- **Dispatcher**: Thread-safe communication bridge between render and task threads
  - `Dispatcher.bs`: Main dispatcher implementation
  - `DispatcherProvider.bs`: Manages dispatcher instances and cross-thread communication

**4. Base Classes** (`src/source/base/`)
- `BaseWidget.bs`: Foundation for all UI widgets
- `BaseViewModel.bs`: Extends Widget with template system, props, and viewModelState
- `BaseModel.bs`: State container base
- `BaseReducer.bs`: State transformation base with middleware support
- `BaseStack.bs`: Navigation stack implementation
- `DispatcherOriginal.bs`: Creates dispatcher instances
- `DispatcherCrossThread.bs`: Cross-thread dispatcher interface
- `BasePlugin.bs`: Plugin lifecycle base (beforeMount, beforeUpdate, beforeDestroy)

**5. Plugin System** (`src/source/plugins/`)
- `FieldsPlugin.bs`: Dynamic field expressions and interpolation
- `FocusPlugin.bs`: Spatial navigation and focus management
- `FontStylePlugin.bs`: Typography configuration
- `ObserverPlugin.bs`: Field observation and change callbacks
- `DispatcherProviderPlugin.bs`: MVI state management integration

### Key Architectural Concepts

**Hierarchical Identifier (HID) System**
- Every widget/ViewModel has a unique HID tracking its position in the tree
- Format: `parent.child.grandchild` (e.g., `scene.header.logo`)
- Managed by Tree.bs for efficient lookup and navigation

**Widget vs ViewModel**
- **Widget**: Single SceneGraph node with configuration (fields, observers, focus, etc.)
- **ViewModel**: Groups multiple widgets with shared `props` (read-only) and `viewModelState` (mutable)
- ViewModels have a `template()` method returning widget tree configuration
- All children can access parent ViewModel's props and state without prop drilling

**MVI Cross-Thread Flow**
1. User interaction triggers Intent dispatch from render thread
2. Intent sent to task thread via Dispatcher
3. Middleware processes async operations (API calls, etc.)
4. Reducer transforms state based on Intent
5. New state dispatched back to render thread
6. ViewModels react to state changes and update UI

**Plugin Lifecycle Hooks**
- `beforeMount`: Before widget is added to SceneGraph
- `beforeUpdate`: Before widget properties are updated
- `beforeDestroy`: Before widget is removed from SceneGraph

## Directory Structure

```
src/
├── source/
│   ├── Main.brs              # Application entry point
│   ├── rotor/                # Framework source
│   │   ├── RotorFramework.bs           # Main framework class
│   │   ├── RotorFrameworkTask.bs       # Task thread counterpart
│   │   ├── engine/
│   │   │   ├── builder/                # ViewBuilder core
│   │   │   ├── providers/              # Dispatcher & provider system
│   │   │   ├── animator/               # Animation system (Animate lib)
│   │   │   ├── services/               # I18n service
│   │   │   └── Constants.bs
│   │   ├── base/                       # Base classes
│   │   ├── plugins/                    # Plugin implementations
│   │   ├── utils/                      # Helper utilities
│   │   └── libs/                       # Integrated libraries (Animate)
│   └── tests/                # Test files
├── components/               # SceneGraph components
├── assets/                   # Static assets
└── manifest                  # Roku manifest file
```

## AI-Optimized Documentation

The project includes token-efficient YAML documentation for AI assistants in `docs/ai/`:

**Start here:** `docs/ai/index.yaml` - Categorized index of all documentation with topic tags

**Available Documentation:**
- Core: Framework initialization, Framework overview, Cross-Thread MVI architecture
- ViewBuilder: Overview, Widget reference, ViewModel reference
- Plugins: Fields, Focus, FontStyle, Observer
- Features: i18n support

Each YAML file (~40% fewer tokens than markdown) contains core concepts, API references, patterns, best practices, and common pitfalls with solutions.

Full markdown documentation is in `docs/` directory.

## Development Notes

### BrighterScript Configuration
- Root: `bsconfig.json` (production build)
- Tests: `bsconfig-tests.json` (extends base, adds Rooibos)
- Linting: `bslint.json`
- Source: `src/` directory staged to `dist/`
- Auto-imports component scripts enabled

### Testing with Rooibos
- Test framework: Rooibos v6.0.0-alpha.48 (vendored, patched)
- Coverage enabled with LCOV output to `coverage.lcov`
- Test tags filter: excludes `integration`, `deprecated`, `fixme`
- Coverage excludes: constants, Main.brs, generated code, libs, BaseWidget.bs

### Code Style
- Language: BrighterScript (.bs files) - superset of BrightScript
- Namespace: `Rotor` for all framework classes
- Classes use PascalCase, methods use camelCase
- Lifecycle hooks prefixed with `on` (onCreateView, onUpdateView, etc.)
- Plugin hooks prefixed with `before` (beforeMount, beforeUpdate, etc.)

## Common Patterns

### Creating a ViewModel
```brightscript
class MyViewModel extends Rotor.ViewModel
    override function template() as Object
        return {
            id: "container",
            nodeType: "Group",
            children: [
                {
                    id: "label",
                    nodeType: "Label",
                    fields: {
                        text: m.props.title
                    }
                }
            ]
        }
    end function
end class
```

### MVI Pattern Implementation
```brightscript
' Model
class AppModel extends Rotor.Model
    state = { count: 0 }
end class

' Reducer
class AppReducer extends Rotor.Reducer
    override function reduce(intent, state) as Object
        if intent.type = "INCREMENT"
            state.count = state.count + 1
        end if
        return state
    end function
end class

' Dispatch from UI
dispatcher.dispatch({ type: "INCREMENT" })
```

### Using Plugins

**Observer Plugin — critical scope rules:**
- `callback: sub(payload)` fires WITH payload; `handler: sub()` fires WITHOUT. Mutually exclusive, one required.
- In both cases `m` = **the widget**, NOT the ViewModel.
- **Never** pass a ViewModel method directly: `callback: m.myMethod` → crash at runtime.
- **Always** bridge via inline sub: `callback: sub(payload) m.getViewModel().myMethod(payload) end sub`
- Methods called via `getViewModel()` must not be `private` (generic object call, no class typing).
- `once: true` → auto-remove after first fire. `until: fn` → remove when fn returns true.
- `alwaysNotify: true` (default) → fires even when value is unchanged.

**Focus Plugin — key event routing:**
- Callback is `onSelect` (NOT `onSelected`).
- Key routing order inside `executeNavigationAction`:
  1. Direction keys (up/down/left/right/back) → navigation logic (direction overrides, spatial, bubbling)
  2. OK → `onSelect` callback
  3. All other keys (play, ff, rew, replay…) → `keyPressHandler` (FocusItem first, then bubbles to groups)
- Direction keys and OK **never reach** `keyPressHandler`.
- `keyPressHandler` is on `BaseFocusConfig` — works on both FocusItems and FocusGroups.

```brightscript
{
    id: "button",
    nodeType: "Rectangle",
    fields: { color: "0xFF0000FF" },
    observers: [{
        field: "buttonSelected",
        ' m = widget here, not ViewModel — bridge to ViewModel explicitly:
        callback: sub(value) m.getViewModel().onButtonSelected(value) end sub
    }],
    focus: {
        onFocusChanged: sub(isFocused) m.getViewModel().onFocusChanged(isFocused) end sub,
        onSelect: sub() m.getViewModel().onSelect() end sub,
        keyPressHandler: sub(key as string) m.getViewModel().onKeyPress(key) end sub
    }
}
```

### Root Widget Scope
On the **root widget** of a `template()`, `m` IS the ViewModel — call methods directly without `getViewModel()`.
On any child widget, use `m.getViewModel()` (own ViewModel) or `m.getParentViewModel()` (parent ViewModel).

### ViewModel Lifecycle
```
onCreateView()      → before template() — l10n NOT available yet
template()          → widget tree definition (called once on create)
onTemplateCreated() → after render — l10n IS available
onUpdateView()      → calls m.render() by default → re-runs template()
onDestroyView()     → cleanup
```
- `m.render()` without args → full re-render via `template()`
- `m.render(partial)` → partial update of specific widgets

---

## BrightScript & BrighterScript Reference

This section is self-contained for developers without prior Roku experience.

### Threading Model

Roku has two threads; violating boundaries causes crashes or silent data corruption.

| Thread | Owns | Can do |
|--------|------|--------|
| Render thread | All SceneGraph nodes | UI reads/writes, field observers, focus |
| Task thread | Business logic | API calls, state mutation, reducers |

- Cross-thread node writes cause **rendezvous** (blocking synchronization). Prefer `CopyMessage` (async) for state delivery.
- Use `observeFieldScoped` instead of `observeField` — auto-removed on component destroy, prevents leaks.

### `m.` Scope

```brightscript
' .brs anonymous function: m = the function's OWN scope, NOT the component
sub init()
    self = m  ' capture component reference
    callback = function()
        self.doSomething()  ' correct
        m.doSomething()     ' wrong: m is the anonymous function's scope
    end function
end sub

' BrighterScript lambda (.bs): correctly closes over outer m
sub init()
    callback = () => m.doSomething()  ' correct: m = component
end sub

' BrighterScript class method: m = class instance
class MyClass
    sub doWork()
        m.value = 1  ' m = MyClass instance
    end sub
end class
```

### Null, Types & Common Pitfalls

```brightscript
' Null is "invalid"
if x = invalid then ...
if x <> invalid then ...

' roSGNode comparison: = operator causes Type Mismatch runtime error
if node1 = node2 then ...           ' CRASH
if node1.isSameNode(node2) then ... ' correct (guard against invalid first)

' Str() on large integers → scientific notation
timestamp = 1770000000
print Str(timestamp)               ' "1.77e+09" — WRONG for URLs/tokens
print "%d".Format(timestamp)       ' "1770000000" — correct

' Arrays and AAs are pass-by-reference
a = [1, 2, 3]
b = a
b.push(4)  ' also modifies a
b = a.clone()  ' shallow copy if needed
```

### BrighterScript-Specific

- Classes compile to BrightScript AA factories — no runtime type reflection.
- `namespace Rotor` groups all framework classes; avoid namespace collisions.
- `typecast x as Rotor.Widget` → compile-time type hint only, zero runtime cost. Use in plugin callbacks for IDE support.
- `import` resolves at compile time; circular imports cause build errors.
- Lambdas (`() =>`) close over `m` correctly. Anonymous `function()`/`sub()` blocks do NOT.

### Roku Device API Pitfalls

```brightscript
' roDeviceInfoEvent does NOT implement ifSourceIdentity
' Calling GetSourceIdentity() on it causes a crash.
' Route by event type, not identity — check type-based registry first in message loop.

' Caption mode event
if msg.isCaptionModeChanged() then
    info = msg.GetInfo()  ' returns AA: { Mode: "Off"/"On"/"Instant replay", Mute: boolean }
    mode = info.Mode      ' string
    ' NOT: msg.GetInfo() returns string — only the sync roDeviceInfo.GetCaptionsMode() does
end if
' Caption events fire multiple times on app startup — this is normal device behavior.

' roUrlTransfer — always use port-based async, never synchronous GetToString() on task thread
' with active message port, or events will be lost.
```

---

## Framework Internals

For contributors working on the framework itself.

### Known Critical Fixes

**`DispatcherCore.notifyListeners()` — listener removal mid-iteration**
Original code cached `listenerCount` before the loop. If a listener removed itself during notification, the cached count was wrong → crash. Fix: use `m.listeners.Count()` (live count) directly in the loop condition.

**`NodePool.resetNode()` — stale node.id**
`resetNode()` must set `node.id = ""` as its first operation. The Animator sets `node.id = "${target.id}-${target.HID}"` for interpolator references. When nodes are reused from the pool with stale ids, the animator fails to find the correct interpolator → "Failed to update interpolator field" error and visual scrambling after navigation.

### Port Object Registry

Two routing modes in `BaseReducer` for async Roku port events:

| Mode | Registry | Use for |
|------|----------|---------|
| Identity-based (default) | `portObjectRegistry` | Events with `ifSourceIdentity` (roUrlEvent, roChannelStoreEvent) |
| Type-based | `portObjectTypeRegistry` | Events WITHOUT `ifSourceIdentity` (roDeviceInfoEvent, roInputEvent) |

Pass `eventType` string (e.g. `"roDeviceInfoEvent"`) to `registerPortObject()` to use type-based routing.
The message loop checks type-based registry first to avoid calling `GetSourceIdentity()` on unsupported events.

```brightscript
' In a Reducer:
m.registerPortObject(portObject, context, persistent)          ' identity-based
m.registerPortObject(portObject, context, persistent, "roDeviceInfoEvent")  ' type-based
m.unregisterPortObject(portObject)
```

### `onDispatcherCreated` Lifecycle Hook

Virtual method on `BaseReducer`, called by `DispatcherOriginal.new()` after the dispatcher is fully registered. Use this for any initialization that requires the dispatcher to exist (e.g. port object registration, cross-dispatcher subscriptions). The reducer constructor runs **before** `DispatcherOriginal` links it — the dispatcher is not yet available in the constructor.

---

## Project-Specific Considerations

- This is a framework/library project, not an application. Changes should maintain backward compatibility.
- The framework must work within Roku's threading constraints (render thread for UI, task threads for async work).
- All SceneGraph node operations must occur on the render thread.
- State management via MVI pattern ensures predictable, testable state flow.
- Plugin system is extensible - new plugins should follow the BasePlugin lifecycle.
- The HID system is critical for widget tree integrity - never bypass it.
- ViewModels provide isolated state scopes - props are immutable, viewModelState is mutable.
