# ViewModel Reference

[← README.md](../README.md#-learn-more) | [🌱](./ai/view-builder-viewmodel-reference.opt.yaml)

## Overview

A **ViewModel** extends the base Widget class to group multiple widgets with shared state and behavior. It separates presentation logic from business logic by encapsulating both the widget tree structure and the state management.

**Core Methods:**

| Method | Required | Description |
|--------|----------|-------------|
| `template()` | Yes | Returns the widget tree configuration object. Called once during ViewModel creation. |
| `setProps(newProps)` | No | Updates the ViewModel's props. Triggers onUpdateView() as default. |

**Lifecycle Hooks:**

All lifecycle hooks are optional and should be declared with the `override` keyword.

| Hook | When Called | Purpose |
|------|-------------|---------|
| `onCreateView()` | After ViewModel creation, before template() | Initialize state, setup listeners, configure initial values |
| `onTemplateCreated()` | After template() returns, before rendering | Access rendered widgets, setup widget-specific logic |
| `onUpdateView()` | When ViewModel updates (after setProps or update props via render) | React to prop changes, update state based on new props |
| `onDestroyView()` | Before ViewModel destruction | Cleanup resources, remove listeners, clear references |

**Note on `onUpdateView()`:**
The framework intentionally does **not** automatically re-render the UI when a ViewModel receives new props via `render()` or `setProps()`. This design choice optimizes for Roku's resource constraints and allows for use-case-specific performance optimizations. Override `onUpdateView()` to implement custom UI update logic based on prop changes—you control exactly which widgets update and when.

This does **not** affect initial rendering—the UI is rendered normally based on `template()` using the initial `props` and `viewModelState` values. The `onUpdateView()` hook specifically handles **subsequent updates** after the ViewModel is already mounted and displayed.

**Shared Properties:**

| Property | Scope | Mutability | Description |
|----------|-------|------------|-------------|
| `props` | All widgets in ViewModel | Read-only | Configuration passed during render, available as `m.props` in all widgets |
| `viewModelState` | All widgets in ViewModel | Mutable | Shared state, available as `m.viewModelState` in all widgets |

**How it works:**
1. ViewModel class is instantiated
2. ViewModel's root widget is added to virtual tree
3. Default `props` and `viewModelState` are extended from config.
4. Widget is decorated with framework methods and plugins
5. `onCreateView()` is called (if defined)
6. `template()` is called to get widget tree configuration
7. Plugins are applied to configure widget behavior (fields, focus, observer, etc.)
8. All child widgets in the tree share the same `props` and `viewModelState` references
9. Widgets can access `m.props` and `m.viewModelState` in field expressions and hooks
10. When ViewModel is destroyed, `onDestroyView()` is called and references are cleared

**Structure:**

```brightscript
class MyViewModel extends Rotor.ViewModel
    ' Shared configuration (default, extended during via config)
    props = {}

    ' Shared mutable state (default, extended during via config)
    viewModelState = {}

    ' Required: Returns widget tree configuration
    override function template() as object
        return { ... }
    end function

    ' Lifecycle hooks (optional)
    override sub onCreateView()
    override sub onTemplateCreated()
    override sub onUpdateView()
    override sub onDestroyView()

    ' Method for updating props
    override sub setProps(newProps as object)
end class
```


**ViewModel example:**

```brightscript
class ButtonViewModel extends Rotor.ViewModel

    props = {
        label: "Click Me",
        enabled: true
    }

    viewModelState = {
        isFocused: false,
        clickCount: 0
    }

    override function template() as object
        return {
            nodeType: "Group",
            children: [{
                id: "background",
                nodeType: "Rectangle",
                fields: {
                    width: 200,
                    height: 60,
                    color: function() as string typecast m as Rotor.ViewModel
                        if m.viewModelState.isFocused
                            return "#FF5500"
                        else if m.props.enabled
                            return "#0055FF"
                        else
                            return "#CCCCCC"
                        end if
                    end function
                }
            }, {
                id: "text",
                nodeType: "Label",
                fields: {
                    text: m.props.label,
                    width: 200,
                    height: 60,
                    horizAlign: "center",
                    vertAlign: "center",
                    color: "#FFFFFF"
                }
            }]
        }
    end function

    override sub onCreateView()
        ' Initialize ViewModel
        print "ButtonViewModel created"

        ' Access dispatcher state using convenience methods
        dispatcher = m.getDispatcher("appState")
        currentState = dispatcher.getState()

        ' Or use m.getStateFrom() convenience method
        currentState = m.getStateFrom("appState")

        ' Dispatch using convenience method
        m.dispatchTo("appState", { type: "BUTTON_CREATED" })
    end sub

end class

' Render the ViewModel
frameworkInstance.render({
    viewModel: ButtonViewModel
})
```

---

## Best Practices

When building ViewModels, consider these guidelines for maintainable and efficient code:

**Template Structure:**
- The `template()` method must return a single top-level widget configuration object
- The top widget in the template shares the same scope (`m`) as the ViewModel class itself
- All child widgets within the template can access `m.props` and `m.viewModelState`

**Props vs ViewModelState:**
- Use `props` for data that comes from external sources (parent ViewModels, dispatchers, render calls)
- Use `viewModelState` exclusively for internal ViewModel state that doesn't need to be exposed externally
- Props should be treated as read-only within the ViewModel; use `setProps()` to update them

**Handling UI Updates:**
- Always implement UI updates for both flows:
  - **Initial render**: Define the appearance in `template()` using props and viewModelState
  - **Update render**: Override `onUpdateView()` to handle subsequent prop changes
- The `setProps(newProps)` method appends new props to existing ones and automatically triggers `onUpdateView()`—useful for external modifications

**Public Methods:**
- Don't hesitate to implement public methods on your ViewModel class
- These methods can be called from parent ViewModels or other components via widget references
- Example: `m.children.myChildViewModel.customMethod()`

**Choosing Update Strategies:**
When updating the UI in `onUpdateView()`, you have several options:
- **`render()`**: Re-render specific widget subtrees with new configurations
- **`refresh()`**: Force re-evaluation of field expressions for the ViewModel
- **Direct node manipulation**: Modify `m.node` properties directly for simple updates

The choice depends on your requirements:
- For complex updates affecting multiple widgets, use `render()`
- For simple single-property updates, direct node manipulation is more performant
- Balance between code readability and runtime performance based on your use case

---

## 📚 Learn More

**NEXT STEP: [Fields Plugin](./view-builder-fields-plugin.md)**

**Reference Documentation:**
- [Framework Initialization](./framework-initialization.md) - Configuration, task synchronization, and lifecycle
- [ViewBuilder Overview](./view-builder-overview.md) - High-level architecture and concepts
- [Widget Reference](./view-builder-widget-reference.md) - Complete Widget properties, methods, and usage patterns

**Plugin Documentation:**
- [Fields Plugin](./view-builder-fields-plugin.md) - Field management with expressions and interpolation
- [FontStyle Plugin](./view-builder-fontstyle-plugin.md) - Typography and font styling
- [Observer Plugin](./view-builder-observer-plugin.md) - Field observation patterns
- [Focus Plugin](./view-builder-focus-plugin.md) - Focus management and navigation

**Additional Documentation:**
- [Cross-Thread MVI design pattern](./cross-thread-mvi.md) - State management across threads
- [Internationalization support](./i18n-support.md) - Locale-aware interface implementation
