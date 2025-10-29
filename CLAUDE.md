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
npm run coverage           # Collect and process code coverage
npm run collect-coverage   # Extract coverage data
npm run fix-coverage       # Fix coverage file paths
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
- `DispatcherCreator.bs`: Creates dispatcher instances
- `DispatcherExternal.bs`: External dispatcher interface
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
- Core: Framework overview, Cross-Thread MVI architecture
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
```brightscript
{
    id: "button",
    nodeType: "Rectangle",
    fields: { color: "0xFF0000FF" },
    observers: [{                    ' Observer Plugin
        field: "buttonSelected",
        callback: function(value)
            ' Handle selection
        end function
    }],
    focus: {                         ' Focus Plugin
        focusable: true,
        onFocusChange: function(hasFocus)
            ' Handle focus change
        end function
    }
}
```

## Project-Specific Considerations

- This is a framework/library project, not an application. Changes should maintain backward compatibility.
- The framework must work within Roku's threading constraints (render thread for UI, task threads for async work).
- All SceneGraph node operations must occur on the render thread.
- State management via MVI pattern ensures predictable, testable state flow.
- Plugin system is extensible - new plugins should follow the BasePlugin lifecycle.
- The HID system is critical for widget tree integrity - never bypass it.
- ViewModels provide isolated state scopes - props are immutable, viewModelState is mutable.
